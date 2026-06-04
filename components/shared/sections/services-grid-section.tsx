'use client';

/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion';
import {
  Droplets,
  Hammer,
  Paintbrush,
  Thermometer,
  Wrench,
  Zap,
} from 'lucide-react';
import { Shell, Label, SectionTitle, stagger, fadeUp } from '../primitives';
import type { ServicesGridBlock } from '@/content/types';

const iconMap = {
  droplets: Droplets,
  hammer: Hammer,
  paintbrush: Paintbrush,
  thermometer: Thermometer,
  wrench: Wrench,
  zap: Zap,
} as const;

export function ServicesGridSection({ data }: { data: ServicesGridBlock }) {
  return (
    <section id="services" className="bg-indigo-50/60 py-24">
      <Shell>
        {data.label && <Label>{data.label}</Label>}
        <SectionTitle title={data.title} subtitle={data.subtitle} />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {data.items.map((service) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={service.title}
                variants={fadeUp}
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
        </motion.div>
      </Shell>
    </section>
  );
}
