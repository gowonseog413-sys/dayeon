"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { countEditorStats } from "@/lib/sections-to-html";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

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
  placeholder,
  minHeight = 420,
}: Props) {
  const { t, tFmt } = useI18n();
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [stats, setStats] = useState(() => countEditorStats(value));

  const displayPlaceholder = placeholder ?? t("erp.editor.placeholder");

  const fonts = useMemo(
    () => [
      { label: t("erp.editor.fontDefault"), value: "Pretendard, 'Noto Sans KR', sans-serif" },
      { label: t("erp.editor.fontNoto"), value: "'Noto Sans KR', sans-serif" },
      { label: t("erp.editor.fontNanum"), value: "'Nanum Gothic', sans-serif" },
      { label: t("erp.editor.fontSerif"), value: "Georgia, 'Times New Roman', serif" },
      { label: t("erp.editor.fontSans"), value: "Arial, Helvetica, sans-serif" },
    ],
    [t],
  );

  const sizes = useMemo(
    () => [
      { label: t("erp.editor.sizeSmall"), value: "2" },
      { label: t("erp.editor.sizeNormal"), value: "3" },
      { label: t("erp.editor.sizeLarge"), value: "4" },
      { label: t("erp.editor.sizeHeading"), value: "5" },
    ],
    [t],
  );

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
          defaultValue={fonts[0].value}
          onChange={(e) => exec("fontName", e.target.value)}
          title={t("erp.editor.fontTitle")}
        >
          {fonts.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs"
          defaultValue="3"
          onChange={(e) => exec("fontSize", e.target.value)}
          title={t("erp.editor.sizeTitle")}
        >
          {sizes.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <ToolbarBtn title={t("erp.editor.bold")} onClick={() => exec("bold")}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn title={t("erp.editor.italic")} onClick={() => exec("italic")}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn title={t("erp.editor.underline")} onClick={() => exec("underline")}>
          <span className="underline">U</span>
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <ToolbarBtn title={t("erp.editor.heading")} onClick={() => exec("formatBlock", "h2")}>
          H2
        </ToolbarBtn>
        <ToolbarBtn title={t("erp.editor.subheading")} onClick={() => exec("formatBlock", "h3")}>
          H3
        </ToolbarBtn>
        <ToolbarBtn title={t("erp.editor.paragraph")} onClick={() => exec("formatBlock", "p")}>
          P
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <ToolbarBtn title={t("erp.editor.bulletList")} onClick={() => exec("insertUnorderedList")}>
          {t("erp.editor.bulletList")}
        </ToolbarBtn>
        <ToolbarBtn title={t("erp.editor.numberedList")} onClick={() => exec("insertOrderedList")}>
          {t("erp.editor.numberedList")}
        </ToolbarBtn>
        <ToolbarBtn
          title={t("erp.editor.link")}
          onClick={() => {
            const url = window.prompt(t("erp.editor.linkPrompt"));
            if (url) exec("createLink", url);
          }}
        >
          {t("erp.editor.link")}
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <ToolbarBtn title={t("erp.editor.alignLeft")} onClick={() => exec("justifyLeft")}>
          ≡
        </ToolbarBtn>
        <ToolbarBtn title={t("erp.editor.alignCenter")} onClick={() => exec("justifyCenter")}>
          ≡
        </ToolbarBtn>
        <span className="ml-auto">
          <ToolbarBtn
            title={t("erp.editor.htmlSource")}
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
          data-placeholder={displayPlaceholder}
          onInput={syncFromEditor}
          onBlur={syncFromEditor}
          className="blog-html-editor cms-html-body w-full px-5 py-4 text-[15px] leading-[1.75] text-gray-800 outline-none"
          style={{ minHeight }}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-[#faf8f5] px-4 py-2 text-xs text-gray-500">
        <span>
          {tFmt("erp.editor.stats", {
            chars: stats.chars,
            noSpace: stats.charsWithSpaces,
            words: stats.words,
          })}
        </span>
        <span className="text-[10px] text-gray-400">{t("erp.editor.footerHint")}</span>
      </div>
    </div>
  );
}
