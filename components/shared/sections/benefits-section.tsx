'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Shell, Label, SectionTitle, CtaLink, stagger, fadeUp } from '../primitives';
import type { BenefitsBlock } from '@/content/types';
import type { SiteConfig } from '@/content/types';
import { storeFormOrigin } from '@/lib/lead-form-origin';

export function BenefitsSection({
  data,
  site,
}: {
  data: BenefitsBlock;
  site: SiteConfig;
}) {
  return (
    <section className="bg-indigo-50/60 py-24">
      <Shell>
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Label>{data.label}</Label>
            <SectionTitle center={false} title={data.title} subtitle={data.subtitle} />
            {data.cta && (
              <div className="mt-10">
                <CtaLink href={data.cta.href} onClick={storeFormOrigin}>
                  {data.cta.label}
                  <ArrowRight size={18} className="ml-2" />
                </CtaLink>
              </div>
            )}
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-5 md:grid-cols-2"
          >
            {data.items.map((item) => (
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
  );
}
