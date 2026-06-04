'use client';

import { motion } from 'framer-motion';
import { Shell, Label, SectionTitle, stagger, fadeUp } from '../primitives';
import type { ProcessStepsBlock } from '@/content/types';

export function ProcessStepsSection({ data }: { data: ProcessStepsBlock }) {
  return (
    <section className="bg-slate-50 py-24">
      <Shell>
        {data.label && (
          <div className="text-center">
            <Label>{data.label}</Label>
          </div>
        )}
        <SectionTitle title={data.title} />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {data.steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              className="rounded-[28px] bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1b4b] text-sm font-black text-white">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="font-black text-[#1e1b4b]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Shell>
    </section>
  );
}
