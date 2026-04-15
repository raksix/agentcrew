import { getTranslations } from "next-intl/server";
import { ScaleIcon } from "@/components/icons";

export default async function ServicesPage() {
  const t = await getTranslations();

  const services = [
    {
      key: "corporate",
      icon: ScaleIcon,
    },
    {
      key: "criminal",
      icon: ScaleIcon,
    },
    {
      key: "family",
      icon: ScaleIcon,
    },
    {
      key: "realestate",
      icon: ScaleIcon,
    },
    {
      key: "labor",
      icon: ScaleIcon,
    },
    {
      key: "intellectual",
      icon: ScaleIcon,
    },
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Geniş yelpazede hukuki çözümler sunuyoruz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t(`services.items.${key}` as any)}
              </h3>
              <p className="text-gray-600">
                {t(`services.items.${key}_desc` as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}