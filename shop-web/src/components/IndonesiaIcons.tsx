type IconProps = { className?: string };

/** 인도네시아 테마 — 마이정보 */
export function IconUserID({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#FDF6F0" stroke="#ECD5C8" strokeWidth="1" />
      <circle cx="12" cy="9" r="3.25" fill="#C1272D" />
      <path
        d="M6.5 19.5c.9-2.8 3.2-4.5 5.5-4.5s4.6 1.7 5.5 4.5"
        stroke="#7A1B1F"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 인도네시아 테마 — 내 가방 */
export function IconBagID({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#FDF6F0" stroke="#ECD5C8" strokeWidth="1" />
      <path
        d="M8.5 10.5V9a3.5 3.5 0 0 1 7 0v1.5"
        stroke="#7A1B1F"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.5 10.5h9l-.85 8.5H8.35L7.5 10.5z"
        fill="#C1272D"
        stroke="#7A1B1F"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M10 10.5V9.2M14 10.5V9.2" stroke="#7A1B1F" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconFacebookID({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8h2.7l.4-3.2H13.5V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.7V10.8H7v3.2h2.6V22h3.9z" />
    </svg>
  );
}

export function IconInstagramID({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconTikTokID({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 5.1c-.8 1-2 1.6-3.3 1.7v3.3c0 3.4-2.1 5.6-5.3 5.6-1.1 0-2.2-.4-3.1-1 1.5.2 3-.8 3.5-2.4H8.4V9c2.1.1 3.8-1.4 4.2-3.5h2.5v4c.9.3 1.9.1 2.7-.4l.8 2.8z" />
    </svg>
  );
}

const ID_SOCIAL = [
  {
    label: "Facebook",
    Icon: IconFacebookID,
    className: "bg-[#1877F2] text-white border-[#1877F2]",
  },
  {
    label: "Instagram",
    Icon: IconInstagramID,
    className:
      "border-transparent text-white bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
  },
  {
    label: "TikTok",
    Icon: IconTikTokID,
    className: "bg-[#111111] text-white border-[#111111]",
  },
] as const;

export function IndonesiaSocialIcons() {
  return (
    <div className="flex items-center gap-2.5">
      {ID_SOCIAL.map(({ label, Icon, className }) => (
        <span
          key={label}
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm ${className}`}
          title={label}
          aria-label={label}
        >
          <Icon />
        </span>
      ))}
    </div>
  );
}
