"use client";

import { useI18n } from "@/components/I18nProvider";

type Props = {
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  children: React.ReactNode;
  className?: string;
};

/** ERP 본문 공통 래퍼 */
export function ErpPageShell({
  title,
  titleKey,
  description,
  descriptionKey,
  children,
  className = "",
}: Props) {
  const { t } = useI18n();
  const displayTitle = titleKey ? t(titleKey) : (title ?? "");
  const displayDesc = descriptionKey ? t(descriptionKey) : description;

  return (
    <div className={className}>
      <header className="mb-1 shrink-0">
        <h2 className="text-lg font-semibold leading-tight">{displayTitle}</h2>
        {displayDesc ? (
          <p className="mt-0.5 text-sm leading-snug text-gray-500">{displayDesc}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
