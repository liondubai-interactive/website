import Link from "next/link";
import { EventPreview } from "./components/EventPreview";
import { integrations } from "./integrations";
import { PluginImage } from "./components/PluginImage";
import { DownloadButton } from "./components/DownloadButton";

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            LIONDUBAI FOR WINDOWS
          </p>
          <h1>
            Your stream.
            <br />
            <span>Your game.</span>
          </h1>
          <p className="hero-lead">
            Turn TikTok LIVE gifts, likes and comments into Minecraft moments. Connect your account.
            Choose a plugin. Make every interaction count.
          </p>
          <DownloadButton />
        </div>
        <EventPreview />
      </section>
      <section id="games" className="games shell" aria-labelledby="games-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PLUGINS · PLANNED LAUNCH PRICES</p>
            <h2 id="games-heading">Pick your way to play.</h2>
            <p className="trial-note">24-hour free trial · No card required</p>
          </div>
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
