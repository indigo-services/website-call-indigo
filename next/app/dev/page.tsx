import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Database,
  ExternalLink,
  Globe2,
  Layers3,
  Rocket,
  ShieldCheck,
  SquareTerminal,
} from 'lucide-react';

const surfaces = [
  {
    title: 'Public Preview',
    href: '/',
    note: 'Residential Indigo home for client review and conversion checks.',
    badge: '3000',
    icon: Globe2,
  },
  {
    title: 'Launch Demo',
    href: '/home-demo-01',
    note: 'Archived LaunchPad demo copy for release comparison.',
    badge: '3000',
    icon: Rocket,
  },
  {
    title: 'CMS Admin',
    href: 'http://localhost:1000/manage/admin',
    note: 'Strapi editorial surface for content operations.',
    badge: '1000',
    icon: Database,
    external: true,
  },
  {
    title: 'Storybook / Registry',
    href: 'http://localhost:6006/',
    note: 'Visual component review and future registry capture.',
    badge: '6006',
    icon: Layers3,
    external: true,
  },
];

const commands = ['yarn dev', 'yarn codex:doctor', 'yarn dev:vscode'];

function SurfaceCard({
  title,
  href,
  note,
  badge,
  icon: Icon,
  external,
}: (typeof surfaces)[number]) {
  const content = (
    <>
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
            <Icon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
              Surface
            </p>
            <h2 className="text-xl font-black tracking-[-0.04em] text-white">
              {title}
            </h2>
          </div>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
          {badge}
        </span>
      </div>
      <p className="max-w-sm text-sm leading-6 text-slate-300">{note}</p>
      <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-cyan-200">
        Open
        {external ? <ExternalLink size={14} /> : <ArrowRight size={14} />}
      </div>
    </>
  );

  const className =
    'group rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
    >
      {content}
    </Link>
  );
}

export const metadata: Metadata = {
  title: 'Indigo Dev',
  description:
    'Local DX command center for the Indigo stack, with direct links to the main surfaces.',
};

export default function DevPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.18),_transparent_30%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-10 md:px-12">
          <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/70">
                Indigo Platform
              </p>
              <h1 className="text-lg font-black tracking-[-0.04em] md:text-2xl">
                DX Start Dashboard
              </h1>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                Web + CMS + Registry
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                Release baseline
              </span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-200/70">
                Local surfaces
              </p>
              <h2 className="max-w-3xl text-5xl font-black tracking-[-0.08em] md:text-7xl">
                One entry point for the whole Indigo build.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Use this page to jump into the public preview, the archived demo
                baseline, the CMS admin, and the visual registry without hunting
                through the repo.
              </p>

              <div className="flex flex-wrap gap-3">
                {commands.map((command) => (
                  <div
                    key={command}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-slate-200"
                  >
                    <SquareTerminal size={14} className="text-cyan-200" />
                    <code>{command}</code>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {surfaces.map((surface) => (
                  <SurfaceCard key={surface.title} {...surface} />
                ))}
              </div>
            </div>

            <aside className="rounded-[36px] border border-white/10 bg-white/6 p-8 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/70">
                Release posture
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">
                Platform first, bespoke last.
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                The release baseline should stay congruent with Strapi and Next
                conventions, use deterministic commands, and keep the visual
                registry ready for Storybook without forcing extra infra too
                early.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Root public preview is canonical.',
                  'Launch demo stays archived and reachable.',
                  'CMS admin runs on the Strapi service.',
                  'Registry-ready components stay Indigo-owned.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <ShieldCheck size={18} className="mt-0.5 text-emerald-300" />
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100/70">
                  Next step
                </p>
                <p className="mt-2 text-sm leading-6 text-white/90">
                  Add branded Storybook stories for the public preview blocks and
                  lift the most reusable sections into the visual registry.
                </p>
                <a
                  href="https://storybook.js.org/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200"
                >
                  Storybook docs <BookOpen size={14} />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
