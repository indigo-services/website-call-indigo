import type { PageConfig } from '../types';
import { homeHero } from '../sections/hero';
import { homeDataRibbon } from '../sections/data-ribbon';
import { homeValueProp } from '../sections/value-prop';
import { homeServicesGrid } from '../sections/services-grid';
import { homeBenefits } from '../sections/benefits';
import { homeProcessSteps } from '../sections/process-steps';
import { homeFinalCta } from '../sections/final-cta';

export const homePage: PageConfig = {
  navigation: [
    { label: 'Home', href: '#hero' },
    { label: 'Residential', href: '/residential' },
    { label: 'Commercial', href: '/commercial' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '/forms/contact' },
    { label: 'Call for a Consultation', href: 'tel:+15126084999' },
  ],
  seo: {
    title: 'Call Indigo — Home & Facility Services | Austin TX',
    description:
      'Call Indigo for reliable home and facility services — plumbing, electrical, HVAC, carpentry, remodeling, and more. Family owned, locally operated in Austin, TX since 2012. Serving Hays, Travis, and Williamson counties.',
  },
  sections: [
    homeHero,
    homeDataRibbon,
    homeValueProp,
    homeServicesGrid,
    homeBenefits,
    homeProcessSteps,
    homeFinalCta,
  ],
} as const;
