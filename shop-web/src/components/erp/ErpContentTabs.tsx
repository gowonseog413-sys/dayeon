"use client";

type Tab = {
  id: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

/** 본문 상단 인라인 탭 — 하단문서 연혁 탭과 동일한 둥근 테두리 스타일 */
export function ErpContentTabs({ tabs, active, onChange, className = "" }: Props) {
  return (
    <nav className={className} aria-label="페이지 탭">
      <ul className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "border border-gray-900 font-medium text-gray-900"
                    : "border border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-1.5 border-b border-gray-200" />
    </nav>
  );
}
