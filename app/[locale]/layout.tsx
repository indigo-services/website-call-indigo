import { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { Inter } from 'next/font/google';
import { draftMode } from 'next/headers';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { Banner } from '@/components/banner';
import { DraftModeBanner } from '@/components/draft-mode-banner';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { AIToast } from '@/components/toast';
import { CartProvider } from '@/context/cart-context';
import { generateMetadataObject } from '@/lib/shared/metadata';
import { fetchSingleType, fetchSingleTypeOrNull, DEFAULT_GLOBAL_DATA } from '@/lib/strapi';
import { cn } from '@/lib/utils';
import { i18n } from '@/i18n.config';
import type { LocaleParamsProps } from '@/types/types';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

/**
 * Safely extract locale from params, defaulting to 'en'
 * Handles both [locale] and [[...locale]] dynamic segments  
 */
function extractLocale(locale: any): string {
  if (!locale) return i18n.defaultLocale;
  if (Array.isArray(locale)) return locale[0] || i18n.defaultLocale;
  return locale;
}

// Default Global SEO for pages without them
export async function generateMetadata({
  params,
}: PropsWithChildren<LocaleParamsProps>): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = extractLocale(rawLocale);

  try {
    const pageData = await fetchSingleType('global', { locale });
    const seo = pageData.seo;
    return generateMetadataObject(seo);
  } catch (error) {
    console.warn(
      `[Metadata] Could not fetch global data for locale "${locale}"`,
      error instanceof Error ? error.message : error
    );
    return generateMetadataObject(DEFAULT_GLOBAL_DATA.seo || {});
  }
}

export default async function LocaleLayout({
  children,
  params,
}: PropsWithChildren<LocaleParamsProps>) {
  const { isEnabled: isDraftMode } = await draftMode();
  const { locale: rawLocale } = await params;
  const locale = extractLocale(rawLocale);

  let pageData = null;
  try {
    pageData = await fetchSingleType('global', { locale });
  } catch (error) {
    console.warn(
      `[Layout] Could not fetch global data for locale "${locale}", using defaults`,
      error instanceof Error ? error.message : error
    );
    // Fall back to default data when fetch fails
    pageData = DEFAULT_GLOBAL_DATA;
  }

  const isDemo = process.env.NEXT_IS_DEMO === 'true';

  return (
    <ViewTransitions>
      <CartProvider>
        <div
          className={cn(
            inter.className,
            'bg-charcoal antialiased h-full w-full'
          )}
        >
          {isDemo && <Banner />}
          <Navbar data={pageData.navbar} locale={locale} hasBanner={isDemo} />
          {children}
          <Footer data={pageData.footer} locale={locale} />
          <AIToast />
          {isDraftMode && <DraftModeBanner />}
        </div>
      </CartProvider>
    </ViewTransitions>
  );
}
