import type { ProcessStepsBlock } from '../types';

/* ─── Home "How It Works" steps ─── */
export const homeProcessSteps: ProcessStepsBlock = {
  __type: 'process-steps',
  label: 'How It Works',
  title: 'A clear path from first call to scheduled work',
  steps: [
    {
      title: 'Call Indigo',
      body: 'Start with one phone call and the address that needs service.',
    },
    {
      title: 'Define the scope',
      body: 'Simple work may be estimated by phone. Larger jobs get a walk-through or detailed proposal.',
    },
    {
      title: 'Schedule the work',
      body: 'Approved estimates are coordinated by the Indigo team and scheduled around your property needs.',
    },
    {
      title: 'Maintain the address',
      body: 'Use Indigo as your ongoing service partner for recurring home and property needs.',
    },
  ],
} as const;
