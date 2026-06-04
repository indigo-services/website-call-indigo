'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Shell, SectionTitle, Label, CtaLink } from '../primitives';
import type { ValuePropBlock } from '@/content/types';
import { storeFormOrigin } from '@/lib/lead-form-origin';

export function ValuePropSection({ data }: { data: ValuePropBlock }) {
  return (
    <section id="about" className="py-24">
      <Shell>
        {data.label && <Label>{data.label}</Label>}
        <SectionTitle title={data.title} subtitle={data.subtitle} />
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Dark card (management / membership) */}
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
              {data.darkCard.cardLabel}
            </p>
            <h3 className="mb-6 text-3xl font-black tracking-[-0.04em]">
              {data.darkCard.title}
            </h3>
            <p className="text-sm leading-relaxed text-white/80">
              {data.darkCard.body}
            </p>
            <div className="mt-8">
              <CtaLink href={data.darkCard.cta.href} light onClick={storeFormOrigin}>
                {data.darkCard.cta.label}
                <ArrowRight size={18} className="ml-2" />
              </CtaLink>
            </div>
          </motion.div>

          {/* Light card (services / partners) */}
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
              {data.lightCard.cardLabel}
            </p>
            <h3 className="mb-6 text-3xl font-black tracking-[-0.04em] text-[#1e1b4b]">
              {data.lightCard.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-500">
              {data.lightCard.body}
            </p>
            <div className="mt-8">
              <Link
                href={data.lightCard.link.href}
                className="inline-flex items-center text-sm font-black uppercase tracking-[0.16em] text-[#1e1b4b] hover:underline"
                onClick={storeFormOrigin}
              >
                {data.lightCard.link.label}
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </Shell>
    </section>
  );
}
