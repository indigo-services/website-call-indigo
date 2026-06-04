'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Shell, Label, SectionTitle, CtaLink } from '../primitives';
import type { FinalCtaBlock } from '@/content/types';
import type { SiteConfig } from '@/content/types';
import { storeFormOrigin } from '@/lib/lead-form-origin';

export function FinalCtaSection({
  data,
  site,
}: {
  data: FinalCtaBlock;
  site: SiteConfig;
}) {
  return (
    <section id="contact" className="py-24">
      <Shell>
        <div className="relative overflow-hidden rounded-[60px] bg-indigo-50 p-10 md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <Label>{data.label}</Label>
              <SectionTitle center={false} title={data.title} subtitle={data.subtitle} />
              <div className="mt-10 flex flex-wrap gap-4">
                <CtaLink href={data.cta.href}>
                  {data.cta.label}
                  <Phone size={18} className="ml-2" />
                </CtaLink>
                {data.secondaryCta && (
                  <Link
                    href={data.secondaryCta.href}
                    className="inline-flex items-center justify-center rounded-full border border-[#1e1b4b]/20 px-8 py-4 text-sm font-extrabold text-[#1e1b4b] transition hover:-translate-y-0.5 hover:bg-white"
                    onClick={storeFormOrigin}
                  >
                    {data.secondaryCta.label}
                    <Mail size={18} className="ml-2" />
                  </Link>
                )}
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
                  <ArrowRight className="mt-0.5 text-[#1e1b4b]" size={18} />
                  <span>{data.contactInfo.location}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
