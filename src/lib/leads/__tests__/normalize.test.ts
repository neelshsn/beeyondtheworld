import { describe, expect, it } from 'vitest';

import { LeadValidationError, normalizeLeadSubmission } from '../normalize';

const meeting = {
  'meeting-date': { date: '2026-08-10', time: '10:30', whatsapp: '+33 6 12 34 56 78' },
};

describe('normalizeLeadSubmission', () => {
  it.each([
    ['BRANDS', {}],
    ['AGENCIES', { 'agency-core': { 'agency-name': 'Atelier North', 'agency-location': 'Paris' } }],
    ['NJOS', { 'ngo-core': { 'ngo-name': 'Ocean Trust', 'ngo-location': 'Manila' } }],
    ['MEDIAS', { 'media-core': { 'media-name': 'Future Edit', 'media-location': 'London' } }],
  ])('normalizes a %s contact request', (audience, profileAnswers) => {
    const lead = normalizeLeadSubmission({
      type: 'contact',
      audience,
      answers: { ...profileAnswers, ...meeting },
      consent: true,
      idempotencyKey: `request-${audience.toLowerCase()}`,
    });

    expect(lead.kind).toBe('contact');
    expect(lead.audience).toBe(audience);
    expect(lead.phone).toBe('+33 6 12 34 56 78');
    expect(lead.consentGiven).toBe(true);
  });

  it('normalizes the Philippines booking payload', () => {
    const lead = normalizeLeadSubmission({
      type: 'journey_booking',
      journeySlug: 'philippines',
      company: 'Maison Test',
      name: 'Camille Test',
      email: 'CAMILLE@EXAMPLE.COM',
      phone: '+33 6 00 00 00 00',
      timeframe: 'October 2026',
      crewSize: '8',
      focus: ['film', 'underwater'],
      message: '<b>Launch film</b>',
      consent: true,
      idempotencyKey: 'booking-philippines-1',
    });

    expect(lead.kind).toBe('journey_booking');
    expect(lead.email).toBe('camille@example.com');
    expect(lead.journeySlug).toBe('philippines');
    expect(lead.payload.message).toBe('Launch film');
  });

  it('rejects a request without consent', () => {
    expect(() =>
      normalizeLeadSubmission({ type: 'contact', audience: 'BRANDS', answers: meeting })
    ).toThrow(LeadValidationError);
  });

  it('rejects a contact request without a recoverable phone number', () => {
    expect(() =>
      normalizeLeadSubmission({
        type: 'contact',
        audience: 'BRANDS',
        answers: {},
        consent: true,
      })
    ).toThrow('A WhatsApp or phone number is required.');
  });
});
