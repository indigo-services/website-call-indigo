'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { Shell, CtaLink } from '../primitives';
import type { HeroBlock } from '@/content/types';
import type { SiteConfig } from '@/content/types';
import { storeFormOrigin } from '@/lib/lead-form-origin';

export function HeroSection({
  data,
  site,
}: {
  data: HeroBlock;
  site: SiteConfig;
}) {
  const phoneHref = `tel:${site.primaryPhone.replace(/[^\+\\d]/g, '')}`;

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[linear-gradient(135deg,#1e1b4b_0%,#0f172a_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />
      </div>

      {/* ── Two-column layout (home/residential with image) ── */}
      {data.image ? (
        <Shell className="grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white"
          >
            {data.proof && (
              <div className="mb-6 flex flex-wrap gap-3">
                {data.proof.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            {data.subheading && (
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-[#818cf8]">
                {data.subheading}
              </p>
            )}
            <h1 className="mb-8 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.06em] md:text-7xl lg:text-8xl">
              {data.title}
            </h1>
            <p className="mb-10 max-w-2xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
              {data.body}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {data.secondaryCta && (
                <CtaLink href={data.secondaryCta.href} light onClick={storeFormOrigin}>
                  {data.secondaryCta.label}
                  <ArrowRight size={18} className="ml-2" />
                </CtaLink>
              )}
              <CtaLink href={data.primaryCta.href} light>
                {data.primaryCta.label}
                <ArrowRight size={18} className="ml-2" />
              </CtaLink>
              <a
                href={phoneHref}
                className="text-sm font-black uppercase tracking-[0.2em] text-white underline-offset-8 hover:underline"
              >
                {data.phoneLabel}: {site.primaryPhone}
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
                src={data.image.src}
                alt={data.image.alt}
                className="h-[520px] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 left-6 max-w-[260px] rounded-[28px] bg-white p-6 text-[#1e1b4b] shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Serving {site.serviceArea}
              </p>
              <p className="mt-2 text-2xl font-black">{site.primaryPhone}</p>
            </div>
          </motion.div>
        </Shell>
      ) : (
        /* ── Centered layout (commercial) ── */
        <Shell className="py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            className="mx-auto max-w-4xl text-center text-white"
          >
            {data.sectionLabel && (
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-[#818cf8]">
                {data.sectionLabel}
              </p>
            )}
            <h1 className="mb-8 text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl lg:text-7xl">
              {data.title}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
              {data.body}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <CtaLink href={data.primaryCta.href} light onClick={storeFormOrigin}>
                {data.primaryCta.label}
                <ArrowRight size={18} className="ml-2" />
              </CtaLink>
              <a
                href={phoneHref}
                className="text-sm font-black uppercase tracking-[0.2em] text-white underline-offset-8 hover:underline"
              >
                {data.phoneLabel}: {site.primaryPhone}
              </a>
            </div>
          </motion.div>
        </Shell>
      )}
    </section>
  );
}
