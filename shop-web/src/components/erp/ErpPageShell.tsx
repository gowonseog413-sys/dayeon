type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

/** ERP 본문 공통 래퍼 */
export function ErpPageShell({ title, description, children, className = "" }: Props) {
  return (
    <div className={className}>
      <header className="mb-1 shrink-0">
        <h2 className="text-lg font-semibold leading-tight">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm leading-snug text-gray-500">{description}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
