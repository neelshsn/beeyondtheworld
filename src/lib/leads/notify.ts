import 'server-only';

import type { LeadSubmissionRow } from '@/lib/db';
import { getSupabaseServerClient } from '@/lib/supabase/server-client';

export type NotificationResult =
  | { status: 'sent' }
  | { status: 'not_configured' }
  | { status: 'failed'; error: string };

export async function notifyLead(lead: LeadSubmissionRow): Promise<NotificationResult> {
  const functionName = process.env.SUPABASE_CONTACT_NOTIFICATION_FUNCTION;
  if (!functionName) return { status: 'not_configured' };

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.functions.invoke(functionName, {
      body: {
        reference: lead.reference,
        type: lead.kind,
        audience: lead.audience,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        journeySlug: lead.journeySlug,
        sourcePath: lead.sourcePath,
        payload: lead.payload,
        createdAt: lead.createdAt.toISOString(),
      },
    });
    if (error) throw error;
    return { status: 'sent' };
  } catch (cause) {
    return {
      status: 'failed',
      error: cause instanceof Error ? cause.message : 'Notification failed.',
    };
  }
}
