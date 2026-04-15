import { getTranslations } from "next-intl/server";
import { Button } from "@heroui/react";
import { ScaleIcon } from "@/components/icons";

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 text-white py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="mb-6">
              <ScaleIcon className="w-20 h-20 mx-auto text-secondary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{t("hero.title")}</h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <Button
              size="lg"
              className="bg-secondary text-white px-8 py-6 text-lg font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              {t("hero.cta")}
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("services.title")}</h2>
            <p className="text-xl text-gray-600">{t("services.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {["corporate", "criminal", "family", "realestate", "labor", "intellectual"].map((key) => (
              <div
                key={key}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <ScaleIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t(`services.items.${key}` as any)}
                </h3>
                <p className="text-gray-600">
                  {t(`services.items.${key}_desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">25+</div>
              <div className="text-xl text-gray-200">{t("stats.years")}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1,200+</div>
              <div className="text-xl text-gray-200">{t("stats.cases")}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">800+</div>
              <div className="text-xl text-gray-200">{t("stats.clients")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl mb-8 text-white/90">{t("cta.subtitle")}</p>
          <Button
            size="lg"
            className="bg-white text-primary px-8 py-6 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t("cta.button")}
          </Button>
        </div>
      </section>
    </>
  );
}