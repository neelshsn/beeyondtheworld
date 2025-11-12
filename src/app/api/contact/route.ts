import { NextResponse } from 'next/server';

import { isDemoMode } from '@/lib/supabase/demo-client';
import { getSupabaseServerClient } from '@/lib/supabase/server-client';

const CONTACT_METHODS = new Set(['email', 'whatsapp', 'call']);
const ORIGIN = 'beeyondtheworld-platform';
const SUCCESS_MESSAGE = "Your journey begins here ✨🐝 We'll be in touch soon.";

function sanitize(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeLong(value: unknown, max = 2000): string {
  return sanitize(value).slice(0, max);
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const honeytoken = sanitize(payload.honeytoken);
  if (honeytoken) {
    return NextResponse.json({ success: true });
  }

  const name = sanitize(payload.name);
  const email = sanitize(payload.email).toLowerCase();
  const brand = sanitize(payload.brand);
  const journeyId = sanitize(payload.journeyId);
  const campaignId = sanitize(payload.campaignId);
  const journeyTitle = sanitize(payload.journeyTitle);
  const campaignTitle = sanitize(payload.campaignTitle);
  const projectNotes = sanitizeLong(payload.projectNotes);
  const preferredDateRaw = sanitize(payload.preferredDate);

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = 'Name is required.';
  if (!email) {
    fieldErrors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (Object.keys(fieldErrors).length) {
    return NextResponse.json(
      { error: 'Please correct the highlighted fields.', fieldErrors },
      { status: 400 }
    );
  }

  const contactMethodsRaw = Array.isArray(payload.contactMethods) ? payload.contactMethods : [];
  const contactMethods = contactMethodsRaw
    .map((method) => sanitize(method))
    .filter((method) => CONTACT_METHODS.has(method));

  if (!contactMethods.length) {
    contactMethods.push('email');
  }

  const preferredDate =
    preferredDateRaw && !Number.isNaN(Date.parse(preferredDateRaw))
      ? new Date(preferredDateRaw).toISOString().split('T')[0]
      : null;

  const record = {
    name,
    email,
    brand: brand || null,
    journey_id: journeyId || null,
    journey_title: journeyTitle || null,
    campaign_id: campaignId || null,
    campaign_title: campaignTitle || null,
    project_notes: projectNotes || null,
    contact_methods: contactMethods,
    preferred_date: preferredDate,
    origin: ORIGIN,
  };

  if (isDemoMode()) {
    console.info('[contact] demo submission captured', record);
    return NextResponse.json({ success: true, message: SUCCESS_MESSAGE, demo: true });
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from('contact_requests').insert(record);
    if (error) throw error;

    const functionName = process.env.SUPABASE_CONTACT_NOTIFICATION_FUNCTION;
    if (functionName) {
      try {
        await supabase.functions.invoke(functionName, {
          body: { ...record, message: SUCCESS_MESSAGE },
        });
      } catch (notifyError) {
        console.error('[contact] notification error', notifyError);
      }
    }

    return NextResponse.json({ success: true, message: SUCCESS_MESSAGE });
  } catch (error) {
    console.error('[contact] submission error', error);
    return NextResponse.json(
      {
        error:
          'We could not save your request. Please try again or reach us at hello@beeyondtheworld.com.',
      },
      { status: 500 }
    );
  }
}
