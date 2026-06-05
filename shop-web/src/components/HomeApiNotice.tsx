"use client";

import { useI18n } from "@/components/I18nProvider";

type Props = {
  apiUrl: string;
};

export function HomeApiNotice({ apiUrl }: Props) {
  const { t, tFmt } = useI18n();
  return (
    <section className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-lg font-medium text-gray-800">{t("home.apiFail")}</p>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {t("home.apiFailDetail")}
        <br />
        {tFmt("home.apiFailUrl", { url: apiUrl })}
      </p>
      <ol className="mt-6 space-y-2 text-left text-sm text-gray-600">
        <li>1. {t("home.apiStep1")}</li>
        <li>2. {t("home.apiStep2")}</li>
        <li>3. {t("home.apiStep3")}</li>
      </ol>
      <p className="mt-6 text-xs text-gray-400">{t("home.apiRefresh")}</p>
    </section>
  );
}
