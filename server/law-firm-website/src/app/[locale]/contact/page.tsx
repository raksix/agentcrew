"use client";

import { useTranslations } from "next-intl";
import { PhoneIcon, MailIcon, MapPinIcon } from "@/components/icons";
import { Input, TextArea, Button } from "@heroui/react";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("title")}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">{t("info_title")}</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t("phone_title")}</h3>
                  <p className="text-gray-600">+90 212 555 0123</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MailIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t("email_title")}</h3>
                  <p className="text-gray-600">info@atlashukuk.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t("address_title")}</h3>
                  <p className="text-gray-600">
                    Levent Mah. Kanyon Plaza No: 28<br />
                    Beşiktaş, İstanbul
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="font-semibold text-gray-900 mb-4">{t("hours_title")}</h3>
              <div className="text-gray-600 space-y-2">
                <p>Pazartesi - Cuma: 09:00 - 18:00</p>
                <p>Cumartesi: 10:00 - 14:00</p>
                <p>Pazar: Kapalı</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t("form_title")}</h2>
            <div className="space-y-6">
              <Input label={t("name_label")} placeholder={t("name_placeholder")} />
              <Input label={t("email_label")} type="email" placeholder={t("email_placeholder")} />
              <Input label={t("phone_label")} type="tel" placeholder={t("phone_placeholder")} />
              <TextArea label={t("message_label")} placeholder={t("message_placeholder")} rows={5} />
              <Button className="w-full bg-primary text-white py-6 text-lg font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                {t("submit_button")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}