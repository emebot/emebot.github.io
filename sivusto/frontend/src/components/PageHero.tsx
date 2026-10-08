import type { ReactNode } from "react";

/**
 * Page title block shared by the content pages: amber eyebrow, serif heading
 * and an intro paragraph over a soft glow, matching the home page hero.
 */
export default function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.12),transparent_40%)]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
          {title}
        </h1>
        {children && <p className="mt-6 text-lg text-slate-300">{children}</p>}
      </div>
    </section>
  );
}
