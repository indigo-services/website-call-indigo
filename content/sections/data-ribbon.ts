import type { DataRibbonBlock } from '../types';

/* ─── Home data ribbon ─── */
export const homeDataRibbon: DataRibbonBlock = {
  __type: 'data-ribbon',
  items: [
    { value: '52,550+', label: 'Jobs completed' },
    { value: '35K+', label: 'Satisfied clients' },
    { value: '2012', label: 'Established' },
    { value: '100%', label: 'Free inspections' },
  ],
} as const;

/* ─── Commercial data ribbon ─── */
export const commercialDataRibbon: DataRibbonBlock = {
  __type: 'data-ribbon',
  items: [
    { value: '500+', label: 'Crews' },
    { value: '250+', label: 'Locations' },
    { value: 'All 50', label: 'States serviced daily' },
    { value: '100%', label: 'Free inspections' },
  ],
} as const;
