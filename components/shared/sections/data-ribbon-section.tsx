'use client';

import { motion } from 'framer-motion';
import { Shell, stagger, fadeUp } from '../primitives';
import type { DataRibbonBlock } from '@/content/types';

export function DataRibbonSection({ data }: { data: DataRibbonBlock }) {
  return (
    <section className="border-b border-slate-100 bg-slate-50 py-10">
      <Shell>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {data.items.map((item) => (
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
  );
}
