import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Launch Demo',
    description: 'Archived LaunchPad demo view for release comparison.',
  };
}

export default async function HomeDemoPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] px-6 py-16 text-[#1d2a2f]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f6f73]">
          Archived Demo
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Launch demo unavailable</h1>
        <p className="mt-4 max-w-2xl text-lg text-[#45565b]">
          This archived LaunchPad demo depends on protected CMS content and is
          not part of the public pre-release review surface.
        </p>
        <Link
          className="mt-8 inline-flex rounded bg-[#193f3a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white"
          href="/"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
