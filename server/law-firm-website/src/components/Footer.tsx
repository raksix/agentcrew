import { useTranslations } from "next-intl";
import { PhoneIcon, MailIcon, MapPinIcon } from "./icons";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">ATLAS HUKUK</h3>
            <p className="text-gray-400">
              Profesyonel hukuki danışmanlık ve temsil hizmetleri.
              Müvekkillerimizin haklarını korumak için buradayız.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-secondary" />
                <span>+90 212 555 0123</span>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="w-5 h-5 text-secondary" />
                <span>info@atlashukuk.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-secondary mt-1" />
                <span>Levent Mah. Kanyon Plaza No: 28<br />Beşiktaş, İstanbul</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Çalışma Saatleri</h4>
            <div className="space-y-2 text-gray-400">
              <p>Pazartesi - Cuma: 09:00 - 18:00</p>
              <p>Cumartesi: 10:00 - 14:00</p>
              <p>Pazar: Kapalı</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Atlas Hukuk. {t("rights")}</p>
        </div>
      </div>
    </footer>
  );
}