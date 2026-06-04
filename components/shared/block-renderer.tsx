'use client';

import { Clock, MapPin, Phone } from 'lucide-react';
import { Shell } from './primitives';
import { HeroSection } from './sections/hero-section';
import { DataRibbonSection } from './sections/data-ribbon-section';
import { ValuePropSection } from './sections/value-prop-section';
import { ServicesGridSection } from './sections/services-grid-section';
import { BenefitsSection } from './sections/benefits-section';
import { ProcessStepsSection } from './sections/process-steps-section';
import { FinalCtaSection } from './sections/final-cta-section';
import type { Block, NavItem, FooterConfig, SiteConfig } from '@/content/types';

/* ─── Block renderer ─── */
export function BlockRenderer({
  block,
  site,
}: {
  block: Block;
  site: SiteConfig;
}) {
  switch (block.__type) {
    case 'hero':
      return <HeroSection data={block} site={site} />;
    case 'data-ribbon':
      return <DataRibbonSection data={block} />;
    case 'value-prop':
      return <ValuePropSection data={block} />;
    case 'services-grid':
      return <ServicesGridSection data={block} />;
    case 'benefits':
      return <BenefitsSection data={block} site={site} />;
    case 'process-steps':
      return <ProcessStepsSection data={block} />;
    case 'final-cta':
      return <FinalCtaSection data={block} site={site} />;
    default:
      return null;
  }
}

/* ─── Page shell: header + main sections + footer ─── */
export function PageLayout({
  navigation,
  sections,
  site,
  footer,
  heroPhoneLabel,
}: {
  navigation: readonly NavItem[];
  sections: readonly Block[];
  site: SiteConfig;
  footer?: FooterConfig;
  heroPhoneLabel: string;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-[#1e1b4b] selection:text-white">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1e1b4b] px-4 py-2 text-xs text-white md:px-12">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#818cf8]" />
              <span>Residential &amp; commercial services</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#818cf8]" />
              <span>{site.serviceArea}</span>
            </div>
          </div>
          <span>
            Est. {site.establishedYear} &middot; {site.legalName}
          </span>
        </div>

        <Shell className="flex items-center justify-between gap-6 py-4">
          <a href="#hero" className="flex items-center gap-2">
            <div className="rounded-full bg-[#1e1b4b] p-2">
              <Phone className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold tracking-[-0.06em] text-[#1e1b4b]">
              {site.brandName}
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#1e1b4b] lg:flex">
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full bg-indigo-50 p-2">
              <Phone className="text-[#1e1b4b]" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">
                {heroPhoneLabel}
              </p>
              <a
                href={`tel:${site.primaryPhone.replace(/[^\+\\d]/g, '')}`}
                className="text-sm font-bold text-[#1e1b4b]"
              >
                {site.primaryPhone}
              </a>
            </div>
          </div>
        </Shell>
      </header>

      {/* ── Main sections ── */}
      <main>
        {sections.map((block, index) => (
          <BlockRenderer key={`${block.__type}-${index}`} block={block} site={site} />
        ))}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#1e1b4b] py-12 text-white">
        <Shell>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-2xl font-black tracking-[-0.06em]">
                {site.brandName}
              </p>
              <p className="mt-1 text-sm text-white/70">{site.legalName}</p>
              <p className="mt-1 text-xs text-white/50">
                License: {site.licenseNumber}
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/70">
              {navigation.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
              {footer?.extraLinks?.map((link) => (
                <a key={link.href} href={link.href} className="text-white/70 hover:text-white">
                  {link.label}
                </a>
              ))}
              <span className="text-white/40">|</span>
              <a href="#" className="text-white/70 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-white/70 hover:text-white">
                Terms of Service
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-xs text-white/40">
            &copy; {site.establishedYear}&ndash;{new Date().getFullYear()}{' '}
            {site.copyrightName}. All rights reserved.
          </div>
        </Shell>
      </footer>
    </div>
  );
}
