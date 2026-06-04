'use client';

import { useEffect } from 'react';

import { PageLayout } from '@/components/shared/block-renderer';
import { site } from '@/content';
import { residentialPage } from '@/content';
import { restoreScrollOnReturn } from '@/lib/lead-form-origin';

export function ResidentialPage() {
  useEffect(() => { restoreScrollOnReturn(); }, []);

  const heroPhoneLabel = 'Call for a Consultation';

  return (
    <PageLayout
      navigation={residentialPage.navigation}
      sections={residentialPage.sections}
      site={site}
      footer={residentialPage.footer}
      heroPhoneLabel={heroPhoneLabel}
    />
  );
}
