import { NextResponse } from 'next/server';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { type LeadFormKind, leadFormKinds } from '@/content/lead-forms';

type LeadFormPayload = {
  fields?: Record<string, unknown>;
  leadType?: LeadFormKind;
  sourcePath?: string;
};

type DeliveryMode = 'email' | 'file' | 'webhook';
type DeliveryResult = {
  configured: boolean;
  ok: boolean;
  target: DeliveryMode;
  path?: string;
  status?: number;
};

const requiredFieldsByLeadType: Record<LeadFormKind, string[]> = {
  appointment: ['fullName', 'phone', 'serviceAddress', 'serviceNeeded'],
  commercial: [
    'fullName',
    'company',
    'phone',
    'email',
    'facilityAddress',
    'serviceCategory',
  ],
  contact: ['fullName', 'email', 'topic', 'message'],
};

function cleanFields(fields: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([key]) => key !== 'leadType')
      .map(([key, value]) => [key, String(value ?? '').trim()])
      .filter(([key, value]) => key.length > 0 && value.length > 0)
  );
}

function isLeadFormKind(value: unknown): value is LeadFormKind {
  return (
    typeof value === 'string' && leadFormKinds.includes(value as LeadFormKind)
  );
}

function buildLead(payload: LeadFormPayload) {
  if (!isLeadFormKind(payload.leadType)) {
    throw new Error('Choose a valid inquiry type.');
  }

  const fields = cleanFields(payload.fields);
  const missingFields = requiredFieldsByLeadType[payload.leadType].filter(
    (field) => !fields[field]
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return {
    fields,
    leadType: payload.leadType,
    receivedAt: new Date().toISOString(),
    sourcePath: payload.sourcePath || 'unknown',
  };
}

function getDeliveryModes() {
  const configuredValue = process.env.LEAD_FORM_DELIVERY?.trim();

  if (configuredValue) {
    const requestedModes = configuredValue
      .split(',')
      .map((mode) => mode.trim().toLowerCase())
      .filter(Boolean);

    if (requestedModes.includes('none')) {
      return new Set<DeliveryMode>();
    }

    if (requestedModes.includes('all')) {
      return new Set<DeliveryMode>(['email', 'file', 'webhook']);
    }

    return new Set(
      requestedModes.filter((mode): mode is DeliveryMode =>
        ['email', 'file', 'webhook'].includes(mode)
      )
    );
  }

  const inferredModes = new Set<DeliveryMode>();

  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.LEAD_FORM_FILE_PATH
  ) {
    inferredModes.add('file');
  }

  if (
    process.env.RESEND_API_KEY &&
    process.env.LEAD_FORM_EMAIL_FROM &&
    process.env.LEAD_FORM_EMAIL_TO
  ) {
    inferredModes.add('email');
  }

  if (
    process.env.LEAD_FORM_GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.LEAD_FORM_WEBHOOK_URL
  ) {
    inferredModes.add('webhook');
  }

  return inferredModes;
}

async function deliverToFile(
  lead: ReturnType<typeof buildLead>
): Promise<DeliveryResult> {
  const filePath =
    process.env.LEAD_FORM_FILE_PATH ||
    path.join(process.cwd(), '.tmp', 'leads.jsonl');

  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(lead)}\n`, 'utf8');

  return { configured: true, ok: true, path: filePath, target: 'file' };
}

async function deliverToWebhook(
  lead: ReturnType<typeof buildLead>
): Promise<DeliveryResult> {
  const webhookUrl =
    process.env.LEAD_FORM_GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.LEAD_FORM_WEBHOOK_URL;

  if (!webhookUrl) {
    return { configured: false, ok: false, target: 'webhook' };
  }

  const response = await fetch(webhookUrl, {
    body: JSON.stringify(lead),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  return {
    configured: true,
    ok: response.ok,
    status: response.status,
    target: 'webhook',
  };
}

async function deliverToEmail(
  lead: ReturnType<typeof buildLead>
): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FORM_EMAIL_FROM;
  const to = process.env.LEAD_FORM_EMAIL_TO;

  if (!apiKey || !from || !to) {
    return { configured: false, ok: false, target: 'email' };
  }

  const text = [
    `Lead type: ${lead.leadType}`,
    `Source: ${lead.sourcePath}`,
    `Received: ${lead.receivedAt}`,
    '',
    ...Object.entries(lead.fields).map(([key, value]) => `${key}: ${value}`),
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from,
      subject: `New ${lead.leadType} lead from call-indigo.com`,
      text,
      to: [to],
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return {
    configured: true,
    ok: response.ok,
    status: response.status,
    target: 'email',
  };
}

async function deliverLead(lead: ReturnType<typeof buildLead>) {
  const deliveryModes = getDeliveryModes();
  const deliveryTasks = [
    deliveryModes.has('file') ? deliverToFile(lead) : undefined,
    deliveryModes.has('webhook') ? deliverToWebhook(lead) : undefined,
    deliveryModes.has('email') ? deliverToEmail(lead) : undefined,
  ].filter((task): task is Promise<DeliveryResult> => Boolean(task));

  if (deliveryTasks.length === 0) {
    return {
      delivered: false,
      deliveryConfigured: false,
      results: [] as DeliveryResult[],
    };
  }

  const results = await Promise.all(deliveryTasks);

  return {
    delivered: results.some((result) => result.ok),
    deliveryConfigured: results.some((result) => result.configured),
    results,
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadFormPayload;
    const lead = buildLead(payload);
    const { delivered, deliveryConfigured, results } = await deliverLead(lead);

    if (deliveryConfigured && !delivered) {
      return NextResponse.json(
        {
          delivery: results,
          message:
            'Submission validated, but configured delivery failed. Please call Indigo directly.',
        },
        { status: 502 }
      );
    }

    console.info('Indigo website lead received', lead);

    return NextResponse.json(
      {
        delivery: results,
        leadType: lead.leadType,
        message: deliveryConfigured
          ? delivered
            ? 'Submission received. Indigo will follow up soon.'
            : 'Submission validated, but delivery did not complete.'
          : 'Submission validated. Configure file, email, webhook, or Strapi delivery before relying on submissions.',
      },
      { status: deliveryConfigured ? 200 : 202 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Could not submit this inquiry.',
      },
      { status: 400 }
    );
  }
}
