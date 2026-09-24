import Link from "next/link";
import { integrations } from "./integrations";
import { PluginImage } from "./components/PluginImage";
import { DownloadButton } from "./components/DownloadButton";

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero shell">
        <div className="hero-copy">
          <h1>
            Your stream.
            <br />
            <span>In their hands.</span>
          </h1>
          <p className="hero-lead">
            Turn TikTok LIVE gifts, likes and comments into in-game actions.
            Let your viewers shape what happens next.
          </p>
          <DownloadButton />
        </div>
        <div className="hero-visual" aria-hidden="true" />
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
              <span className="game-price">
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
