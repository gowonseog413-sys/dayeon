import { POPUP_TIMEZONES } from "./visitor-timezone.js";

/** ERP 관리 화면 기본 시간대 */
export const EVENT_POPUP_ADMIN_TZ = POPUP_TIMEZONES.KR;

const TZ_OFFSET = {
  [POPUP_TIMEZONES.KR]: "+09:00",
  [POPUP_TIMEZONES.ID]: "+07:00",
};

/** HH:mm → 00:00~23:59 */
export function normalizeEventTime(raw, fallback = "00:00") {
  const v = (raw || "").trim();
  if (/^\d{2}:\d{2}$/.test(v)) return v;
  return fallback;
}

export function combineEventDateTime(
  dateStr,
  timeStr,
  fallbackTime,
  timeZone = EVENT_POPUP_ADMIN_TZ,
) {
  const date = (dateStr || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const time = normalizeEventTime(timeStr, fallbackTime);
  const offset = TZ_OFFSET[timeZone] || TZ_OFFSET[EVENT_POPUP_ADMIN_TZ];
  const dt = new Date(`${date}T${time}:00${offset}`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function eventPopupTodayKey(now = new Date(), timeZone = EVENT_POPUP_ADMIN_TZ) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

export function isEventPopupActive(
  popup,
  now = new Date(),
  timeZone = EVENT_POPUP_ADMIN_TZ,
) {
  if (!popup?.enabled) return false;

  const start = combineEventDateTime(
    popup.startDate,
    popup.startTime,
    "00:00",
    timeZone,
  );
  const end = combineEventDateTime(popup.endDate, popup.endTime, "23:59", timeZone);
  if (!start || !end) return false;

  const endInclusive = new Date(end.getTime() + 59_999);
  return now >= start && now <= endInclusive;
}

export function getEventPopupStatus(
  popup,
  now = new Date(),
  timeZone = EVENT_POPUP_ADMIN_TZ,
) {
  if (!popup?.enabled) return "disabled";
  const start = combineEventDateTime(
    popup.startDate,
    popup.startTime,
    "00:00",
    timeZone,
  );
  const end = combineEventDateTime(popup.endDate, popup.endTime, "23:59", timeZone);
  if (!start || !end) return "invalid";
  const endInclusive = new Date(end.getTime() + 59_999);
  if (now < start) return "scheduled";
  if (now > endInclusive) return "expired";
  return "active";
}

export function formatEventSchedule(popup, timeZone = EVENT_POPUP_ADMIN_TZ) {
  const startDate = (popup.startDate || "").slice(0, 10);
  const endDate = (popup.endDate || "").slice(0, 10);
  const startTime = normalizeEventTime(popup.startTime, "00:00");
  const endTime = normalizeEventTime(popup.endTime, "23:59");
  const label = timeZone === POPUP_TIMEZONES.ID ? "WIB" : "KST";
  return `${startDate} ${startTime} ~ ${endDate} ${endTime} (${label})`;
}
