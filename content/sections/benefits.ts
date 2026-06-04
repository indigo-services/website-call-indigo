import type { BenefitsBlock } from '../types';

/* ─── Home benefits ─── */
export const homeBenefits: BenefitsBlock = {
  __type: 'benefits',
  label: 'Why Call Indigo',
  title: 'Why choose Call Indigo',
  subtitle: 'Serving Hays, Travis, and Williamson counties since 2012. Licensed, bonded, and insured for your peace of mind.',
  cta: { label: 'Call (512) 608-4999', href: 'tel:+15126084999' },
  items: [
    {
      label: 'Free property inspection',
      body: 'Every new customer receives a free inspection of their entire address to identify all options to maximize property value over time.',
    },
    {
      label: 'Discounted rates',
      body: 'We offer discounted rates for senior citizens, military, and members.',
    },
    {
      label: 'One call, any service',
      body: 'From plumbing to remodeling — one phone call covers every service your home or property needs.',
    },
    {
      label: 'Local & trusted',
      body: 'Headquartered in Austin, TX. Family owned and locally operated since 2012. Licensed, bonded, and insured.',
    },
  ],
} as const;

/* ─── Residential benefits ─── */
export const residentialBenefits: BenefitsBlock = {
  __type: 'benefits',
  label: 'Why Call Indigo',
  title: 'All new customers receive a free inspection',
  subtitle: 'A complete inspection of your entire address to identify all options to maximize property value over time.',
  cta: { label: 'Schedule Inspection', href: '/forms/appointment' },
  items: [
    {
      label: 'Free property inspection',
      body: 'Every new customer receives a free inspection of their entire address to identify all options to maximize property value over time.',
    },
    {
      label: 'Discounted rates',
      body: 'We offer discounted rates for all of our services to senior citizens, military, and members.',
    },
    {
      label: 'One call, any service',
      body: 'From plumbing to remodeling — one phone call covers every service your home or property needs.',
    },
    {
      label: 'Local & trusted',
      body: 'Headquartered in Austin, TX. Family owned and locally operated since 2012. Licensed, bonded, and insured.',
    },
  ],
} as const;

/* ─── Commercial benefits ─── */
export const commercialBenefits: BenefitsBlock = {
  __type: 'benefits',
  label: 'Why Call Indigo',
  title: 'All new customers receive a free inspection',
  subtitle: 'Call Indigo provides national facility management with (512) 608-4999. Licensed, bonded, and insured across all 50 states.',
  cta: { label: 'Schedule Inspection', href: '/forms/commercial' },
  items: [
    {
      label: 'Free facility inspection',
      body: 'Every new customer receives a complete inspection of their entire address to identify options to optimize facility maintenance.',
    },
    {
      label: 'FM scope program',
      body: 'Define and optimize your facility maintenance strategy to predict current and future demands.',
    },
    {
      label: 'National crew network',
      body: '500+ crews across 250+ locations ready to service your commercial properties nationwide.',
    },
    {
      label: 'Insured & licensed',
      body: 'Nationally insured facility services with professional, vetted crews for every job.',
    },
  ],
} as const;
