/* ─── Backwards-compatible re-export ─── */
// This file re-exports the monolithic content object so existing imports
// (`import { indigoWebsiteContent } from '@/content/indigo-website'`) keep
// working. New code should import from '@/content' directly.
//
// Once all consumers are migrated, this file can be removed.

import { site } from './shared/site';
import { homePage } from './pages/home';
import { residentialPage } from './pages/residential';
import { commercialPage } from './pages/commercial';

export const indigoWebsiteContent = {
  site,
  navigation: homePage.navigation,
  home: {
    navigation: homePage.navigation,
    seo: homePage.seo,
    hero: homePage.sections.find((s): s is Extract<typeof s, { __type: 'hero' }> => s.__type === 'hero')!,
    valueProp: homePage.sections.find((s): s is Extract<typeof s, { __type: 'value-prop' }> => s.__type === 'value-prop')!,
    dataRibbon: homePage.sections.find((s): s is Extract<typeof s, { __type: 'data-ribbon' }> => s.__type === 'data-ribbon')!,
    services: homePage.sections.find((s): s is Extract<typeof s, { __type: 'services-grid' }> => s.__type === 'services-grid')!.items,
    benefits: homePage.sections.find((s): s is Extract<typeof s, { __type: 'benefits' }> => s.__type === 'benefits')!,
    process: homePage.sections.find((s): s is Extract<typeof s, { __type: 'process-steps' }> => s.__type === 'process-steps')!.steps,
    finalCta: homePage.sections.find((s): s is Extract<typeof s, { __type: 'final-cta' }> => s.__type === 'final-cta')!,
  },
  residential: {
    navigation: residentialPage.navigation,
    seo: residentialPage.seo,
    hero: residentialPage.sections.find((s): s is Extract<typeof s, { __type: 'hero' }> => s.__type === 'hero')!,
    managementSection: residentialPage.sections.find((s): s is Extract<typeof s, { __type: 'value-prop' }> => s.__type === 'value-prop')!.darkCard,
    servicesSection: residentialPage.sections.find((s): s is Extract<typeof s, { __type: 'value-prop' }> => s.__type === 'value-prop')!.lightCard,
    benefits: residentialPage.sections.find((s): s is Extract<typeof s, { __type: 'benefits' }> => s.__type === 'benefits')!,
  },
  commercial: {
    navigation: commercialPage.navigation,
    seo: commercialPage.seo,
    hero: commercialPage.sections.find((s): s is Extract<typeof s, { __type: 'hero' }> => s.__type === 'hero')!,
    dataRibbon: commercialPage.sections.find((s): s is Extract<typeof s, { __type: 'data-ribbon' }> => s.__type === 'data-ribbon')!,
    managementSection: commercialPage.sections.find((s): s is Extract<typeof s, { __type: 'value-prop' }> => s.__type === 'value-prop')!.darkCard,
    partnersSection: commercialPage.sections.find((s): s is Extract<typeof s, { __type: 'value-prop' }> => s.__type === 'value-prop')!.lightCard,
    benefits: commercialPage.sections.find((s): s is Extract<typeof s, { __type: 'benefits' }> => s.__type === 'benefits')!,
    footer: {
      residentialLink: commercialPage.footer?.extraLinks?.[0]
        ? { label: commercialPage.footer.extraLinks[0].label, href: commercialPage.footer.extraLinks[0].href }
        : { label: 'Indigo Homes Landing Page', href: '/' },
    },
  },
} as const;

export type IndigoWebsiteContent = typeof indigoWebsiteContent;
