'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { indigoWebsiteContent } from '@/content/indigo-website';
import type { LeadFormConfig, LeadFormField } from '@/content/lead-forms';

type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | {
      message: string;
      status: 'success' | 'error';
      submittedFields?: Record<string, string>;
    };

const RETURN_PATH_KEY = 'leadFormReturnTo';
const RETURN_SCROLL_KEY = 'leadFormScrollY';
const AUTO_RETURN_SECONDS = 10;

function Shell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1180px] px-4 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

function FieldControl({ field }: { field: LeadFormField }) {
  const baseClass =
    'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#1e1b4b] focus:ring-4 focus:ring-indigo-100';

  if (field.type === 'textarea') {
    return (
      <textarea
        className={`${baseClass} min-h-32 resize-y`}
        name={field.name}
        placeholder={field.placeholder}
        required={field.required}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select className={baseClass} name={field.name} required={field.required}>
        <option value="">Select one</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={baseClass}
      name={field.name}
      placeholder={field.placeholder}
      required={field.required}
      type={field.type}
    />
  );
}

function useOriginReturn() {
  const router = useRouter();
  const [originPath, setOriginPath] = useState('/');

  useEffect(() => {
    const stored = sessionStorage.getItem(RETURN_PATH_KEY);
    setOriginPath(stored || '/');
  }, []);

  const returnToOrigin = useCallback(() => {
    const scrollY = sessionStorage.getItem(RETURN_SCROLL_KEY);
    sessionStorage.removeItem(RETURN_PATH_KEY);
    sessionStorage.removeItem(RETURN_SCROLL_KEY);
    router.push(originPath);
    if (scrollY) {
      requestAnimationFrame(() => window.scrollTo(0, Number(scrollY)));
    }
  }, [router, originPath]);

  return { originPath, returnToOrigin };
}

export function LeadFormPage({ config }: { config: LeadFormConfig }) {
  const { site } = indigoWebsiteContent;
  const { originPath, returnToOrigin } = useOriginReturn();
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });
  const [countdown, setCountdown] = useState(AUTO_RETURN_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const telHref = useMemo(
    () => `tel:${site.primaryPhone.replace(/[^+\d]/g, '')}`,
    [site.primaryPhone]
  );

  useEffect(() => {
    if (submission.status !== 'success') return;

    setCountdown(AUTO_RETURN_SECONDS);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          returnToOrigin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [submission.status, returnToOrigin]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmission({ status: 'submitting' });

    const formData = new FormData(form);
    const fields = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        String(value).trim(),
      ])
    );

    try {
      const response = await fetch('/api/lead-forms', {
        body: JSON.stringify({
          fields,
          leadType: config.kind,
          sourcePath: window.location.pathname,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Submission failed');
      }

      form.reset();
      setSubmission({
        message: result?.message || config.successMessage,
        status: 'success',
        submittedFields: fields as Record<string, string>,
      });
    } catch (error) {
      setSubmission({
        message:
          error instanceof Error
            ? error.message
            : 'Submission failed. Please call Indigo directly.',
        status: 'error',
      });
    }
  }

  function handleCloseSummary() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    returnToOrigin();
  }

  const labelLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const field of config.fields) {
      map.set(field.name, field.label);
    }
    return map;
  }, [config.fields]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <Shell className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-4">
            <Link
              className="flex items-center gap-3"
              href={originPath}
              onClick={() => {
                sessionStorage.removeItem(RETURN_PATH_KEY);
                sessionStorage.removeItem(RETURN_SCROLL_KEY);
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1b4b] text-white">
                <Phone size={18} />
              </span>
              <span className="text-xl font-black tracking-[-0.04em] text-[#1e1b4b]">
                {site.brandName}
              </span>
            </Link>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <Link
              className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[#1e1b4b] sm:inline-flex"
              href={originPath}
              onClick={() => {
                sessionStorage.removeItem(RETURN_PATH_KEY);
                sessionStorage.removeItem(RETURN_SCROLL_KEY);
              }}
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>
          <nav className="flex items-center gap-5 text-sm font-bold text-[#1e1b4b]">
            <Link href="/forms/appointment">Book</Link>
            <Link href="/forms/commercial">Commercial</Link>
            <Link href="/forms/contact">Contact</Link>
          </nav>
        </Shell>
      </header>

      <main>
        <section className="bg-white py-14 md:py-20">
          <Shell>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#1e1b4b]">
                  {config.eyebrow}
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#1e1b4b] md:text-6xl">
                  {config.title}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600">
                  {config.description}
                </p>

                <div className="mt-10 space-y-4 text-sm font-medium text-slate-600">
                  <a className="flex items-center gap-3" href={telHref}>
                    <Phone size={18} className="text-[#1e1b4b]" />
                    <span>{site.primaryPhone}</span>
                  </a>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-[#1e1b4b]" />
                    <span>{site.publicEmailDisplay}</span>
                  </div>
                </div>

                <div className="mt-10 rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
                  <div className="flex items-start gap-4">
                    <ShieldCheck
                      className="mt-1 shrink-0 text-[#1e1b4b]"
                      size={24}
                    />
                    <div>
                      <p className="text-sm font-black text-[#1e1b4b]">
                        Routed by inquiry type
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Booking requests, commercial inquiries, and general
                        messages use separate intake details so the right team
                        can follow up.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {submission.status === 'success' ? (
                <div className="rounded-[32px] border border-emerald-200 bg-emerald-50 p-6 shadow-xl md:p-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-emerald-900">
                      Thank you
                    </h2>
                    <button
                      className="rounded-full p-2 text-emerald-600 transition hover:bg-emerald-100"
                      onClick={handleCloseSummary}
                      type="button"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-emerald-800">
                    {submission.message}
                  </p>

                  <dl className="mt-6 space-y-3">
                    {Object.entries(submission.submittedFields ?? {})
                      .filter(([key]) => key !== 'leadType' && labelLookup.has(key))
                      .map(([key, value]) => (
                        <div
                          className="flex flex-col gap-0.5 rounded-xl bg-white p-3"
                          key={key}
                        >
                          <dt className="text-xs font-bold text-slate-500">
                            {labelLookup.get(key)}
                          </dt>
                          <dd className="text-sm text-slate-900">
                            {value || '—'}
                          </dd>
                        </div>
                      ))}
                  </dl>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                      onClick={handleCloseSummary}
                      type="button"
                    >
                      <ArrowLeft size={16} />
                      Close
                    </button>
                    <span className="text-xs font-medium text-emerald-600">
                      Returning in {countdown}s...
                    </span>
                  </div>
                </div>
              ) : (
                <form
                  className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl md:p-8"
                  onSubmit={handleSubmit}
                >
                  <input name="leadType" type="hidden" value={config.kind} />
                  <div className="grid gap-5 md:grid-cols-2">
                    {config.fields.map((field) => (
                      <label
                        className={
                          field.type === 'textarea'
                            ? 'text-sm font-bold text-slate-700 md:col-span-2'
                            : 'text-sm font-bold text-slate-700'
                        }
                        key={field.name}
                      >
                        {field.label}
                        {field.required ? (
                          <span className="text-[#1e1b4b]"> *</span>
                        ) : null}
                        <FieldControl field={field} />
                      </label>
                    ))}
                  </div>

                  <button
                    className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#1e1b4b] px-8 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={submission.status === 'submitting'}
                    type="submit"
                  >
                    {submission.status === 'submitting'
                      ? 'Sending...'
                      : config.submitLabel}
                    <ArrowRight size={18} className="ml-2" />
                  </button>

                  {submission.status === 'error' ? (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-900">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                      <span>{submission.message}</span>
                    </div>
                  ) : null}
                </form>
              )}
            </div>
          </Shell>
        </section>
      </main>
    </div>
  );
}
