"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  EVENT_POPUP_ADMIN_TZ,
  eventPopupTodayKey,
  isEventPopupActive,
  type PopupTimezone,
} from "@/lib/event-popup-schedule";
import type { EventPopup } from "@/lib/types";

const DISMISS_TODAY_PREFIX = "dayeon-popup-hide:";
const DISMISS_SESSION_PREFIX = "dayeon-popup-session:";
const POLL_MS = 5000;

/** 당일 00:00~24:00(방문자 시간대) 기준 — localStorage */
function isHiddenToday(id: string, timeZone: PopupTimezone) {
  try {
    return (
      localStorage.getItem(`${DISMISS_TODAY_PREFIX}${id}`) ===
      eventPopupTodayKey(undefined, timeZone)
    );
  } catch {
    return false;
  }
}

function hideForToday(id: string, timeZone: PopupTimezone) {
  try {
    localStorage.setItem(
      `${DISMISS_TODAY_PREFIX}${id}`,
      eventPopupTodayKey(undefined, timeZone),
    );
  } catch {
    /* ignore */
  }
}

/** 탭/세션 동안만 숨김 — 재접속(새 세션) 시 다시 표시 */
function isHiddenForSession(id: string) {
  try {
    return sessionStorage.getItem(`${DISMISS_SESSION_PREFIX}${id}`) === "1";
  } catch {
    return false;
  }
}

function hideForSession(id: string) {
  try {
    sessionStorage.setItem(`${DISMISS_SESSION_PREFIX}${id}`, "1");
  } catch {
    /* ignore */
  }
}

function shouldShowPopup(id: string, timeZone: PopupTimezone) {
  return !isHiddenToday(id, timeZone) && !isHiddenForSession(id);
}

type PopupApiResponse = {
  popups: EventPopup[];
  timezone?: PopupTimezone;
  country?: string;
};

function EventPopupLayerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const countryOverride = searchParams.get("visitorCountry");
  const [popups, setPopups] = useState<EventPopup[]>([]);
  const [visitorTz, setVisitorTz] = useState<PopupTimezone>(EVENT_POPUP_ADMIN_TZ);
  const [current, setCurrent] = useState<EventPopup | null>(null);
  const [open, setOpen] = useState(false);
  const [skipToday, setSkipToday] = useState(false);

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ _: String(Date.now()) });
      if (countryOverride) qs.set("country", countryOverride.toUpperCase().slice(0, 2));
      const data = await api<PopupApiResponse>(`/api/event-popups?${qs}`, {
        cache: "no-store",
      });
      const tz = data.timezone || EVENT_POPUP_ADMIN_TZ;
      setVisitorTz(tz);
      const active = (data.popups || []).filter(
        (p) => p.enabled !== false && isEventPopupActive(p, new Date(), tz),
      );
      setPopups(active);
    } catch {
      setPopups([]);
    }
  }, [countryOverride]);

  useEffect(() => {
    if (pathname.startsWith("/erp")) return;
    load();
    const id = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(id);
  }, [pathname, load]);

  useEffect(() => {
    if (pathname.startsWith("/erp")) {
      setOpen(false);
      setCurrent(null);
      return;
    }
    const next = popups.find((p) => shouldShowPopup(p.id, visitorTz)) ?? null;
    if (!next) {
      setCurrent(null);
      setOpen(false);
      return;
    }
    setCurrent(next);
    setOpen(true);
    setSkipToday(false);
  }, [popups, pathname, visitorTz]);

  if (!open || !current || pathname.startsWith("/erp")) return null;

  function close(hideToday = false) {
    if (hideToday) {
      hideForToday(current!.id, visitorTz);
    } else {
      hideForSession(current!.id);
    }
    setOpen(false);
    setSkipToday(false);
    const rest = popups.filter(
      (p) => p.id !== current!.id && shouldShowPopup(p.id, visitorTz),
    );
    if (rest[0]) {
      setTimeout(() => {
        setCurrent(rest[0]);
        setOpen(true);
      }, 200);
    }
  }

  return (
    <aside
      className="event-popup-dock pointer-events-none fixed right-3 top-[5.5rem] z-[200] flex flex-col items-end sm:right-5 sm:top-28"
      aria-live="polite"
    >
      <div
        className="event-popup-card pointer-events-auto overflow-hidden"
        role="complementary"
        aria-labelledby="event-popup-title"
      >
        <div className="event-popup-header">
          <p className="event-popup-badge mb-2 font-bold tracking-widest">
            EVENT
          </p>
          <h2 id="event-popup-title" className="event-popup-title font-bold leading-snug">
            {current.title}
          </h2>
        </div>
        <div className="event-popup-body overflow-y-auto">
          <p className="event-popup-content whitespace-pre-wrap">
            {current.content}
          </p>
        </div>
        <div className="event-popup-footer-bar flex items-center justify-end">
          <label className="event-popup-skip flex cursor-pointer select-none items-center">
            <input
              type="checkbox"
              checked={skipToday}
              onChange={(e) => setSkipToday(e.target.checked)}
              className="event-popup-skip-check shrink-0 rounded-sm border-white/70"
            />
            <span>오늘 하루 열지 않음</span>
          </label>
          <button
            type="button"
            onClick={() => close(skipToday)}
            className="event-popup-close-bar font-medium tracking-wide"
          >
            닫기 <span aria-hidden>X</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export function EventPopupLayer() {
  return (
    <Suspense fallback={null}>
      <EventPopupLayerInner />
    </Suspense>
  );
}
