'use client';

/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Droplets,
  Flame,
  Fuel,
  Info,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Pipette as Pipe,
  Quote,
  Search,
  ShieldCheck,
  Star,
  Tag,
  Truck,
  Users,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';

const brand = {
  primary: '#1e1b4b',
  primaryDark: '#0f172a',
  accent: '#6366f1',
};

const serviceCards = [
  ['Drain Cleaning', 'Fast, no-mess clog removal.', Droplets],
  ['Water Heater Repair', 'Hot water restored same day.', Flame],
  ['Pipe Leak Repair', 'Stop damage before it spreads.', Pipe],
  ['Gas Line Services', 'Certified techs. Safety first.', Fuel],
] as const;

const reasons = [
  [
    'Licensed & Insured',
    'Every technician is certified and background-checked.',
    ShieldCheck,
  ],
  [
    'Same-Day Service',
    'We show up when it matters to get the job done fast.',
    Zap,
  ],
  [
    'Fixed Upfront Pricing',
    'No hidden fees. No surprises. You approve the price.',
    Tag,
  ],
  [
    '5,000+ Repairs',
    'Trusted across Austin, Round Rock, Cedar Park, and more.',
    Users,
  ],
] as const;

const processSteps = [
  ['01', 'Schedule', 'Book online or call (512) 555-0199.', Calendar],
  ['02', 'Arrival', 'A licensed plumber arrives on time.', Truck],
  ['03', 'Diagnosis', 'Clear explanation of the issue and options.', Search],
  ['04', 'Repair', 'Fast, reliable, clean, professional work.', Wrench],
  ['05', 'Pay After Job', 'Payment collected only after completion.', Wallet],
] as const;

const faqs = [
  [
    'Are your plumbers licensed and insured?',
    'Yes, all technicians are licensed, insured, and background-checked.',
  ],
  [
    'What services do you offer?',
    'Drain cleaning, water heaters, leak repair, gas line work, and more.',
  ],
  [
    'How can I prevent plumbing problems?',
    'Regular maintenance and better drain and flushing habits prevent most issues.',
  ],
  [
    'Can you help with water heater issues?',
    'Yes, for both traditional tank and tankless systems.',
  ],
  [
    'How quickly can you respond?',
    'Typical emergency arrival is 30-60 minutes in the core service area.',
  ],
] as const;

const reviews = [
  [
    'Amanda R.',
    'South Lamar',
    'Tech arrived in 25 minutes at 9pm and stopped the leak. Fair pricing.',
  ],
  [
    'Derrick M.',
    'Mueller',
    'Water heater replaced same day. Clean, professional, and friendly.',
  ],
  [
    'Lisa P.',
    'Hyde Park',
    'Finally a plumber who shows up on time and charges what they quote.',
  ],
] as const;

function Shell({
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

function Eyebrow({
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

function SectionTitle({
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
          className={`mx-auto mt-6 max-w-2xl text-sm leading-relaxed md:text-base ${light ? 'text-white/75' : 'text-slate-500'}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function CTA({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-extrabold transition hover:-translate-y-0.5 ${
        light
          ? 'bg-white text-[#1e1b4b] hover:bg-slate-100'
          : 'bg-[#1e1b4b] text-white hover:bg-[#0f172a]'
      }`}
    >
      {children}
    </button>
  );
}

function Stars({ size = 16 }: { size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          fill="#FF9900"
          className="text-[#FF9900]"
        />
      ))}
    </div>
  );
}

export function ApprovalLandingPage() {
  const [service, setService] = useState('drain');
  const [urgency, setUrgency] = useState('standard');
  const [property, setProperty] = useState('residential');

  const estimate = useMemo(() => {
    const base: Record<string, number> = { drain: 128, heater: 420, leak: 265 };
    return (
      base[service] +
      (urgency === 'emergency' ? 140 : 0) +
      (property === 'commercial' ? 180 : 0)
    );
  }, [property, service, urgency]);

  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-[#1e1b4b] selection:text-white">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1e1b4b] px-4 py-2 text-xs text-white md:px-12">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#6366f1]" />
              <span>Open 24/7 - Emergency Service</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#6366f1]" />
              <span>Austin, Texas &amp; Greater Metro Area</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span>License: LIC# TX-PLM-48291</span>
            <a href="#" className="text-[#818cf8] hover:underline">
              Verify
            </a>
          </div>
        </div>
        <Shell className="flex items-center justify-between gap-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#1e1b4b] p-2">
              <Phone className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold tracking-[-0.06em] text-[#1e1b4b]">
              INDIGO
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#1e1b4b] lg:flex">
            <a href="#hero">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <div className="flex items-center gap-1">
              <span>Pages</span>
              <ChevronDown size={14} />
            </div>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-3 md:flex">
              <div className="rounded-full bg-indigo-50 p-2">
                <Phone className="text-[#1e1b4b]" size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Call Us Now
                </p>
                <p className="text-sm font-bold text-[#1e1b4b]">
                  +5689 2589 6325
                </p>
              </div>
            </div>
            <CTA>
              Schedule Online
              <ChevronDown size={16} className="ml-2 -rotate-90" />
            </CTA>
          </div>
        </Shell>
      </header>

      <main>
        <section
          id="hero"
          className="relative overflow-hidden bg-[linear-gradient(135deg,#1e1b4b_0%,#0f172a_100%)]"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />
          </div>
          <Shell className="grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white"
            >
              <div className="mb-6 flex items-center gap-2">
                <Stars />
                <span className="text-sm font-bold">4.9/5 Reviews</span>
                <div className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                  G
                </div>
              </div>
              <h1 className="mb-8 text-6xl font-black leading-[0.85] tracking-[-0.06em] md:text-[120px]">
                EXPERT
                <br />
                PLUMBING.
              </h1>
              <p className="mb-10 max-w-xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
                Fast, licensed, and local. From leaks to toilets to heater
                failures, our experts fix it today.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <CTA light>
                  Book Appointment
                  <ArrowRight size={18} className="ml-2" />
                </CTA>
                <div className="flex gap-8">
                  <div>
                    <p className="text-3xl font-black">15K+</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                      Satisfied Clients
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-black">250+</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                      Projects Completed
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-[40px] border-8 border-white/20 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581244276891-8339386d3392?q=80&w=1000&auto=format&fit=crop"
                  alt="Expert plumber"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -right-6 -top-6 max-w-[220px] rounded-[28px] bg-[#1e1b4b] p-6 text-white shadow-xl">
                <div className="mb-2 flex items-center gap-3">
                  <div className="animate-pulse rounded-full bg-red-500 p-2">
                    <PhoneCall size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Emergency
                  </span>
                </div>
                <p className="text-sm text-white/80">
                  Typical arrival 30-60 min
                </p>
              </div>
            </motion.div>
          </Shell>
        </section>

        <section id="about" className="py-24">
          <Shell className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop"
                  alt="Plumber working"
                  className="h-[400px] w-full rounded-[32px] object-cover shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <img
                  src="https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=600&auto=format&fit=crop"
                  alt="Plumbing tools"
                  className="mt-12 h-[400px] w-full rounded-[32px] object-cover shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-8 border-white bg-[#1e1b4b] text-white shadow-2xl">
                <span className="text-4xl font-black">15+</span>
                <span className="text-center text-[10px] font-bold uppercase leading-tight">
                  Years of
                  <br />
                  Experience
                </span>
              </div>
            </div>
            <div>
              <Eyebrow>About Us</Eyebrow>
              <SectionTitle
                center={false}
                title={
                  <>
                    Delivering Quality
                    <br />
                    Plumbing Solutions
                  </>
                }
                subtitle="We are dedicated to delivering high-quality plumbing services built on expertise, reliability, and attention to detail."
              />
              <div className="mb-12 mt-10 grid grid-cols-2 gap-6">
                {[
                  'Licensed & Insured',
                  'Upfront, Flat pricing',
                  'Same-day service',
                  'Plumbing Experts',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-50 p-1">
                      <CheckCircle2 size={18} className="text-[#1e1b4b]" />
                    </div>
                    <span className="text-sm font-bold text-[#1e1b4b]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <CTA>
                Read More
                <ArrowRight size={18} className="ml-2" />
              </CTA>
            </div>
          </Shell>
        </section>

        <section id="services" className="bg-indigo-50/60 py-24">
          <Shell>
            <Eyebrow>Our Services</Eyebrow>
            <SectionTitle title="Provides Professional Plumbing Services for Every Need" />
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {serviceCards.map(([title, desc, Icon], index) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -8 }}
                  className="overflow-hidden rounded-[32px] bg-white shadow-xl"
                >
                  <img
                    src={
                      [
                        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=400&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1517646288024-aaeeefef9260?q=80&w=400&auto=format&fit=crop',
                      ][index]
                    }
                    alt={title}
                    className="h-48 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-8">
                    <div className="mb-4 inline-flex rounded-2xl bg-[#1e1b4b] p-3 text-white">
                      <Icon size={22} />
                    </div>
                    <h3 className="mb-3 text-xl font-black text-[#1e1b4b]">
                      {title}
                    </h3>
                    <p className="mb-6 text-sm text-slate-500">{desc}</p>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1b4b] text-white">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Shell>
        </section>

        <section className="py-24">
          <Shell className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow>Why Choose Us</Eyebrow>
              <SectionTitle
                center={false}
                title={
                  <>
                    Committed to Your
                    <br />
                    Comfort &amp; Safety.
                  </>
                }
                subtitle="We prioritize your comfort and safety by delivering dependable plumbing services you can trust."
              />
              <div className="mt-12 grid grid-cols-2 gap-8">
                {reasons.map(([title, desc, Icon]) => (
                  <div key={title} className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#1e1b4b]">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="mb-2 font-black text-[#1e1b4b]">
                        {title}
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-500">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-[40px] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1585704032915-c3400ca1f963?q=80&w=1000&auto=format&fit=crop"
                alt="Plumber smiling"
                className="h-[600px] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </Shell>
        </section>

        <section id="pricing" className="relative overflow-hidden py-24">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1920&auto=format&fit=crop"
              alt="Plumbing background"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#1e1b4b]/95" />
          </div>
          <Shell className="relative z-10">
            <Eyebrow light>Price Estimation</Eyebrow>
            <SectionTitle
              light
              title="Instant Price Estimate"
              subtitle="Get a ballpark price in 30 seconds. No signup required."
            />
            <div className="mx-auto mt-16 max-w-5xl rounded-[40px] bg-white p-8 text-[#1e1b4b] shadow-2xl md:p-12">
              <div className="grid gap-8 md:grid-cols-3">
                <label className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Service Type
                  </span>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 outline-none"
                  >
                    <option value="drain">Drain Cleaning</option>
                    <option value="heater">Water Heater</option>
                    <option value="leak">Leak Repair</option>
                  </select>
                </label>
                <label className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Urgency
                  </span>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 outline-none"
                  >
                    <option value="standard">Standard</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </label>
                <label className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Property Type
                  </span>
                  <select
                    value={property}
                    onChange={(e) => setProperty(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 outline-none"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </label>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-between gap-8 border-t border-slate-100 pt-12">
                <CTA>
                  See Estimated Price Range
                  <ArrowRight size={20} className="ml-2 -rotate-45" />
                </CTA>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                    Your Estimated Price Is:
                  </span>
                  <div className="flex items-center text-6xl font-black">
                    <span className="mr-1 text-3xl">$</span>
                    {estimate}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-start gap-2 text-[10px] font-medium text-slate-400">
                <Info size={12} className="mt-0.5 shrink-0" />
                <p>
                  Disclaimer: Estimates are not final quotes. Final pricing
                  provided after on-site inspection.
                </p>
              </div>
            </div>
          </Shell>
        </section>

        <section className="py-24">
          <Shell>
            <Eyebrow>How It Works</Eyebrow>
            <SectionTitle title="How Our Simple & Reliable Plumbing Process Works" />
            <div className="mt-20 flex flex-wrap items-start justify-center gap-12 lg:justify-between">
              {processSteps.map(([number, title, desc, Icon]) => (
                <motion.div
                  key={number}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true }}
                  className="flex max-w-[200px] flex-col items-center text-center"
                >
                  <div className="relative mb-8">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1e1b4b] text-white shadow-xl">
                      <Icon size={32} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#1e1b4b] text-[10px] font-bold text-white">
                      {number}
                    </div>
                  </div>
                  <h4 className="mb-3 text-xl font-black text-[#1e1b4b]">
                    {title}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </Shell>
        </section>

        <section className="bg-indigo-50/40 py-24">
          <Shell>
            <Eyebrow>Before &amp; After</Eyebrow>
            <SectionTitle title="Real Repairs. Real Results. Done Right." />
            <div className="mt-20 grid gap-8 lg:grid-cols-2">
              {[
                [
                  'Before',
                  'Leaking Sink Pipe Causing Damage',
                  'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=1000&auto=format&fit=crop',
                ],
                [
                  'After',
                  'Damage Prevented, Pipe Restored',
                  'https://images.unsplash.com/photo-1585704032915-c3400ca1f963?q=80&w=1000&auto=format&fit=crop',
                ],
              ].map(([label, title, image]) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.02 }}
                  className="relative overflow-hidden rounded-[40px] shadow-2xl"
                >
                  <img
                    src={image}
                    alt={title}
                    className="h-[500px] w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div
                    className={`absolute left-6 top-6 rounded-full px-4 py-1 text-[10px] font-bold uppercase ${label === 'Before' ? 'bg-white/20 text-white' : 'bg-[#1e1b4b] text-white'}`}
                  >
                    {label}
                  </div>
                  <div className="absolute bottom-10 left-10 text-white">
                    <h4 className="text-2xl font-black">{title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </Shell>
        </section>

        <section className="py-24">
          <Shell>
            <Eyebrow>Client Reviews</Eyebrow>
            <SectionTitle title="Trusted Reviews from Homeowners & Businesses" />
            <div className="mb-16 mt-12 flex justify-center">
              <div className="flex flex-wrap items-center gap-4 rounded-[28px] bg-slate-50 px-8 py-4">
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <span className="text-2xl font-black text-[#1e1b4b]">G</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black">4.9</span>
                    <Stars size={14} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Based on 327 Google Reviews
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {reviews.map(([name, location, text], index) => (
                <motion.div
                  key={name}
                  whileHover={{ y: -8 }}
                  className="rounded-[40px] bg-white p-10 shadow-xl"
                >
                  <Quote className="mb-6 text-indigo-100" size={48} />
                  <Stars size={14} />
                  <p className="my-6 font-medium italic leading-relaxed text-slate-600">
                    &quot;{text}&quot;
                  </p>
                  <div>
                    <h5 className="font-black text-[#1e1b4b]">{name}</h5>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Shell>
        </section>

        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1581244276891-8339386d3392?q=80&w=1920&auto=format&fit=crop"
              alt="Map background"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#1e1b4b]/95" />
          </div>
          <Shell className="relative z-10 text-center text-white">
            <Eyebrow light>Service Area</Eyebrow>
            <SectionTitle
              light
              title={
                <>
                  Check Service Availability
                  <br />
                  in Your Area
                </>
              }
              subtitle="Enter your ZIP to check availability and earliest arrival."
            />
            <div className="mx-auto mt-12 flex max-w-xl flex-col gap-3 rounded-[40px] bg-white p-2 shadow-2xl md:flex-row">
              <input
                placeholder="Enter Code (e.g., 78701)"
                className="h-14 flex-1 rounded-full bg-transparent px-8 font-bold text-[#1e1b4b] outline-none placeholder:text-slate-300"
              />
              <CTA>
                Check Now
                <ArrowRight size={18} className="ml-2" />
              </CTA>
            </div>
          </Shell>
        </section>

        <section className="bg-indigo-50/40 py-24">
          <Shell>
            <Eyebrow>Faq&apos;s</Eyebrow>
            <SectionTitle
              title={
                <>
                  Answers to Your
                  <br />
                  Frequently Asked Questions
                </>
              }
            />
            <div className="mx-auto mt-16 grid max-w-5xl gap-x-12 gap-y-4 md:grid-cols-2">
              {faqs.map(([q, a]) => (
                <details
                  key={q}
                  className="rounded-2xl bg-white px-6 shadow-sm"
                >
                  <summary className="cursor-pointer py-6 text-sm font-black text-[#1e1b4b] marker:hidden">
                    {q}
                  </summary>
                  <p className="pb-6 text-xs leading-relaxed text-slate-500">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </Shell>
        </section>

        <section className="border-y border-slate-100 bg-white py-16">
          <Shell>
            <p className="mb-12 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              Trusted By Leading Brands
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 md:gap-20">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#1e1b4b]" />
                  <span className="text-xl font-black tracking-[-0.05em] text-[#1e1b4b]">
                    Logoipsum
                  </span>
                </div>
              ))}
            </div>
          </Shell>
        </section>

        <section id="contact" className="py-24">
          <Shell>
            <div className="relative overflow-hidden rounded-[60px] bg-[#1e1b4b] p-12 md:p-20">
              <div className="absolute inset-0 opacity-40">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1920&auto=format&fit=crop"
                  alt="Plumbing"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center">
                <img
                  src="https://images.unsplash.com/photo-1581244276891-8339386d3392?q=80&w=400&auto=format&fit=crop"
                  alt="Plumber"
                  className="h-64 w-64 rounded-[40px] border-8 border-white/10 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="text-white">
                  <Eyebrow light>Get In Touch</Eyebrow>
                  <SectionTitle
                    light
                    center={false}
                    title={
                      <>
                        Need Help Right Now?
                        <br />
                        Call Our Emergency Line.
                      </>
                    }
                  />
                  <div className="mt-8 flex flex-wrap items-center gap-8">
                    <button className="rounded-full bg-white px-10 py-5 text-xl font-black text-[#1e1b4b]">
                      +5689 2589 6325
                    </button>
                    <div className="flex items-center gap-3 text-white/70">
                      <PhoneCall size={20} />
                      <span>Typical arrival in 30-60 minutes.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Shell>
        </section>
      </main>

      <footer className="relative overflow-hidden bg-[#1e1b4b] pb-12 pt-24 text-white">
        <Shell>
          <div className="mb-20 grid gap-16 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white p-2">
                  <Phone className="text-[#1e1b4b]" size={20} />
                </div>
                <span className="text-2xl font-bold tracking-[-0.06em]">
                  INDIGO
                </span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-slate-300">
                Trusted plumbing service provider delivering reliable,
                high-quality solutions for homes and businesses.
              </p>
              <div className="flex gap-4">
                {[FaFacebookF, FaInstagram, FaLinkedinIn].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="rounded-full bg-white/5 p-3 hover:bg-white/10"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-8 text-lg font-bold">Navigation</h4>
              <ul className="space-y-4 text-sm text-slate-300">
                {['About', 'Services', 'Pricing', 'FAQ'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <ArrowRight size={12} className="text-[#818cf8]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-8 text-lg font-bold">Contact Info</h4>
              <ul className="space-y-6 text-sm text-slate-300">
                <li className="flex items-start gap-4">
                  <Phone size={18} className="mt-1 text-[#818cf8]" />
                  <div>
                    <p className="font-bold text-white">+5689 2589 6325</p>
                    <p className="text-xs">Emergency 24/7</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail size={18} className="mt-1 text-[#818cf8]" />
                  <p>info@indigo.com</p>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin size={18} className="mt-1 text-[#818cf8]" />
                  <p>Austin, Texas &amp; Greater Metro Area</p>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-8 text-lg font-bold">Open Hours</h4>
              <ul className="space-y-4 text-sm text-slate-300">
                <li>Open 24/7</li>
                <li className="text-xs leading-relaxed">
                  Emergency service available nights, weekends, and holidays.
                </li>
                <li className="flex items-center gap-2 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    License:
                  </span>
                  <span className="text-[10px] text-white">
                    LIC# TX-PLM-48291
                  </span>
                  <a
                    href="#"
                    className="text-[10px] text-[#818cf8] hover:underline"
                  >
                    Verify
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mb-8 h-px w-full bg-white/10" />
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-400 md:flex-row">
            <p>© 2026 INDIGO. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </Shell>
      </footer>
    </div>
  );
}
