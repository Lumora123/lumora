export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-white/[0.06]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_320px_at_15%_-10%,rgba(245,166,35,0.10),transparent_65%)]" aria-hidden="true" />
      <div className="shell relative pb-8 pt-[calc(var(--header-h)+2.5rem)] lg:pb-10 lg:pt-40">
        {eyebrow && (
          <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.28em] text-ember-400">{eyebrow}</p>
        )}
        <h1 className="font-display text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold uppercase leading-[1.02] text-mist-50">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-mist-400">{description}</p>}
        {children}
      </div>
    </div>
  );
}
