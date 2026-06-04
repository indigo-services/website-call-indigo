/* ─── Shared UI primitives ─── */
// Extracted from landing-page.tsx and commercial-page.tsx.
// These are pure presentational components with no data dependencies.

export function Shell({
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

export function SectionTitle({
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

export function Label({
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

export function CtaLink({
  href,
  children,
  light = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
  onClick?: React.MouseEventHandler;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-extrabold transition hover:-translate-y-0.5 ${
        light
          ? 'bg-white text-[#1e1b4b] hover:bg-slate-100'
          : 'bg-[#1e1b4b] text-white hover:bg-[#0f172a]'
      }`}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

/* ─── Framer Motion variants (shared across sections) ─── */
export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
