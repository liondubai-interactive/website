import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

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
    <div className="site-frame">
      <SiteHeader />
      <main className="policy-shell shell">
        <header className="policy-intro">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{summary}</p>
          <span>Effective July 28, 2026</span>
        </header>
        <article className="policy-card">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
