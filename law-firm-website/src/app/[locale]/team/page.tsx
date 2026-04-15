'use client';

import { useTranslations } from 'next-intl';
import { Avatar } from '@nextui-org/react';

const lawyers = [
  {
    name: 'Dr. Ahmet Yılmaz',
    title: 'Kurucu Ortak',
    specialization: 'Kurumsal Hukuk',
    image: '👨‍💼',
    experience: '25 yıl',
  },
  {
    name: 'Elif Kaya',
    title: 'Ortak',
    specialization: 'Ceza Hukuku',
    image: '👩‍💼',
    experience: '15 yıl',
  },
  {
    name: 'Mehmet Demir',
    title: 'Kıdemli Avukat',
    specialization: 'Gayrimenkul Hukuku',
    image: '👨‍⚖️',
    experience: '12 yıl',
  },
  {
    name: 'Zeynep Aksoy',
    title: 'Avukat',
    specialization: 'Aile Hukuku',
    image: '👩‍⚖️',
    experience: '8 yıl',
  },
];

export default function TeamPage() {
  const t = useTranslations();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('team.title')}</h1>
          <p className="text-xl text-blue-100">{t('team.subtitle')}</p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer.name}
                className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <Avatar
                  src={lawyer.image}
                  className="w-32 h-32 mx-auto mb-4 text-6xl"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {lawyer.name}
                </h3>
                <p className="text-blue-600 font-medium mb-2">{lawyer.title}</p>
                <p className="text-gray-600 text-sm mb-2">{lawyer.specialization}</p>
                <p className="text-gray-500 text-sm">{lawyer.experience} deneyim</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}