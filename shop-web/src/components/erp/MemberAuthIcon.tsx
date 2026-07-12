type Props = {
  authProvider?: string | null;
  className?: string;
};

/** ERP member list: Google login badge */
export function MemberAuthIcon({ authProvider, className = "" }: Props) {
  if (authProvider !== "google") return null;

  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white ${className}`}
      title="Google login"
      aria-label="Google login"
    >
      <svg width="12" height="12" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303c-1.149 3.657-4.243 6.348-8.303 6.348-2.721 0-5.188-1.04-7.051-2.74l-6.522 5.025C9.505 39.556 16.227 44 24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c5.099 0 9.345-3.394 10.854-8.083z"
        />
      </svg>
    </span>
  );
}
