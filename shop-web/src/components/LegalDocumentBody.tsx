import type { LegalSection } from "@/i18n/legal/types";

type Props = {
  sections: LegalSection[];
  listStyle?: "bullet" | "numbered";
};

export function LegalDocumentBody({ sections, listStyle = "bullet" }: Props) {
  return (
    <div className="space-y-8 pr-1 text-sm leading-relaxed text-gray-800">
      {sections.map((section, i) => (
        <article key={`${section.heading ?? "intro"}-${i}`}>
          {section.heading && (
            <h3 className="mb-3 text-base font-bold text-gray-900">{section.heading}</h3>
          )}
          {(section.paragraphs ?? []).map((p) => (
            <p key={p.slice(0, 40)} className="mb-3 last:mb-0">
              {p}
            </p>
          ))}
          {section.list && section.list.length > 0 && (
            <ul className="list-none space-y-3 pl-0">
              {section.list.map((item, j) => (
                <li key={item.slice(0, 32)} className="flex gap-2">
                  {listStyle === "numbered" ? (
                    <span className="shrink-0 font-semibold text-[var(--pink-deep)]">
                      {j + 1}.
                    </span>
                  ) : (
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--pink-accent)]"
                      aria-hidden
                    />
                  )}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
