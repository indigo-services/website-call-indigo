import type { Metadata } from 'next';

import { ApprovalLandingPage } from '@/components/approval-home/landing-page';
import { homePage, site } from '@/content';

export const metadata: Metadata = {
  title: homePage.seo.title,
  description: homePage.seo.description,
};

export default function HomePage() {
  return <ApprovalLandingPage />;
}
