/* ─── Content module index ─── */
// Central re-exports for all content. Import from '@/content' in components.

export { site } from './shared/site';
export type { SiteConfig, NavItem, PageConfig, FooterConfig, Block } from './types';

/* ─── Section blocks ─── */
export { homeHero, commercialHero, residentialHero } from './sections/hero';
export { homeDataRibbon, commercialDataRibbon } from './sections/data-ribbon';
export { homeValueProp, residentialValueProp, commercialValueProp } from './sections/value-prop';
export { homeServicesGrid, residentialServicesGrid } from './sections/services-grid';
export { homeBenefits, residentialBenefits, commercialBenefits } from './sections/benefits';
export { homeProcessSteps } from './sections/process-steps';
export { homeFinalCta, residentialFinalCta, commercialFinalCta } from './sections/final-cta';

/* ─── Page configs ─── */
export { homePage } from './pages/home';
export { residentialPage } from './pages/residential';
export { commercialPage } from './pages/commercial';
