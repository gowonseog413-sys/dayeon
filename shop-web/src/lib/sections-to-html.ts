type CmsSection = { heading?: string; paragraphs?: string[]; list?: string[] };

function esc(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sectionsToHtml(sections: CmsSection[]): string {
  if (!sections?.length) return "<p></p>";
  return sections
    .map((s) => {
      const parts: string[] = [];
      if (s.heading?.trim()) {
        parts.push(`<h2>${esc(s.heading.trim())}</h2>`);
      }
      for (const p of s.paragraphs ?? []) {
        if (!p.trim()) continue;
        parts.push(`<p>${esc(p).replace(/\n/g, "<br>")}</p>`);
      }
      if (s.list?.length) {
        parts.push(
          `<ul>${s.list.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`,
        );
      }
      return parts.join("");
    })
    .join("") || "<p></p>";
}

export function htmlToPlainText(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

export function countEditorStats(html: string) {
  const plain = htmlToPlainText(html);
  const chars = plain.length;
  const charsWithSpaces = plain.replace(/\s/g, "").length;
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  return { chars, charsWithSpaces, words, plain };
}
