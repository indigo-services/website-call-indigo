import type { Metadata } from 'next';

import { CommercialPage } from '@/components/approval-commercial/commercial-page';
import { commercialPage } from '@/content';

export const metadata: Metadata = {
  title: commercialPage.seo.title,
  description: commercialPage.seo.description,
};

export default function CommercialRoutePage() {
  return <CommercialPage />;
}
