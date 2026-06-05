"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { countEditorStats } from "@/lib/sections-to-html";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

const FONTS = [
  { label: "기본 (Pretendard)", value: "Pretendard, 'Noto Sans KR', sans-serif" },
  { label: "Noto Sans KR", value: "'Noto Sans KR', sans-serif" },
  { label: "나눔고딕", value: "'Nanum Gothic', sans-serif" },
  { label: "명조", value: "Georgia, 'Times New Roman', serif" },
  { label: "고딕", value: "Arial, Helvetica, sans-serif" },
];

const SIZES = [
  { label: "작게", value: "2" },
  { label: "보통", value: "3" },
  { label: "크게", value: "4" },
  { label: "제목", value: "5" },
];

function ToolbarBtn({
  children,
  title,
  onClick,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm transition ${
        active ? "bg-[#8b5a45] text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export function BlogHtmlEditor({
  value,
  onChange,
  placeholder = "본문을 입력하세요…",
  minHeight = 420,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [stats, setStats] = useState(() => countEditorStats(value));

  const syncFromEditor = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(html);
    setStats(countEditorStats(html));
  }, [onChange]);

  useEffect(() => {
    if (!htmlMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
      setStats(countEditorStats(value));
    }
  }, [value, htmlMode]);

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    syncFromEditor();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-[#faf8f5] px-2 py-2">
        <select
          className="max-w-[9rem] rounded border border-gray-200 bg-white px-2 py-1 text-xs"
          defaultValue={FONTS[0].value}
          onChange={(e) => exec("fontName", e.target.value)}
          title="글꼴"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs"
          defaultValue="3"
          onChange={(e) => exec("fontSize", e.target.value)}
          title="글자 크기"
        >
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <ToolbarBtn title="굵게" onClick={() => exec("bold")}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn title="기울임" onClick={() => exec("italic")}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn title="밑줄" onClick={() => exec("underline")}>
          <span className="underline">U</span>
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <ToolbarBtn title="제목" onClick={() => exec("formatBlock", "h2")}>
          H2
        </ToolbarBtn>
        <ToolbarBtn title="소제목" onClick={() => exec("formatBlock", "h3")}>
          H3
        </ToolbarBtn>
        <ToolbarBtn title="본문" onClick={() => exec("formatBlock", "p")}>
          P
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <ToolbarBtn title="글머리" onClick={() => exec("insertUnorderedList")}>
          • 목록
        </ToolbarBtn>
        <ToolbarBtn title="번호" onClick={() => exec("insertOrderedList")}>
          1. 목록
        </ToolbarBtn>
        <ToolbarBtn title="링크" onClick={() => {
          const url = window.prompt("링크 URL");
          if (url) exec("createLink", url);
        }}>
          링크
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <ToolbarBtn title="왼쪽" onClick={() => exec("justifyLeft")}>
          ≡
        </ToolbarBtn>
        <ToolbarBtn title="가운데" onClick={() => exec("justifyCenter")}>
          ≡
        </ToolbarBtn>
        <span className="ml-auto">
          <ToolbarBtn
            title="HTML 소스"
            active={htmlMode}
            onClick={() => setHtmlMode((v) => !v)}
          >
            HTML
          </ToolbarBtn>
        </span>
      </div>

      {htmlMode ? (
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setStats(countEditorStats(e.target.value));
          }}
          className="w-full resize-y border-0 px-4 py-3 font-mono text-sm leading-relaxed text-gray-800 outline-none"
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={syncFromEditor}
          onBlur={syncFromEditor}
          className="blog-html-editor cms-html-body w-full px-5 py-4 text-[15px] leading-[1.75] text-gray-800 outline-none"
          style={{ minHeight }}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-[#faf8f5] px-4 py-2 text-xs text-gray-500">
        <span>
          글자 <strong className="text-gray-700">{stats.chars}</strong>
          {" · "}공백 제외 <strong className="text-gray-700">{stats.charsWithSpaces}</strong>
          {" · "}단어 <strong className="text-gray-700">{stats.words}</strong>
        </span>
        <span className="text-[10px] text-gray-400">네이버 블로그처럼 한 화면에서 통으로 작성</span>
      </div>
    </div>
  );
}
