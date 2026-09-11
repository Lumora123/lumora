import { cx } from "@/lib/format";

/* ------------------------------- Skeletons ------------------------------ */
export function CardSkeleton() {
  return (
    <div className="w-full" aria-hidden="true">
      <div className="skeleton aspect-[2/3] rounded-card" />
      <div className="skeleton mt-2 h-3 w-3/4 rounded" />
      <div className="skeleton mt-1.5 h-2.5 w-1/2 rounded" />
    </div>
  );
}

export function RowSkeleton({ count = 6, title = true }: { count?: number; title?: boolean }) {
  return (
    <div className="shell" aria-hidden="true">
      {title && <div className="skeleton mb-3 h-5 w-44 rounded" />}
      <div className="flex gap-3.5 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-[148px] shrink-0 xs:w-[160px] sm:w-[172px] lg:w-[186px]">
            <CardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[76vh] min-h-[520px] w-full overflow-hidden" aria-hidden="true">
      <div className="skeleton absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 shell pb-24">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton mt-3 h-12 w-[420px] max-w-[80vw] rounded" />
        <div className="skeleton mt-3 h-3 w-64 rounded" />
        <div className="skeleton mt-5 h-14 w-[380px] max-w-[85vw] rounded" />
        <div className="mt-7 flex gap-3">
          <div className="skeleton h-12 w-36 rounded-lg" />
          <div className="skeleton h-12 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="relative h-[70vh] min-h-[460px] w-full">
        <div className="skeleton absolute inset-0" />
      </div>
      <div className="shell -mt-24 grid gap-8 pb-16 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="skeleton h-10 w-2/3 rounded" />
          <div className="skeleton mt-4 h-20 w-full rounded" />
        </div>
        <div className="skeleton h-48 rounded-xl2" />
      </div>
    </div>
  );
}

/* ------------------------------ Empty/Error ----------------------------- */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center justify-center rounded-xl2 border border-dashed border-white/10 bg-ink-900/40 px-6 py-16 text-center", className)}>
      {icon && <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white/[0.05] text-mist-400">{icon}</div>}
      <h3 className="font-display text-lg font-bold text-mist-50">{title}</h3>
      {body && <p className="mt-2 max-w-md text-sm leading-relaxed text-mist-400">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  body,
  retry,
  className,
}: {
  title?: string;
  body?: string;
  retry?: () => void;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center justify-center rounded-xl2 border border-red-400/15 bg-red-950/20 px-6 py-14 text-center", className)} role="alert">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-300">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M12 8v5m0 3.2v.2" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <h3 className="font-display text-lg font-bold text-mist-50">{title}</h3>
      {body && <p className="mt-2 max-w-md text-sm leading-relaxed text-mist-400">{body}</p>}
      {retry && (
        <button type="button" onClick={retry} className="btn-ghost btn-md mt-6">
          Try again
        </button>
      )}
    </div>
  );
}

/** Route-level loading state for browse-style pages: header bar + card grid. */
export function PageHeaderSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="border-b border-white/[0.06]">
        <div className="shell pb-8 pt-[calc(var(--header-h)+2.5rem)] lg:pb-10 lg:pt-40">
          <div className="skeleton mb-3 h-3.5 w-28 rounded" />
          <div className="skeleton h-10 w-64 max-w-full rounded-lg" />
          <div className="skeleton mt-4 h-4 w-full max-w-xl rounded" />
        </div>
      </div>
      <div className="shell py-8 lg:py-10">
        <GridSkeleton count={14} />
      </div>
    </div>
  );
}
