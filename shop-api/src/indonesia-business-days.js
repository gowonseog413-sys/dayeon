/** 인도네시아(자카르타) 기준 영업일 — 월~금 */
export function isIndonesiaBusinessDay(date = new Date()) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
  }).format(date);
  return weekday !== "Sat" && weekday !== "Sun";
}

/** 발송일 기준 영업일 N일 후 시각 (자동 배송완료 판정용) */
export function addIndonesiaBusinessDays(startIso, businessDays = 5) {
  let cursor = new Date(startIso);
  let added = 0;
  while (added < businessDays) {
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    if (isIndonesiaBusinessDay(cursor)) added += 1;
  }
  return cursor;
}

export function shouldAutoCompleteDelivery(shippedAtIso, businessDays = 5) {
  if (!shippedAtIso) return false;
  const deadline = addIndonesiaBusinessDays(shippedAtIso, businessDays);
  return new Date() >= deadline;
}
