'use client';

import { useTranslations } from 'next-intl';
import { Input, Textarea, Button } from '@nextui-org/react';
import { PhoneIcon, MapPinIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-blue-100">{t('subtitle')}</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">İletişim Formu</h2>
              <div className="space-y-4">
                <Input
                  label={t('name')}
                  variant="bordered"
                  className="w-full"
                />
                <Input
                  label={t('email')}
                  type="email"
                  variant="bordered"
                  className="w-full"
                />
                <Input
                  label={t('phone')}
                  type="tel"
                  variant="bordered"
                  className="w-full"
                />
                <Input
                  label={t('subject')}
                  variant="bordered"
                  className="w-full"
                />
                <Textarea
                  label={t('message')}
                  variant="bordered"
                  className="w-full"
                  minRows={5}
                />
                <Button color="primary" size="lg" className="w-full">
                  {t('submit')}
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">İletişim Bilgileri</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPinIcon className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('address')}</h3>
                    <p className="text-gray-600">Levent Mah. Kanyon No: 4 Kat: 12<br />Beşiktaş, İstanbul 34394</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <PhoneIcon className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('phoneLabel')}</h3>
                    <p className="text-gray-600">+90 212 555 0123</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('emailLabel')}</h3>
                    <p className="text-gray-600">info@hukukdan.com</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                <span className="text-gray-500">Harita yakında eklenecek</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}