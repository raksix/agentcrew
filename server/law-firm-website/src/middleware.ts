import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale: "tr",
});

export const config = {
  matcher: ["/", "/(en|de|ar)/:path*"],
};