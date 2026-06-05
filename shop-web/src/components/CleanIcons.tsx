type IconProps = { className?: string };

export function IconUser({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" strokeLinecap="round" />
    </svg>
  );
}

export function IconSearch({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconBag({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M7 9V7a5 5 0 0 1 10 0v2" strokeLinecap="round" />
      <path d="M6 9h12l-1 12H7L6 9z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFacebook({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8h2.7l.4-3.2H13.5V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.7V10.8H7v3.2h2.6V22h3.9z" />
    </svg>
  );
}

export function IconInstagram({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTikTok({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 5.2c-.8 1-2 1.7-3.3 1.8v3.4c0 3.5-2.2 5.8-5.5 5.8-1.2 0-2.3-.4-3.2-1.1 1.6.2 3.1-.9 3.6-2.5H8.5V9.2c2.2.1 4-1.5 4.4-3.6h2.6v4.2c1 .3 2 .1 2.8-.5l.2 2.9z" />
    </svg>
  );
}
