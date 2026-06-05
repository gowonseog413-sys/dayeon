type Props = {
  html: string;
  className?: string;
};

/** ERP에서 작성한 HTML 본문 — 쇼핑몰 표시용 */
export function CmsHtmlBody({ html, className = "" }: Props) {
  return (
    <div
      className={`cms-html-body text-sm leading-relaxed text-gray-800 ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
