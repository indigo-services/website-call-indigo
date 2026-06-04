'use client';

import { useEffect } from 'react';

import { PageLayout } from '@/components/shared/block-renderer';
import { site } from '@/content';
import { homePage } from '@/content';
import { restoreScrollOnReturn } from '@/lib/lead-form-origin';

export function ApprovalLandingPage() {
  useEffect(() => { restoreScrollOnReturn(); }, []);

  const heroPhoneLabel = 'Call today';

  return (
    <PageLayout
      navigation={homePage.navigation}
      sections={homePage.sections}
      site={site}
      footer={undefined}
      heroPhoneLabel={heroPhoneLabel}
    />
  );
}
