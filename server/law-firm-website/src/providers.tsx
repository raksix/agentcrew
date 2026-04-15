"use client";

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { locales } from "./i18n";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const router = useRouter();

  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}