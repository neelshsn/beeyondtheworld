import { NextResponse } from 'next/server';

import { hasHoneypot, LeadValidationError, normalizeLeadSubmission } from '@/lib/leads/normalize';
import { notifyLead } from '@/lib/leads/notify';
import { persistLead, updateNotification } from '@/lib/leads/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request payload is too large.' }, { status: 413 });
  }

  let payload: unknown;
  try {
    const rawPayload = await request.text();
    if (Buffer.byteLength(rawPayload, 'utf8') > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request payload is too large.' }, { status: 413 });
    }
    payload = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  // Les bots remplissant le champ invisible reçoivent une réponse neutre sans écriture.
  if (hasHoneypot(payload)) {
    return NextResponse.json({ success: true }, { status: 202 });
  }

  try {
    const normalized = normalizeLeadSubmission(payload);
    const { lead, created } = await persistLead(normalized);

    let notificationStatus = lead.notificationStatus;
    if (created || notificationStatus !== 'sent') {
      const notification = await notifyLead(lead);
      notificationStatus = notification.status;
      try {
        await updateNotification(
          lead.id,
          notification.status,
          'error' in notification ? notification.error : undefined
        );
      } catch (cause) {
        // La persistance du lead reste la source de vérité : une panne de suivi
        // de notification ne doit pas transformer un lead sauvegardé en faux échec.
        console.error('[lead] notification status update failed', cause);
        notificationStatus = 'failed';
      }
    }

    return NextResponse.json({
      success: true,
      reference: lead.reference,
      notificationStatus,
      duplicate: !created,
      message: 'Your request has been saved. Our team will be in touch soon.',
    });
  } catch (cause) {
    if (cause instanceof LeadValidationError) {
      return NextResponse.json(
        { error: cause.message, fieldErrors: cause.fieldErrors },
        { status: 400 }
      );
    }
    console.error('[lead] submission error', cause);
    return NextResponse.json(
      {
        error:
          'We could not save your request. Please try again or reach us at hello@beeyondtheworld.com.',
      },
      { status: 500 }
    );
  }
}
