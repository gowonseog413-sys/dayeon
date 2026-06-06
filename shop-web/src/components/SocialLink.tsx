import type { ReactNode } from "react";

type Props = {
  href?: string;
  label: string;
  className?: string;
  children: ReactNode;
};

export function SocialLink({ href, label, className = "", children }: Props) {
  const url = href?.trim();
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={label}
        aria-label={label}
      >
        {children}
      </a>
    );
  }
  return (
    <span className={className} title={label} aria-label={label}>
      {children}
    </span>
  );
}
