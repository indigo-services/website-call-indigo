import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ClientSlugHandler from '../[locale]/(marketing)/ClientSlugHandler';
import PageContent from '@/lib/shared/PageContent';
import { generateMetadataObject } from '@/lib/shared/metadata';
import { fetchCollectionType } from '@/lib/strapi';

export async function generateMetadata(): Promise<Metadata> {
  const [pageData] = await fetchCollectionType('pages', {
    filters: {
      slug: {
        $eq: 'homepage',
      },
      locale: 'en',
    },
  });

  if (!pageData) {
    return {
      title: 'Launch Demo',
      description: 'Archived LaunchPad demo view for release comparison.',
    };
  }

  return generateMetadataObject(pageData.seo);
}

export default async function HomeDemoPage() {
  const [pageData] = await fetchCollectionType('pages', {
    filters: {
      slug: {
        $eq: 'homepage',
      },
      locale: 'en',
    },
  });

  if (!pageData) {
    notFound();
  }

  const localizedSlugs =
    pageData.localizations?.reduce(
      (acc: Record<string, string>, localization: any) => {
        acc[localization.locale] = localization.slug;
        return acc;
      },
      { en: '' }
    ) ?? { en: '' };

  return (
    <>
      <ClientSlugHandler localizedSlugs={localizedSlugs} />
      <PageContent pageData={pageData} />
    </>
  );
}
