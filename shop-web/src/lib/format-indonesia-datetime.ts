/** 인도네시아(WIB, Asia/Jakarta) 기준 `YYYY/MM/DD HH:mm` */
export function formatIndonesiaDateTime(iso: string) {
  const d = new Date(iso);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`;
}
