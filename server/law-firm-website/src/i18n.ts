import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

export const locales = ["tr", "en", "de", "ar"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  ar: "العربية",
};

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  tr: "ltr",
  en: "ltr",
  de: "ltr",
  ar: "rtl",
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});