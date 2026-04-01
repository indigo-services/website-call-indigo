import type { Metadata } from 'next';

import { ApprovalLandingPage } from '@/components/approval-home/landing-page';

export const metadata: Metadata = {
  title: 'Indigo Home',
  description:
    'Public preview for the Indigo residential conversion experience and brand release baseline.',
};

export default function HomePage() {
  return <ApprovalLandingPage />;
}
