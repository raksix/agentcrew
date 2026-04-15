import { Providers } from "../providers";
import { getLocale, getTranslations } from "next-intl/server";
import { localeDirection, localeNames, locales } from "../i18n";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return {
    title: "Atlas Hukuk | Professional Legal Services",
    description: "Professional legal consulting and representation services",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const direction = localeDirection[locale as keyof typeof localeDirection];
  const t = await getTranslations("nav");

  return (
    <html lang={locale} dir={direction}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers locale={locale}>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}