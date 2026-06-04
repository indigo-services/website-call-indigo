export type LeadFormKind = 'appointment' | 'commercial' | 'contact';

export type LeadFormField = {
  name: string;
  label: string;
  type: 'date' | 'email' | 'number' | 'select' | 'tel' | 'text' | 'textarea';
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type LeadFormConfig = {
  kind: LeadFormKind;
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  fields: LeadFormField[];
};

export const leadFormConfigs = {
  appointment: {
    kind: 'appointment',
    eyebrow: 'Book an appointment',
    title: 'Tell us what needs attention at the property.',
    description:
      'Share the address, timing, and service need so the Indigo team can coordinate the next opening.',
    submitLabel: 'Request appointment',
    successMessage:
      'Appointment request received. The Indigo team can follow up with available times once delivery is configured.',
    fields: [
      {
        name: 'fullName',
        label: 'Full name',
        type: 'text',
        required: true,
        placeholder: 'Jane Smith',
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        required: true,
        placeholder: '(512) 555-0123',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'jane@example.com',
      },
      {
        name: 'serviceAddress',
        label: 'Service address',
        type: 'text',
        required: true,
        placeholder: '1005 Meredith Drive, Austin, TX',
      },
      {
        name: 'serviceNeeded',
        label: 'Service needed',
        type: 'select',
        required: true,
        options: [
          'Plumbing',
          'Electrical',
          'HVAC',
          'Handyman or repairs',
          'Inspection',
          'Other',
        ],
      },
      {
        name: 'preferredDate',
        label: 'Preferred date',
        type: 'date',
      },
      {
        name: 'preferredWindow',
        label: 'Preferred time window',
        type: 'select',
        options: ['Morning', 'Afternoon', 'Evening', 'First available'],
      },
      {
        name: 'details',
        label: 'What should we know?',
        type: 'textarea',
        placeholder: 'Briefly describe the issue, access notes, or urgency.',
      },
    ],
  },
  commercial: {
    kind: 'commercial',
    eyebrow: 'Commercial services',
    title: 'Start a commercial or facility services conversation.',
    description:
      'Send property, company, and scope details so Indigo can route the inquiry as a commercial lead.',
    submitLabel: 'Request commercial follow-up',
    successMessage:
      'Commercial inquiry received. The Indigo team can route this to facility services once delivery is configured.',
    fields: [
      {
        name: 'fullName',
        label: 'Full name',
        type: 'text',
        required: true,
      },
      {
        name: 'company',
        label: 'Company',
        type: 'text',
        required: true,
      },
      {
        name: 'role',
        label: 'Role',
        type: 'text',
        placeholder: 'Property manager, owner, operations lead',
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        required: true,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
      },
      {
        name: 'facilityAddress',
        label: 'Facility address or service area',
        type: 'text',
        required: true,
      },
      {
        name: 'propertyCount',
        label: 'Number of properties',
        type: 'number',
        placeholder: '1',
      },
      {
        name: 'serviceCategory',
        label: 'Service category',
        type: 'select',
        required: true,
        options: [
          'Facility management',
          'Commercial maintenance',
          'Free facility inspection',
          'National partner services',
          'Other',
        ],
      },
      {
        name: 'desiredStart',
        label: 'Desired start',
        type: 'select',
        options: ['Urgent', 'This week', 'This month', 'Planning ahead'],
      },
      {
        name: 'details',
        label: 'Scope details',
        type: 'textarea',
        placeholder:
          'Share services, site access, recurring needs, or deadlines.',
      },
    ],
  },
  contact: {
    kind: 'contact',
    eyebrow: 'General contact',
    title: 'Send a general message to Indigo.',
    description:
      'Use this for questions, partnership conversations, or anything that is not ready for scheduling.',
    submitLabel: 'Send message',
    successMessage:
      'Message received. Indigo can reply once email or sheet delivery is configured.',
    fields: [
      {
        name: 'fullName',
        label: 'Full name',
        type: 'text',
        required: true,
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'tel',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
      },
      {
        name: 'topic',
        label: 'Topic',
        type: 'select',
        required: true,
        options: [
          'Residential services',
          'Commercial services',
          'Membership',
          'Billing or existing job',
          'Other',
        ],
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'How can the Indigo team help?',
      },
    ],
  },
} satisfies Record<LeadFormKind, LeadFormConfig>;

export const leadFormKinds = Object.keys(leadFormConfigs) as LeadFormKind[];
