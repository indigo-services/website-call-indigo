import type { PageConfig } from '../types';
import { commercialHero } from '../sections/hero';
import { commercialDataRibbon } from '../sections/data-ribbon';
import { commercialValueProp } from '../sections/value-prop';
import { commercialBenefits } from '../sections/benefits';
import { commercialFinalCta } from '../sections/final-cta';

export const commercialPage: PageConfig = {
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Residential', href: '/residential' },
    { label: 'Commercial', href: '#hero' },
    { label: 'Services', href: '#about' },
    { label: 'Contact', href: '/forms/contact' },
    { label: 'Call for a Consultation', href: 'tel:+15126084999' },
  ],
  seo: {
    title: 'Indigo Facilities — Commercial & Facility Services | National Coverage',
    description:
      'Indigo Facilities provides national facility management, commercial maintenance, and insured facility partner services. 500+ crews, 250+ locations, all 50 states.',
  },
  sections: [
    commercialHero,
    commercialDataRibbon,
    commercialValueProp,
    commercialBenefits,
    commercialFinalCta,
  ],
  footer: {
    extraLinks: [{ label: 'Indigo Homes Landing Page', href: '/' }],
  },
} as const;
