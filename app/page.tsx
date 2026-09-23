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
      <section className="setup-strip shell" aria-label="How it works">
        <p>Ready when you are.</p>
        <ol>
          <li>
            <span>01</span>Download the app
          </li>
          <li>
            <span>02</span>Sign in with TikTok
          </li>
          <li>
            <span>03</span>Choose your plugin
          </li>
        </ol>
      </section>
      <section id="games" className="games shell" aria-labelledby="games-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PLUGINS</p>
            <h2 id="games-heading">Pick your way to play.</h2>
          </div>
          <p>
            Built for Minecraft.
            <br />
            Made for your community.
          </p>
        </div>
        <div className="game-list">
          {integrations.map(({ id, name, description, price }) => (
            <Link href={`/pricing#${id}`} className="game-item" key={id}>
              <PluginImage id={id} />
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
          <p>Planned launch prices in USD. One free 24-hour trial per plugin.</p>
          <Link className="text-link" href="/pricing">
            Pricing details <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <p className="independent-note shell">
        An independent app. Not an official Minecraft product or associated with Mojang or
        Microsoft. TikTok does not own or operate this app.
      </p>
    </main>
  );
}
