import type { ServicesGridBlock } from '../types';

/* ─── Home services grid ─── */
export const homeServicesGrid: ServicesGridBlock = {
  __type: 'services-grid',
  label: 'Our Services',
  title: 'Full-service home & property support',
  subtitle: 'Licensed and insured services for Hays, Travis, and Williamson counties. One call covers plumbing, electrical, HVAC, carpentry, painting, and more.',
  items: [
    {
      title: 'Plumbing',
      body: 'Emergency plumbing, water heaters, leak detection, sinks, faucets, toilets, gas lines, and more.',
      icon: 'droplets',
    },
    {
      title: 'Electrical',
      body: 'Residential and commercial electrical, wiring, lighting, ceiling fans, exhaust fans, and panel work.',
      icon: 'zap',
    },
    {
      title: 'HVAC',
      body: 'Heating, ventilation, and air conditioning installation, repair, and maintenance for homes and properties.',
      icon: 'thermometer',
    },
    {
      title: 'Carpentry & Remodeling',
      body: 'Doors, decks, fences, drywall, siding, flooring, full remodeling, and construction projects.',
      icon: 'hammer',
    },
    {
      title: 'Painting & Make-Readies',
      body: 'Interior and exterior painting, make-ready services for rentals, and property turnover coordination.',
      icon: 'paintbrush',
    },
    {
      title: 'Handyman & Repairs',
      body: 'General repairs, handyman services, landscaping, and ongoing property maintenance.',
      icon: 'wrench',
    },
  ],
} as const;

/* ─── Residential services grid (same data) ─── */
export const residentialServicesGrid: ServicesGridBlock = homeServicesGrid;
