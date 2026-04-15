"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { GlobeIcon } from "@/components/icons";

export default function Navigation() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split("/")[1] as Locale;

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href={`/${currentLocale}`} className="text-2xl font-bold text-primary">
              ATLAS HUKUK
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href={`/${currentLocale}`} className="text-gray-700 hover:text-primary transition-colors">
              {t("home")}
            </a>
            <a href={`/${currentLocale}/about`} className="text-gray-700 hover:text-primary transition-colors">
              {t("about")}
            </a>
            <a href={`/${currentLocale}/services`} className="text-gray-700 hover:text-primary transition-colors">
              {t("services")}
            </a>
            <a href={`/${currentLocale}/team`} className="text-gray-700 hover:text-primary transition-colors">
              {t("team")}
            </a>
            <a href={`/${currentLocale}/contact`} className="text-gray-700 hover:text-primary transition-colors">
              {t("contact")}
            </a>
          </div>

          <div className="flex items-center">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="light" startContent={<GlobeIcon className="w-5 h-5" />}>
                  {localeNames[currentLocale]}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Language selection">
                {locales.map((loc) => (
                  <DropdownItem key={loc} onPress={() => switchLocale(loc)}>
                    {localeNames[loc]}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
}