/** 데스크톱 메인 네비 — 라벨·링크·드롭다운 높이 통일 */
const NAV_ITEM_BASE =
  "inline-flex shrink-0 items-center whitespace-nowrap border-b-2 border-transparent pb-px leading-none transition";

export function navItemLinkClass(isClean: boolean): string {
  return isClean
    ? `${NAV_ITEM_BASE} hover:text-gray-900`
    : `${NAV_ITEM_BASE} hover:text-[var(--pink-accent)]`;
}

export function navItemDropdownClass(isClean: boolean, open: boolean): string {
  const hover = isClean ? "hover:text-gray-900" : "hover:text-[var(--pink-accent)]";
  const active = isClean
    ? open
      ? "border-gray-900 text-gray-900"
      : ""
    : open
      ? "border-[var(--pink-accent)] text-[var(--pink-accent)]"
      : "";
  return `${NAV_ITEM_BASE} cursor-default ${hover} ${active}`.trim();
}
