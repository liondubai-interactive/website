/* eslint-disable @next/next/no-img-element -- Static icon is pre-sized for GitHub Pages. */
import Link from "next/link";
import { publicAsset } from "../site-config";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="LionDubai Interactive home">
          <img
            src={publicAsset("/app-icon.png")}
            alt=""
            width="36"
            height="36"
          />
          <span>LionDubai Interactive</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
