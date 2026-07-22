import type { LeadKind } from '@/lib/db/schema';

const AUDIENCES = new Set(['BRANDS', 'AGENCIES', 'NJOS', 'MEDIAS']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NormalizedLead = {
  idempotencyKey: string;
  kind: LeadKind;
  audience: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  journeySlug: string | null;
  sourcePath: string;
  payload: Record<string, unknown>;
  consentGiven: true;
  consentAt: Date;
};

export class LeadValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'LeadValidationError';
  }
}

function sanitize(value: unknown, max = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>?/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function sanitizeJson(value: unknown, depth = 0): unknown {
  if (depth > 4) return null;
  if (typeof value === 'string') return sanitize(value, 2000);
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitizeJson(item, depth + 1));
  if (!value || typeof value !== 'object') return null;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 100)
      .map(([key, item]) => [sanitize(key, 80), sanitizeJson(item, depth + 1)])
      .filter(([key]) => Boolean(key))
  );
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function optionalEmail(value: unknown): string | null {
  const email = sanitize(value).toLowerCase();
  if (!email) return null;
  if (!EMAIL_PATTERN.test(email)) {
    throw new LeadValidationError('Please enter a valid email address.', {
      email: 'Invalid email address.',
    });
  }
  return email;
}

function requireConsent(payload: Record<string, unknown>) {
  if (payload.consent !== true) {
    throw new LeadValidationError('Consent is required before sending this request.', {
      consent: 'Consent is required.',
    });
  }
}

function normalizeKey(value: unknown): string {
  const key = sanitize(value, 100);
  return /^[a-zA-Z0-9_-]{8,100}$/.test(key) ? key : '';
}

function normalizeContact(payload: Record<string, unknown>): NormalizedLead {
  const audience = sanitize(payload.audience, 40).toUpperCase();
  if (!AUDIENCES.has(audience)) {
    throw new LeadValidationError('Please select a valid profile.', {
      audience: 'Invalid profile.',
    });
  }

  const answers = asObject(sanitizeJson(payload.answers));
  const meeting = asObject(answers['meeting-date']);
  const phone = sanitize(meeting.whatsapp, 80) || sanitize(payload.phone, 80);
  if (!phone) {
    throw new LeadValidationError('A WhatsApp or phone number is required.', {
      phone: 'Phone number is required.',
    });
  }

  const companyFields: Record<string, string> = {
    AGENCIES: 'agency-name',
    NJOS: 'ngo-name',
    MEDIAS: 'media-name',
  };
  const coreStepIds: Record<string, string> = {
    AGENCIES: 'agency-core',
    NJOS: 'ngo-core',
    MEDIAS: 'media-core',
  };
  const core = asObject(answers[coreStepIds[audience]]);
  const company = sanitize(core[companyFields[audience]]) || null;

  return {
    idempotencyKey: normalizeKey(payload.idempotencyKey),
    kind: 'contact',
    audience,
    name: sanitize(payload.name) || null,
    email: optionalEmail(payload.email),
    phone,
    company,
    journeySlug: null,
    sourcePath: '/contact',
    payload: { audience, answers },
    consentGiven: true,
    consentAt: new Date(),
  };
}

function normalizeBooking(payload: Record<string, unknown>): NormalizedLead {
  const name = sanitize(payload.name);
  const email = optionalEmail(payload.email);
  const company = sanitize(payload.company);
  const timeframe = sanitize(payload.timeframe);

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = 'Name is required.';
  if (!email) fieldErrors.email = 'Email is required.';
  if (!company) fieldErrors.company = 'Brand is required.';
  if (!timeframe) fieldErrors.timeframe = 'Shooting window is required.';
  if (Object.keys(fieldErrors).length) {
    throw new LeadValidationError('Please complete the required fields.', fieldErrors);
  }

  const focus = Array.isArray(payload.focus)
    ? payload.focus
        .map((item) => sanitize(item, 80))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  return {
    idempotencyKey: normalizeKey(payload.idempotencyKey),
    kind: 'journey_booking',
    audience: 'BRANDS',
    name,
    email,
    phone: sanitize(payload.phone, 80) || null,
    company,
    journeySlug: sanitize(payload.journeySlug, 120) || 'philippines',
    sourcePath: '/journeys/philippines',
    payload: {
      timeframe,
      crewSize: sanitize(payload.crewSize, 30),
      focus,
      message: sanitize(payload.message, 2000),
    },
    consentGiven: true,
    consentAt: new Date(),
  };
}

export function normalizeLeadSubmission(payload: unknown): NormalizedLead {
  const body = asObject(payload);
  requireConsent(body);
  const kind = sanitize(body.type, 40);
  if (kind === 'contact') return normalizeContact(body);
  if (kind === 'journey_booking') return normalizeBooking(body);
  throw new LeadValidationError('Invalid lead type.', { type: 'Invalid lead type.' });
}

export function hasHoneypot(payload: unknown): boolean {
  return Boolean(sanitize(asObject(payload).honeytoken));
}
