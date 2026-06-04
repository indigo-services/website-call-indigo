import type { ValuePropBlock } from '../types';

/* ─── Home value prop (Management + Services) ─── */
export const homeValueProp: ValuePropBlock = {
  __type: 'value-prop',
  label: 'Residential Services',
  title: 'Love your residence forever with our Indigo Home Management membership.',
  subtitle: 'Our local crews provide all home services so your family can achieve peace of mind with everything related to your home.',
  darkCard: {
    cardLabel: 'Membership',
    title: 'Indigo Home Management',
    body: 'All new customers are given a free inspection of their entire address to identify all options to maximize property value over time. Our mission is to give our customers peace of mind throughout the continuum of owning, leasing, renting, buying, or selling the address. Our homes membership also involves our turn-key STR and LTR services to increase rental income for property owners. Please inquire to learn more.',
    cta: { label: 'Book an Inspection', href: '/forms/appointment' },
  },
  lightCard: {
    cardLabel: 'Licensed & Insured',
    title: 'Indigo Home Services',
    body: 'Locally licensed and insured home services including plumbing, electrical, HVAC, carpentry, make-readies, painting, flooring, landscaping, remodeling, construction, handyman services, repairs, and more. We offer discounted rates for all of our services to senior citizens, military, and members.',
    link: { label: 'Explore commercial services', href: '/commercial' },
  },
} as const;

/* ─── Residential value prop (same content, used on /residential) ─── */
export const residentialValueProp: ValuePropBlock = homeValueProp;

/* ─── Commercial value prop (Management + Partners) ─── */
export const commercialValueProp: ValuePropBlock = {
  __type: 'value-prop',
  label: undefined,
  title: 'National crews, full range of services',
  darkCard: {
    cardLabel: 'Indigo Facility Management',
    title: 'Facility Management',
    body: "All new customers are given a free inspection of their entire address to identify all options to optimize facility maintenance over time. Our mission is to give our customers peace of mind throughout the continuum of owning, leasing, renting, buying, or selling the address. Our facility membership also involves our FM scope program to plan and predict the current and future demands of your facility's custom maintenance strategy. By getting your FM scope defined and or optimized with us, your team will avoid the frustration and high-costs of navigating facility maintenance alone.",
    cta: { label: 'Learn More', href: '/forms/commercial' },
  },
  lightCard: {
    cardLabel: 'Indigo Facility Partners',
    title: 'Facility Services',
    body: 'In addition to our membership, we provide nationally insured facility services for property teams that need reliable, professional support without a full management commitment.',
    link: { label: 'Contact us', href: '/forms/commercial' },
  },
} as const;
