/* eslint-disable @next/next/no-img-element -- Static icon is pre-sized for GitHub Pages. */
import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { publicAsset } from "./site-config";

export default function Home() {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow">DESKTOP COMPANION · SANDBOX</p>
            <h1>TikTok Live meets epic UEBS2 battles.</h1>
            <p className="hero-lead">
              LionDubai Interactive is a creator-first desktop companion in
              development for connecting TikTok communities to interactive
              Ultimate Epic Battle Simulator 2 matches.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/privacy">
                View privacy
              </Link>
              <Link className="button button-secondary" href="/contact">
                Contact
              </Link>
            </div>
            <p className="beta-note">
              Currently in limited developer sandbox testing. Features may
              change before public release.
            </p>
          </div>

          <div className="product-preview" aria-label="Product preview">
            <div className="preview-topline">
              <span className="status-pill">SANDBOX</span>
              <span className="preview-platform">Windows desktop</span>
            </div>
            <img
              className="hero-icon"
              src={publicAsset("/app-icon.png")}
              alt="LionDubai Interactive lion emblem"
              width="144"
              height="144"
            />
            <div className="connection-preview">
              <div>
                <strong>TikTok LIVE Connection</strong>
                <span>@massalkhis</span>
              </div>
              <span className="connection-state">
                <i aria-hidden="true" /> Ready
              </span>
            </div>
          </div>
        </section>

        <section className="feature-section shell" aria-labelledby="features">
          <div className="section-heading">
            <p className="eyebrow">BUILT FOR CREATORS</p>
            <h2 id="features">A focused companion for every match.</h2>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-index">01</span>
              <h3>Verified account sign-in</h3>
              <p>
                Connect through TikTok Login Kit so the app can recognize the
                creator behind the session.
              </p>
            </article>
            <article className="feature-card">
              <span className="feature-index">02</span>
              <h3>Classic and ranked flows</h3>
              <p>
                Launch creator battles directly or enter community matchmaking
                through one clean desktop experience.
              </p>
            </article>
            <article className="feature-card">
              <span className="feature-index">03</span>
              <h3>Integrity by design</h3>
              <p>
                Identity, sessions, and future competitive events are designed
                around verified server-side boundaries.
              </p>
            </article>
          </div>
        </section>

        <section className="independent-note shell">
          <p>
            LionDubai Interactive is an official TikTok LIVE agency. Its UEBS2
            desktop app is independently developed; TikTok does not own or
            operate it. The app is not endorsed by, sponsored by, or affiliated
            with Brilliant Game Studios, Steam, or Valve.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
