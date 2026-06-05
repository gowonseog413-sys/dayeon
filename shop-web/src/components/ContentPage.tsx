type Section = { heading: string; paragraphs: string[] };

type Props = {
  title: string;
  sections: Section[];
  twoColumn?: boolean;
};

export function ContentPage({ title, sections, twoColumn }: Props) {
  const earn = sections.find((s) => s.heading.includes("획득"));
  const use = sections.find((s) => s.heading.includes("사용"));
  const rest = sections.filter((s) => s !== earn && s !== use);

  if (twoColumn && earn && use) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-10 text-3xl font-semibold">{title}</h1>
        <div className="mb-10 grid gap-10 md:grid-cols-2">
          {[earn, use].map((s) => (
            <div key={s.heading}>
              <h2 className="mb-4 text-lg font-semibold">{s.heading}</h2>
              <div className="space-y-2 text-sm leading-relaxed text-gray-700">
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        {rest.map((s) => (
          <SectionBlock key={s.heading || "x"} section={s} />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-10 text-3xl font-semibold">{title}</h1>
      <div className="space-y-8">
        {sections.map((s) => (
          <SectionBlock key={s.heading || "main"} section={s} />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: Section }) {
  return (
    <section>
      {section.heading && (
        <h2 className="mb-3 text-lg font-semibold">{section.heading}</h2>
      )}
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        {section.paragraphs.map((p) => (
          <p key={p.slice(0, 32)} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
