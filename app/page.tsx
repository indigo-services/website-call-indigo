import type { Metadata } from 'next';

import { ApprovalLandingPage } from '@/components/approval-home/landing-page';
import { indigoWebsiteContent } from '@/content/indigo-website';

export const metadata: Metadata = {
  title: indigoWebsiteContent.home.seo.title,
  description: indigoWebsiteContent.home.seo.description,
};

export default function HomePage() {
  return <ApprovalLandingPage />;
}
