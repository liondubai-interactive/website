import type { ReactNode } from "react";

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export function PolicyPage({
  eyebrow,
  title,
  summary,
  children,
}: PolicyPageProps) {
  return (
    <main id="main-content" className="policy-shell shell">
      <header className="policy-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{summary}</p>
        <span>Effective September 24, 2026</span>
      </header>
      <article className="policy-card">{children}</article>
    </main>
  );
}
