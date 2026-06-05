"use client";

type Section = { heading: string; paragraphs: string[] };

type Props = {
  sections: Section[];
  onChange: (sections: Section[]) => void;
};

export function SectionsEditor({ sections, onChange }: Props) {
  function updateSection(i: number, patch: Partial<Section>) {
    const next = sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange(next);
  }

  function addSection() {
    onChange([...sections, { heading: "", paragraphs: [""] }]);
  }

  function removeSection(i: number) {
    onChange(sections.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      {sections.map((sec, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">섹션 {i + 1}</span>
            <button
              type="button"
              onClick={() => removeSection(i)}
              className="text-xs text-red-500"
            >
              섹션 삭제
            </button>
          </div>
          <input
            placeholder="소제목 (비워두면 본문만 표시)"
            value={sec.heading}
            onChange={(e) => updateSection(i, { heading: e.target.value })}
            className="mb-2 w-full rounded border bg-white px-3 py-2 text-sm"
          />
          <textarea
            placeholder="본문 (줄바꿈으로 문단 구분)"
            rows={4}
            value={sec.paragraphs.join("\n\n")}
            onChange={(e) =>
              updateSection(i, {
                paragraphs: e.target.value.split(/\n\n+/).filter(Boolean),
              })
            }
            className="w-full rounded border bg-white px-3 py-2 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addSection}
        className="rounded-full border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[var(--pink-accent)]"
      >
        + 섹션 추가
      </button>
    </div>
  );
}
