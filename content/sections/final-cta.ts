import type { FinalCtaBlock } from '../types';

/* ─── Home final CTA ─── */
export const homeFinalCta: FinalCtaBlock = {
  __type: 'final-cta',
  label: 'Contact',
  title: 'Call Indigo for the address that needs attention',
  subtitle: 'Tell us what kind of property you have and what needs to be repaired, scoped, or coordinated.',
  cta: { label: 'Call (512) 608-4999', href: 'tel:+15126084999' },
  secondaryCta: { label: 'Contact', href: '/forms/contact' },
  contactInfo: {
    location: '1005 Meredith Drive, Austin, TX 78748',
  },
} as const;

/* ─── Residential final CTA ─── */
export const residentialFinalCta: FinalCtaBlock = {
  __type: 'final-cta',
  label: 'Contact',
  title: 'Call Indigo for the address that needs attention',
  subtitle: 'Tell us what kind of property you have and what needs to be repaired, scoped, or coordinated.',
  cta: { label: 'Call (512) 608-4999', href: 'tel:+15126084999' },
  secondaryCta: { label: 'Book an Appointment', href: '/forms/appointment' },
  contactInfo: {
    location: '1005 Meredith Drive, Austin, TX 78748',
  },
} as const;

/* ─── Commercial final CTA ─── */
export const commercialFinalCta: FinalCtaBlock = {
  __type: 'final-cta',
  label: 'Contact',
  title: 'Call Call Indigo for your commercial property',
  subtitle: 'Tell us about your facility and we will build a custom maintenance strategy with a free inspection.',
  cta: { label: 'Call (512) 608-4999', href: 'tel:+15126084999' },
  secondaryCta: { label: 'Residential', href: '/' },
  contactInfo: {
    location: 'Austin, TX · National coverage',
  },
} as const;
