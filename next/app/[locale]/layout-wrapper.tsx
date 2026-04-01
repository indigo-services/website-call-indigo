import { i18n } from '@/i18n.config';
import LocaleLayout from '@/app/[locale]/layout';
import type { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Indigo Studio',
  description: 'Loading...',
};

export default async function RootLayout({
  children,
}: PropsWithChildren) {
  // Wrap children with the locale layout using default locale
  const mockParams = { locale: i18n.defaultLocale };

  return (
    <LocaleLayout params={Promise.resolve(mockParams)}>
      {children}
    </LocaleLayout>
  );
}
