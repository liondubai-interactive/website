"use client";

/* eslint-disable @next/next/no-img-element -- Static icon is pre-sized for static hosting. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AccountMenu } from "./WebSession";

export function SiteHeader() {
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
            <Link href="/download/">Download</Link>
            <Link href="/games/">Games</Link>
            <AccountMenu />
          </nav>
        </div>
      </header>
    </>
  );
}
