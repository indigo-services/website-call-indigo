'use client';

/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Droplets,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { indigoWebsiteContent } from '@/content/indigo-website';

const iconMap = {
  building: Building2,
  droplets: Droplets,
  wrench: Wrench,
  zap: Zap,
} as const;

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
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-extrabold transition hover:-translate-y-0.5 ${
        light
          ? 'bg-white text-[#1e1b4b] hover:bg-slate-100'
          : 'bg-[#1e1b4b] text-white hover:bg-[#0f172a]'
      }`}
    >
      {children}
    </a>
  );
}

export function ApprovalLandingPage() {
  const { site, navigation, home } = indigoWebsiteContent;

  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-[#1e1b4b] selection:text-white">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1e1b4b] px-4 py-2 text-xs text-white md:px-12">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#818cf8]" />
              <span>Home &amp; facility services</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#818cf8]" />
              <span>{site.serviceArea}</span>
            </div>
          </div>
          <span>{site.legalName}</span>
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
                {home.hero.phoneLabel}
              </p>
              <a
                href={home.finalCta.href}
                className="text-sm font-bold text-[#1e1b4b]"
              >
                {site.primaryPhone}
              </a>
            </div>
          </div>
        </Shell>
      </header>

      <main>
        <section
          id="hero"
          className="relative overflow-hidden bg-[linear-gradient(135deg,#1e1b4b_0%,#0f172a_100%)]"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />
          </div>
          <Shell className="grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white"
            >
              <div className="mb-6 flex flex-wrap gap-3">
                {home.hero.proof.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h1 className="mb-8 max-w-5xl text-6xl font-black leading-[0.9] tracking-[-0.06em] md:text-[104px]">
                {home.hero.title}
              </h1>
              <p className="mb-10 max-w-2xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
                {home.hero.body}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <CtaLink href={home.hero.primaryCta.href} light>
                  {home.hero.primaryCta.label}
                  <ArrowRight size={18} className="ml-2" />
                </CtaLink>
                <CtaLink href={home.hero.secondaryCta.href} light>
                  {home.hero.secondaryCta.label}
                  <ArrowRight size={18} className="ml-2" />
                </CtaLink>
                <a
                  href={home.finalCta.href}
                  className="text-sm font-black uppercase tracking-[0.2em] text-white underline-offset-8 hover:underline"
                >
                  {home.hero.phoneLabel}: {site.primaryPhone}
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-[40px] border-8 border-white/20 shadow-2xl">
                <img
                  src={home.hero.image.src}
                  alt={home.hero.image.alt}
                  className="h-[520px] w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 left-6 max-w-[260px] rounded-[28px] bg-white p-6 text-[#1e1b4b] shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  First source correction
                </p>
                <p className="mt-2 text-2xl font-black">{site.primaryPhone}</p>
              </div>
            </motion.div>
          </Shell>
        </section>

        <section className="py-24">
          <Shell>
            <Label>Choose A Path</Label>
            <SectionTitle
              title="One Indigo team for homes, facilities, and managed properties"
              subtitle="Start with the property type. Each path keeps the same source facts and can later be mapped into Strapi content."
            />
            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              {home.pathways.map((pathway) => (
                <motion.a
                  key={pathway.title}
                  href={pathway.href}
                  whileHover={{ y: -6 }}
                  className="group overflow-hidden rounded-[40px] bg-white shadow-xl"
                >
                  <img
                    src={pathway.image.src}
                    alt={pathway.image.alt}
                    className="h-72 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-8 md:p-10">
                    <h3 className="text-3xl font-black tracking-[-0.04em] text-[#1e1b4b]">
                      {pathway.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
                      {pathway.body}
                    </p>
                    <div className="mt-8 inline-flex items-center text-sm font-black uppercase tracking-[0.16em] text-[#1e1b4b]">
                      {pathway.cta}
                      <ArrowRight
                        size={18}
                        className="ml-2 transition group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </Shell>
        </section>

        <section id="services" className="bg-indigo-50/60 py-24">
          <Shell>
            <Label>Service Coverage</Label>
            <SectionTitle
              title="Grounded in the legacy Indigo service categories"
              subtitle="The first draft removes narrow plumbing-only positioning while preserving the real service categories from the old site."
            />
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {home.services.map((service) => {
                const Icon = iconMap[service.icon];

                return (
                  <motion.div
                    key={service.title}
                    whileHover={{ y: -8 }}
                    className="rounded-[32px] bg-white p-8 shadow-xl"
                  >
                    <div className="mb-6 inline-flex rounded-2xl bg-[#1e1b4b] p-3 text-white">
                      <Icon size={24} />
                    </div>
                    <h3 className="mb-4 text-xl font-black text-[#1e1b4b]">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      {service.body}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </Shell>
        </section>

        <section className="py-24">
          <Shell className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Label>How It Works</Label>
              <SectionTitle
                center={false}
                title="A clear path from first call to scheduled work"
                subtitle="The old site describes phone bids, walk-throughs, proposals, estimates, and coordinator scheduling. This draft turns that into a simple service flow."
              />
              <div className="mt-10">
                <CtaLink href={home.finalCta.href}>
                  {home.finalCta.cta}
                  <ArrowRight size={18} className="ml-2" />
                </CtaLink>
              </div>
            </div>
            <div className="grid gap-5">
              {home.process.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-5 rounded-[28px] bg-white p-6 shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1e1b4b] text-sm font-black text-white">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-black text-[#1e1b4b]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Shell>
        </section>

        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-[#1e1b4b]" />
          <Shell className="relative z-10">
            <div className="grid gap-12 text-white lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <Label light>Verification Guardrail</Label>
                <SectionTitle
                  light
                  center={false}
                  title={home.trust.title}
                  subtitle={home.trust.body}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {home.trust.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-[28px] border border-white/10 bg-white/5 p-6"
                  >
                    <CheckCircle2 className="mb-4 text-[#a5b4fc]" size={24} />
                    <p className="text-sm font-bold leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Shell>
        </section>

        <section id="contact" className="py-24">
          <Shell>
            <div className="relative overflow-hidden rounded-[60px] bg-indigo-50 p-10 md:p-16">
              <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                <div>
                  <Label>Contact</Label>
                  <SectionTitle
                    center={false}
                    title={home.finalCta.title}
                    subtitle={home.finalCta.body}
                  />
                  <div className="mt-10 flex flex-wrap gap-4">
                    <CtaLink href={home.finalCta.href}>
                      {home.finalCta.cta}
                      <ArrowRight size={18} className="ml-2" />
                    </CtaLink>
                    <Link
                      href="/commercial"
                      className="inline-flex items-center justify-center rounded-full border border-[#1e1b4b]/20 px-8 py-4 text-sm font-extrabold text-[#1e1b4b] transition hover:-translate-y-0.5 hover:bg-white"
                    >
                      Commercial
                      <Building2 size={18} className="ml-2" />
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
                      <span>{site.address}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Shell>
        </section>
      </main>

      <footer className="bg-[#1e1b4b] py-12 text-white">
        <Shell className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-black tracking-[-0.06em]">
              {site.brandName}
            </p>
            <p className="mt-2 text-sm text-white/70">{site.legalName}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-white/70">
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </Shell>
      </footer>
    </div>
  );
}
