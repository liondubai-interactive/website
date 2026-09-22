import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { EventPreview } from "./components/EventPreview";
import { integrations } from "./integrations";

export default function Home() {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main id="main-content">
        <section className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" />
              PLAY TOGETHER, LIVE
            </p>
            <h1>
              Your stream.
              <br />
              <span>Their next move.</span>
            </h1>
            <p className="hero-lead">
              Turn TikTok LIVE gifts, likes and comments into Minecraft moments.
              You set the rules.
            </p>
            <a className="button button-primary" href="#games">
              Explore integrations <span aria-hidden="true">↗</span>
            </a>
            <p className="beta-note">
              Windows &middot; Limited testing &middot; Public launch coming
              soon
            </p>
          </div>
          <EventPreview />
        </section>
        <section className="setup-strip shell" aria-label="How it works">
          <p>Make it yours.</p>
          <ol>
            <li>
              <span>01</span>Connect TikTok
            </li>
            <li>
              <span>02</span>Choose an integration
            </li>
            <li>
              <span>03</span>Create your preset
            </li>
          </ol>
        </section>
        <section
          id="games"
          className="games shell"
          aria-labelledby="games-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE INTEGRATIONS</p>
              <h2 id="games-heading">
                A different kind
                <br />
                of audience participation.
              </h2>
            </div>
            <p>
              Built for Minecraft.
              <br />
              Made for your community.
            </p>
          </div>
          <div className="game-list">
            {integrations.map(({ id, name, description, price }, index) => (
              <Link href={`/pricing#${id}`} className="game-item" key={id}>
                <span className="game-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <div className="game-copy">
                  <h3>{name}</h3>
                  <p>{description}</p>
                </div>
                <span className="game-price">
                  ${price}
                  <span> / month</span>
                </span>
                <span className="game-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
          <div className="games-footnote">
            <p>
              Planned launch prices in USD. One free 24-hour trial per plugin.
            </p>
            <Link className="text-link" href="/pricing">
              Pricing details <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
        <section className="closing shell">
          <div>
            <p className="eyebrow">LET&apos;S TALK</p>
            <h2>
              Your community.
              <br />
              More possibilities.
            </h2>
          </div>
          <Link className="button button-secondary" href="/contact">
            Get in touch <span aria-hidden="true">↗</span>
          </Link>
        </section>
        <p className="independent-note shell">
          An independent app. Not an official Minecraft product or associated
          with Mojang or Microsoft. TikTok does not own or operate this app.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
