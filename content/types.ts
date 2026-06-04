/* ─── Block type discriminators ─── */
// Each section block carries a `__type` field matching the key used by
// BlockRenderer. On a future Strapi migration this maps 1:1 to the
// `__component` discriminator in dynamic zones.

/* ─── Site-wide config (global, not a block) ─── */
export type SiteConfig = {
  brandName: string;
  legalName: string;
  primaryPhone: string;
  publicEmail: string;
  publicEmailDisplay: string;
  address: string;
  headquartersCity: string;
  establishedYear: string;
  serviceAreaCities: readonly string[];
  serviceArea: string;
  licenseNumber: string;
  copyrightName: string;
};

export type NavItem = { label: string; href: string };

/* ─── Section block types ─── */

export type HeroBlock = {
  __type: 'hero';
  sectionLabel?: string;
  subheading?: string;
  title: string;
  body: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  phoneLabel: string;
  proof?: readonly string[];
  image?: { src: string; alt: string };
};

export type DataRibbonBlock = {
  __type: 'data-ribbon';
  items: readonly { value: string; label: string }[];
};

export type ValuePropBlock = {
  __type: 'value-prop';
  label?: string;
  title: string;
  subtitle?: string;
  darkCard: {
    cardLabel: string;
    title: string;
    body: string;
    cta: { label: string; href: string };
  };
  lightCard: {
    cardLabel: string;
    title: string;
    body: string;
    link: { label: string; href: string };
  };
};

export type ServicesGridBlock = {
  __type: 'services-grid';
  label?: string;
  title: string;
  subtitle: string;
  items: readonly {
    title: string;
    body: string;
    icon: string;
  }[];
};

export type BenefitsBlock = {
  __type: 'benefits';
  label: string;
  title: string;
  subtitle: string;
  cta?: { label: string; href: string };
  items: readonly {
    label: string;
    body: string;
  }[];
};

export type ProcessStepsBlock = {
  __type: 'process-steps';
  label?: string;
  title: string;
  steps: readonly {
    title: string;
    body: string;
  }[];
};

export type FinalCtaBlock = {
  __type: 'final-cta';
  label: string;
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  contactInfo: {
    location: string;
  };
};

export type FooterConfig = {
  extraLinks?: readonly { label: string; href: string }[];
};

/* ─── Union type for BlockRenderer ─── */
export type Block =
  | HeroBlock
  | DataRibbonBlock
  | ValuePropBlock
  | ServicesGridBlock
  | BenefitsBlock
  | ProcessStepsBlock
  | FinalCtaBlock;

/* ─── Page config ─── */
export type PageConfig = {
  navigation: readonly NavItem[];
  seo: { title: string; description: string };
  sections: readonly Block[];
  footer?: FooterConfig;
};
