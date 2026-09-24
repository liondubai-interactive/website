/* eslint-disable @next/next/no-img-element -- Static icon is pre-sized for static hosting. */
import Link from "next/link";
import { AccountMenu } from "./WebSession";

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner shell">
          <Link className="brand" href="/" aria-label="LionDubai Interactive home">
            <img src="/app-icon.png" alt="" width="32" height="32" />
            <span className="brand-wordmark">
              <span><span className="brand-lion">LION</span>DUBAI</span>
              <span className="brand-detail">INTERACTIVE</span>
            </span>
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            <Link href="/download/">Download</Link>
            <Link href="/#games">Plugins</Link>
            <AccountMenu />
          </nav>
        </div>
      </header>
    </>
  );
}
