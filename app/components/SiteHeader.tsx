"use client";

/* eslint-disable @next/next/no-img-element -- Static icon is pre-sized for static hosting. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AccountMenu } from "./WebSession";
import { LanguageMenu } from "./LanguageMenu";

export function SiteHeader() {
  const pathname = usePathname();
  const topMarker = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    if (topMarker.current) observer.observe(topMarker.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span ref={topMarker} className="header-top-marker" aria-hidden="true" />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header" data-scrolled={scrolled || undefined}>
        <div className="header-inner shell">
          <Link className="brand" href="/" aria-label="LionDubai Interactive home">
            <img src="/app-icon.png" alt="" width="32" height="32" />
            <span className="brand-wordmark">
              <span><span className="brand-lion">LION</span>DUBAI</span>
              <span className="brand-detail">INTERACTIVE</span>
            </span>
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
            <Link href="/games/" aria-current={pathname.startsWith("/games") ? "page" : undefined}>Games</Link>
          </nav>
          <div className="header-actions">
            <LanguageMenu />
            <AccountMenu />
          </div>
        </div>
      </header>
    </>
  );
}
