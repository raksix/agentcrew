import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations();

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hakkımızda</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            25 yılı aşkın deneyimimizle hukuk alanında profesyonel hizmet sunuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Misyonumuz</h2>
            <p className="text-lg text-gray-600 mb-6">
              Müvekkillerimize en yüksek kalitede hukuki danışmanlık sunmak ve haklarını
              en etkili şekilde korumak için çalışıyoruz. Her davaya özel ilgi gösteriyor,
              müvekkillerimizin ihtiyaçlarını anlayarak kişiselleştirilmiş çözümler üretiyoruz.
            </p>
            <p className="text-lg text-gray-600">
              Kurumsal yapımız, deneyimli avukat kadromuz ve güncel hukuki bilgimizle
              müvekkillerimize güvenilir bir hukuk partneri olmaktan gurur duyuyoruz.
            </p>
          </div>
          <div className="bg-gray-200 border-2 border-dashed rounded-xl h-80 flex items-center justify-center">
            <span className="text-gray-500">Görsel</span>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <div className="text-4xl font-bold text-primary mb-2">25+</div>
            <div className="text-gray-600">Yıllık Deneyim</div>
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <div className="text-4xl font-bold text-primary mb-2">15</div>
            <div className="text-gray-600">Uzman Avukat</div>
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-gray-600">Müvekkil Memnuniyeti</div>
          </div>
        </div>
      </div>
    </div>
  );
}