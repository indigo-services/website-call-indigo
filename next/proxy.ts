import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { i18n } from '@/i18n.config';

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales: Readonly<string[]> = i18n.locales;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(languages, locales, i18n.defaultLocale);
  } catch {
    return i18n.defaultLocale;
  }
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname === '/' ||
    pathname === '/approval-home' ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')
  ) {
    return;
  }

  // Check if any non-default locale is present in pathname
  const nonDefaultLocales = i18n.locales.filter(
    (locale) => locale !== i18n.defaultLocale
  );
  const hasNonDefaultLocale = nonDefaultLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Check if default locale is in pathname
  const hasDefaultLocale =
    pathname.startsWith(`/${i18n.defaultLocale}/`) ||
    pathname === `/${i18n.defaultLocale}`;

  // If default locale is in pathname, remove it (e.g., /en/home -> /home)
  if (hasDefaultLocale) {
    const pathWithoutLocale = pathname.replace(
      new RegExp(`^/${i18n.defaultLocale}(/|$)`),
      '/'
    );
    return NextResponse.redirect(new URL(pathWithoutLocale, request.url));
  }

  // If non-default locale is present, keep it as is
  if (hasNonDefaultLocale) {
    return;
  }

  // If no locale in pathname and no non-default locale, check if we need to add one
  const locale = getLocale(request);
  if (locale && locale !== i18n.defaultLocale) {
    // Non-default locale detected, add it to pathname
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    );
  }

  // Default locale - keep pathname as is (no prefix)
  return;
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
