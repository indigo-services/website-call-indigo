import type { Metadata } from 'next';

import { ResidentialPage } from '@/components/approval-residential/residential-page';
import { residentialPage } from '@/content';

export const metadata: Metadata = {
  title: residentialPage.seo.title,
  description: residentialPage.seo.description,
};

export default function ResidentialRoutePage() {
  return <ResidentialPage />;
}
