import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['tr', 'en', 'de', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'tr';

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale ?? defaultLocale;

  if (!locales.includes(validLocale as Locale)) notFound();

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});