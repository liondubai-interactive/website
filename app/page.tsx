import Link from "next/link";
import { integrations } from "./integrations";
import { PluginImage } from "./components/PluginImage";
import { DownloadButton } from "./components/DownloadButton";
import { HeroScene } from "./components/HeroScene";

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero shell">
        <div className="hero-copy">
          <h1>
            <span>Interactive</span>
            <br />
            Multi-platform
          </h1>
          <p className="hero-lead">
            Turn live interactions into in-game actions.
          </p>
          <DownloadButton browseGames />
          <dl className="hero-facts">
            <div><dt>Plugins</dt><dd>{integrations.length}</dd></div>
            <div><dt>Free trial per plugin</dt><dd>24h</dd></div>
          </dl>
        </div>
        <HeroScene />
      </section>
      <section id="games" className="games shell" aria-labelledby="games-heading">
        <div className="section-heading">
          <div>
            <h2 id="games-heading" className="eyebrow">MINECRAFT PLUGINS</h2>
          </div>
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
