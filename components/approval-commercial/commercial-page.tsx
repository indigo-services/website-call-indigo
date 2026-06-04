'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { indigoWebsiteContent } from '@/content/indigo-website';
import { storeFormOrigin, restoreScrollOnReturn } from '@/lib/lead-form-origin';

/* ─── Shared primitives (same pattern as approval-home) ─── */

function Shell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1440px] px-4 md:px-12 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  light = false,
  center = true,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={center ? 'text-center' : ''}>
      <h2
        className={`text-4xl font-black leading-[1.05] tracking-[-0.04em] md:text-5xl ${light ? 'text-white' : 'text-[#1e1b4b]'}`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mx-auto mt-6 max-w-3xl text-sm leading-relaxed md:text-base ${light ? 'text-white/75' : 'text-slate-500'}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Label({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`mb-4 text-xs font-bold uppercase tracking-[0.3em] ${light ? 'text-white/70' : 'text-[#1e1b4b]'}`}
    >
      {children}
    </p>
  );
}

function CtaLink({
  href,
  children,
  light = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
  onClick?: React.MouseEventHandler;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-extrabold transition hover:-translate-y-0.5 ${
        light
          ? 'bg-white text-[#1e1b4b] hover:bg-slate-100'
          : 'bg-[#1e1b4b] text-white hover:bg-[#0f172a]'
      }`}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

/* ─── Animation variants ─── */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Page component ─── */

export function CommercialPage() {
  const { site, commercial } = indigoWebsiteContent;
  const navigation = commercial.navigation;

  useEffect(() => { restoreScrollOnReturn(); }, []);

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
                {commercial.hero.phoneLabel}
              </p>
              <a
                href={`tel:${site.primaryPhone.replace(/[^+\\d]/g, '')}`}
                className="text-sm font-bold text-[#1e1b4b]"
              >
                {site.primaryPhone}
              </a>
            </div>
          </div>
        </Shell>
      </header>

      <main>
        {/* ── Hero ── */}
        <section
          id="hero"
          className="relative overflow-hidden bg-[linear-gradient(135deg,#1e1b4b_0%,#0f172a_100%)]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />
          </div>
          <Shell className="py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              className="mx-auto max-w-4xl text-center text-white"
            >
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-[#818cf8]">
                Commercial &amp; facility services
              </p>
              <h1 className="mb-8 text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl lg:text-7xl">
                {commercial.hero.title}
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
                {commercial.hero.body}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <CtaLink href={commercial.hero.cta.href} light onClick={storeFormOrigin}>
                  {commercial.hero.cta.label}
                  <ArrowRight size={18} className="ml-2" />
                </CtaLink>
                <a
                  href={`tel:${site.primaryPhone.replace(/[^+\\d]/g, '')}`}
                  className="text-sm font-black uppercase tracking-[0.2em] text-white underline-offset-8 hover:underline"
                >
                  {commercial.hero.phoneLabel}: {site.primaryPhone}
                </a>
              </div>
            </motion.div>
          </Shell>
        </section>

        {/* ── Data ribbon ── */}
        <section className="border-b border-slate-100 bg-slate-50 py-10">
          <Shell>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.6 }}
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
            >
              {commercial.dataRibbon.items.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="text-center"
                >
                  <p className="text-3xl font-black tracking-[-0.04em] text-[#1e1b4b] md:text-4xl">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </Shell>
        </section>

        {/* ── Two-column: Facility Management + Facility Partners ── */}
        <section id="about" className="py-24">
          <Shell>
            <SectionTitle
              title="National crews, full range of services"
              subtitle={`From facility management memberships to insured partner services — ${site.brandName} supports commercial properties across all 50 states.`}
            />
            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              {/* Management card (dark) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[40px] bg-[#1e1b4b] p-10 text-white md:p-12"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#818cf8]/20">
                  <Building2 size={28} className="text-[#818cf8]" />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#818cf8]">
                  {commercial.managementSection.label}
                </p>
                <h3 className="mb-6 text-3xl font-black tracking-[-0.04em]">
                  {commercial.managementSection.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/80">
                  {commercial.managementSection.body}
                </p>
                <div className="mt-8">
                  <CtaLink href={commercial.managementSection.cta.href} light onClick={storeFormOrigin}>
                    {commercial.managementSection.cta.label}
                    <ArrowRight size={18} className="ml-2" />
                  </CtaLink>
                </div>
              </motion.div>

              {/* Partners card (light) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-[40px] border border-slate-200 bg-white p-10 shadow-xl md:p-12"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                  <ShieldCheck size={28} className="text-[#1e1b4b]" />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#1e1b4b]">
                  {commercial.partnersSection.label}
                </p>
                <h3 className="mb-6 text-3xl font-black tracking-[-0.04em] text-[#1e1b4b]">
                  {commercial.partnersSection.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {commercial.partnersSection.body}
                </p>
                <div className="mt-8">
                  <Link
                    href="/forms/commercial"
                    className="inline-flex items-center text-sm font-black uppercase tracking-[0.16em] text-[#1e1b4b] hover:underline"
                    onClick={storeFormOrigin}
                  >
                    Contact us
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </Shell>
        </section>

        {/* ── Benefits: Free inspection ── */}
        <section className="bg-indigo-50/60 py-24">
          <Shell>
            <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <Label>Why {site.brandName}</Label>
                <SectionTitle
                  center={false}
                  title={commercial.benefits.title}
                  subtitle={`${site.brandName} provides national facility management with ${site.primaryPhone}. Licensed, bonded, and insured across all 50 states.`}
                />
                <div className="mt-10">
                  <CtaLink href={commercial.benefits.cta.href} onClick={storeFormOrigin}>
                    {commercial.benefits.cta.label}
                    <ArrowRight size={18} className="ml-2" />
                  </CtaLink>
                </div>
              </div>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="grid gap-5 md:grid-cols-2"
              >
                {commercial.benefits.items.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={fadeUp}
                    className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg"
                  >
                    <CheckCircle2 className="mb-3 text-[#1e1b4b]" size={22} />
                    <h3 className="mb-2 text-sm font-black text-[#1e1b4b]">
                      {item.label}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-500">
                      {item.body}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Shell>
        </section>

        {/* ── Contact / Final CTA ── */}
        <section id="contact" className="py-24">
          <Shell>
            <div className="relative overflow-hidden rounded-[60px] bg-indigo-50 p-10 md:p-16">
              <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                <div>
                  <Label>Contact</Label>
                  <SectionTitle
                    center={false}
                    title={`Call ${site.brandName} for your commercial property`}
                    subtitle="Tell us about your facility and we will build a custom maintenance strategy with a free inspection."
                  />
                  <div className="mt-10 flex flex-wrap gap-4">
                    <CtaLink
                      href={`tel:${site.primaryPhone.replace(/[^+\\d]/g, '')}`}
                    >
                      Call {site.primaryPhone}
                      <Phone size={18} className="ml-2" />
                    </CtaLink>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-full border border-[#1e1b4b]/20 px-8 py-4 text-sm font-extrabold text-[#1e1b4b] transition hover:-translate-y-0.5 hover:bg-white"
                    >
                      Residential
                      <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </div>
                </div>
                <div className="rounded-[36px] bg-white p-8 shadow-xl">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e1b4b] text-white">
                    <ShieldCheck size={28} />
                  </div>
                  <ul className="space-y-5 text-sm font-medium text-slate-600">
                    <li className="flex gap-3">
                      <Phone className="mt-0.5 text-[#1e1b4b]" size={18} />
                      <span>{site.primaryPhone}</span>
                    </li>
                    <li className="flex gap-3">
                      <Mail className="mt-0.5 text-[#1e1b4b]" size={18} />
                      <span>{site.publicEmailDisplay}</span>
                    </li>
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 text-[#1e1b4b]" size={18} />
                      <span>
                        {site.headquartersCity} &middot; National coverage
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Shell>
        </section>
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
              <span className="text-white/40">|</span>
              <Link
                href={commercial.footer.residentialLink.href}
                className="text-white/70 hover:text-white"
              >
                {commercial.footer.residentialLink.label}
              </Link>
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
