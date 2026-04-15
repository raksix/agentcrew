'use client';

import { useTranslations } from 'next-intl';

const services = [
  { key: 'corporate', icon: '🏛️' },
  { key: 'criminal', icon: '⚖️' },
  { key: 'family', icon: '👨‍👩‍👧‍👦' },
  { key: 'realEstate', icon: '🏠' },
  { key: 'labor', icon: '💼' },
  { key: 'intellectual', icon: '💡' },
];

export default function ServicesPage() {
  const t = useTranslations();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('nav.services')}</h1>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.key}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl mb-6">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t(`services.items.${service.key}.title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`services.items.${service.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}