import type { SiteConfig } from '../types';

export const site: SiteConfig = {
  brandName: 'Call Indigo',
  legalName: 'Indigo Home & Facility Services',
  primaryPhone: '(512) 608-4999',
  publicEmail: 'support@call-indigo.com',
  publicEmailDisplay: 'support [at] call-indigo.com',
  address: '1005 Meredith Drive, Austin, TX 78748',
  headquartersCity: 'Austin, TX',
  establishedYear: '2012',
  serviceAreaCities: ['Austin', 'Buda', 'Kyle', 'San Marcos'],
  serviceArea: 'Hays, Travis, and Williamson counties',
  licenseNumber: 'RMP: 45574',
  copyrightName: 'Call Indigo LLC',
} as const;
