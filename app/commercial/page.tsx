import type { Metadata } from 'next';

import { CommercialPage } from '@/components/approval-commercial/commercial-page';
import { indigoWebsiteContent } from '@/content/indigo-website';

export const metadata: Metadata = {
  title: indigoWebsiteContent.commercial.seo.title,
  description: indigoWebsiteContent.commercial.seo.description,
};

export default function CommercialRoutePage() {
  return <CommercialPage />;
}
