import type { PageConfig } from '../types';
import { residentialHero } from '../sections/hero';
import { residentialValueProp } from '../sections/value-prop';
import { residentialServicesGrid } from '../sections/services-grid';
import { residentialBenefits } from '../sections/benefits';
import { residentialFinalCta } from '../sections/final-cta';

export const residentialPage: PageConfig = {
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Residential', href: '#hero' },
    { label: 'Commercial', href: '/commercial' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '/forms/contact' },
    { label: 'Call for a Consultation', href: 'tel:+15126084999' },
  ],
  seo: {
    title: 'Indigo Homes — Residential Home Services & Membership | Austin TX',
    description:
      'Locally licensed and insured home services including plumbing, electrical, HVAC, carpentry, remodeling, painting, flooring, landscaping, handyman services, repairs, and more. Serving Hays, Travis, and Williamson counties since 2012.',
  },
  sections: [
    residentialHero,
    residentialValueProp,
    residentialServicesGrid,
    residentialBenefits,
    residentialFinalCta,
  ],
  footer: {
    extraLinks: [{ label: 'Indigo Facilities Landing Page', href: '/commercial' }],
  },
} as const;
