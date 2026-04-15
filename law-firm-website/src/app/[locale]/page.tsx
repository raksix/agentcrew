'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@nextui-org/react';
import { ScaleIcon, ShieldCheckIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const stats = [
  { key: 'experience', value: '25+', icon: ScaleIcon },
  { key: 'cases', value: '2,500+', icon: ShieldCheckIcon },
  { key: 'clients', value: '1,800+', icon: UsersIcon },
  { key: 'team', value: '12', icon: ChartBarIcon },
];

const services = [
  { key: 'corporate', icon: '🏛️' },
  { key: 'criminal', icon: '⚖️' },
  { key: 'family', icon: '👨‍👩‍👧‍👦' },
  { key: 'realEstate', icon: '🏠' },
  { key: 'labor', icon: '💼' },
  { key: 'intellectual', icon: '💡' },
];

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              {t('hero.subtitle')}
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8"
            >
              {t('hero.cta')}
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('services.title')}
            </h2>
            <p className="text-lg text-gray-600">{t('services.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.key}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
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

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('stats.title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.key} className="text-center">
                  <Icon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {t(`stats.${stat.key}`)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hemen Danışın
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Sorularınız için bizi arayın veya form doldurun
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8"
          >
            İletişime Geçin
          </Button>
        </div>
      </section>
    </>
  );
}