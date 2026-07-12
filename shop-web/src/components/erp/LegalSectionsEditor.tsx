"use client";

import { useI18n } from "@/components/I18nProvider";
import type { LegalSection } from "@/i18n/legal/types";

type Props = {
  sections: LegalSection[];
  onChange: (sections: LegalSection[]) => void;
};

function emptySection(): LegalSection {
  return { heading: "", paragraphs: [""] };
}

export function LegalSectionsEditor({ sections, onChange }: Props) {
  const { t, tFmt } = useI18n();

  function updateSection(i: number, patch: Partial<LegalSection>) {
    onChange(sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  return (
    <div className="space-y-4">
      {sections.map((sec, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              {tFmt("erp.sections.label", { n: i + 1 })}
            </span>
            <button
              type="button"
              onClick={() => onChange(sections.filter((_, idx) => idx !== i))}
              className="text-xs text-red-500"
            >
              {t("erp.sections.remove")}
            </button>
          </div>
          <input
            placeholder={t("erp.sections.headingPlaceholder")}
            value={sec.heading || ""}
            onChange={(e) => updateSection(i, { heading: e.target.value })}
            className="mb-2 w-full rounded border bg-white px-3 py-2 text-sm"
          />
          <label className="mb-1 block text-xs text-gray-500">{t("erp.legalSections.bodyLabel")}</label>
          <textarea
            rows={5}
            value={(sec.paragraphs ?? []).join("\n\n")}
            onChange={(e) =>
              updateSection(i, {
                paragraphs: e.target.value.split(/\n\n+/).filter((p) => p.length > 0),
              })
            }
            className="mb-3 w-full rounded border bg-white px-3 py-2 text-sm"
          />
          <label className="mb-1 block text-xs text-gray-500">{t("erp.legalSections.listLabel")}</label>
          <textarea
            rows={4}
            value={(sec.list ?? []).join("\n")}
            onChange={(e) =>
              updateSection(i, {
                list: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
              })
            }
            className="w-full rounded border bg-white px-3 py-2 text-sm"
            placeholder={t("erp.legalSections.listPlaceholder")}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...sections, emptySection()])}
        className="rounded-full border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[var(--pink-accent)]"
      >
        {t("erp.sections.add")}
      </button>
    </div>
  );
}
