'use client';

import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('nav.about')}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Hakkımızda</h2>
            <p className="text-gray-600 mb-6">
              1999 yılından bu yana İstanbul'da hizmet veren HukukDan, Türkiye'nin önde gelen avukatlık bürolarından biridir.
              25 yılı aşkın deneyimimizle, binlerce müvekkilimize hukuki çözümler sunduk.
            </p>
            <p className="text-gray-600 mb-6">
              Misyonumuz, her müvekkilimize en yüksek kalitede hukuki hizmet sunarak, haklarını korumak ve
              hukuki hedeflerine ulaşmalarına yardımcı olmaktır. Bunu yaparken, etik değerlerimizden asla ödün vermiyoruz.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Değerlerimiz</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Güvenilirlik ve şeffaflık</li>
              <li>Profesyonellik ve uzmanlık</li>
              <li>Müvekkil memnuniyeti</li>
              <li>Etik davranış</li>
              <li>Sürekli gelişim</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}