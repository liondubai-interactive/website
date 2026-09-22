/* eslint-disable @next/next/no-img-element -- Static icon is pre-sized for static hosting. */
import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner shell">
          <Link
            className="brand"
            href="/"
            aria-label="LionDubai Interactive home"
          >
            <img
              src="/app-icon.png"
              alt=""
              width="32"
              height="32"
            />
            <span>
              LionDubai<span className="brand-detail"> Interactive</span>
            </span>
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            <Link href="/#games">Integrations</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">
              Contact <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
