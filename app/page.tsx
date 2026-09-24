import Link from "next/link";
import { integrations } from "./integrations";
import { PluginImage } from "./components/PluginImage";
import { DownloadButton } from "./components/DownloadButton";
import { HeroScene } from "./components/HeroScene";

export default function Home() {
  return (
    <main id="main-content">
      <div className="hero-band">
        <section className="hero shell">
          <div className="hero-copy">
            <h1>
              Interactive
              <br />
              <span>Multi</span>-platform
            </h1>
            <div className="hero-details">
              <p className="hero-lead">
                Turn live interactions into in-game actions.
              </p>
              <DownloadButton browseGames />
              <dl className="hero-facts">
                <div><dt>Plugins</dt><dd>{integrations.length}</dd></div>
                <div><dt>Free trial per plugin</dt><dd>24h</dd></div>
              </dl>
            </div>
          </div>
          <HeroScene />
        </section>
      </div>
      <section id="games" className="games shell" aria-labelledby="games-heading">
        <div className="section-heading">
          <h2 id="games-heading" className="eyebrow">FEATURED PLUGINS</h2>
          <p className="trial-note">
            <strong>24-hour free trial</strong>
            <span>No card required · One trial per plugin</span>
          </p>
        </div>
        <div className="game-list">
          {integrations.map(({ id, name, description, price }) => (
            <Link href="/account/?view=customer" className="game-item" key={id}>
              <div className="game-artwork"><PluginImage id={id} large /></div>
              <div className="game-copy">
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
              <span className="game-meta">
                ${price}
                <span> USD / month</span>
              </span>
              <span className="game-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
