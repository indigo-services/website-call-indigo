import type { HeroBlock } from '../types';

/* ─── Home hero ─── */
export const homeHero: HeroBlock = {
  __type: 'hero',
  subheading: 'Call Indigo',
  title: 'Family Owned, Locally Operated',
  body: 'Call Indigo is your single phone call for any address. Licensed, insured, and headquartered in Austin, Texas since 2012 — serving homes and facilities across the USA.',
  primaryCta: { label: 'Commercial', href: '/commercial' },
  secondaryCta: { label: 'Book an Appointment', href: '/forms/appointment' },
  phoneLabel: 'Call today',
  proof: [
    'Proudly Serving Hays, Travis, and Williamson counties',
    'Call today: (512) 608-4999',
  ],
  image: {
    src: '/images/hero.jpg',
    alt: 'Call Indigo — reliable home and facility services team',
  },
} as const;

/* ─── Commercial hero ─── */
export const commercialHero: HeroBlock = {
  __type: 'hero',
  sectionLabel: 'Commercial & facility services',
  title: 'Love Your Facility Forever.',
  body: 'Hire our national and insured facility services partners. And join our membership to achieve peace of mind with all things related to your facility.',
  primaryCta: { label: 'Book an Appointment', href: '/forms/commercial' },
  phoneLabel: 'Call for a Consultation',
} as const;

/* ─── Residential hero ─── */
export const residentialHero: HeroBlock = {
  __type: 'hero',
  sectionLabel: 'Call Indigo',
  title: 'Love Your Home Forever.',
  body: 'Hire our locally licensed and insured home services crews. And join our membership to achieve peace of mind with all things related to your home.',
  primaryCta: { label: 'Book an Appointment', href: '/forms/appointment' },
  secondaryCta: { label: 'Commercial', href: '/commercial' },
  phoneLabel: 'Call for a Consultation',
  proof: [
    'Headquartered: Austin, TX',
    'Established: 2012',
    'Family owned, Locally operated',
    'Local Service Area: Hays, Travis, and Williamson counties (Austin, Buda, Kyle, San Marcos)',
  ],
  image: {
    src: '/images/hero.jpg',
    alt: 'Indigo Homes — locally licensed and insured residential services in Austin TX',
  },
} as const;
