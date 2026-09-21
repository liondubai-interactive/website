import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

const steps = [
  [
    "01",
    "Connect your LIVE",
    "Sign in with TikTok and connect your broadcast.",
  ],
  [
    "02",
    "Choose what happens",
    "Match gifts, likes, comments and more to game events. Save your setup as a preset.",
  ],
  [
    "03",
    "Let viewers play along",
    "Your audience’s interactions become part of the game while you keep control.",
  ],
];
export default function Home() {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> WINDOWS APP · IN DEVELOPMENT
            </p>
            <h1>
              Your stream.
              <br />
              Their next move.
            </h1>
            <p className="hero-lead">
              Bring your TikTok LIVE audience into the game. Turn their gifts
              and interactions into moments you create together.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#games">
                Explore the integrations <span aria-hidden="true">↗</span>
              </a>
              <Link className="text-link" href="/contact">
                Get in touch
              </Link>
            </div>
            <p className="beta-note">
              Currently in limited testing. Public downloads and subscriptions
              are not available yet.
            </p>
          </div>
          <div
            className="flow-preview"
            aria-label="Example: a viewer gift activates your chosen Minecraft event"
          >
            <div className="preview-heading">
              <span className="status-dot" /> A LITTLE INTERACTION. A NEW
              POSSIBILITY.
            </div>
            <div className="flow-row">
              <span className="flow-icon" aria-hidden="true">
                ✦
              </span>
              <div>
                <span className="small-label">TIKTOK LIVE</span>
                <strong>A viewer sends a gift</strong>
              </div>
            </div>
            <div className="flow-connector" aria-hidden="true">
              ↓
            </div>
            <div className="flow-row rule">
              <span className="flow-icon" aria-hidden="true">
                ↗
              </span>
              <div>
                <span className="small-label">YOUR PRESET</span>
                <strong>One gift. Your chosen action.</strong>
              </div>
            </div>
            <div className="flow-connector" aria-hidden="true">
              ↓
            </div>
            <div className="flow-row result">
              <span className="flow-icon" aria-hidden="true">
                ▧
              </span>
              <div>
                <span className="small-label">MINECRAFT</span>
                <strong>A new creature joins your world</strong>
              </div>
            </div>
            <p className="preview-caption">
              You choose the rules. Your community brings the surprises.
            </p>
          </div>
        </section>
        <section className="steps shell" aria-labelledby="how-it-works">
          <div className="section-heading">
            <p className="eyebrow">MADE TO FEEL SIMPLE</p>
            <h2 id="how-it-works">From interaction to action.</h2>
          </div>
          <div className="step-grid">
            {steps.map(([number, title, description]) => (
              <article key={number}>
                <span className="step-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          id="games"
          className="games shell"
          aria-labelledby="games-heading"
        >
          <div className="section-heading">
            <p className="eyebrow">STARTING WITH MINECRAFT</p>
            <h2 id="games-heading">One game. Different ways to play.</h2>
            <p>Choose an integration, then make it yours.</p>
          </div>
          <div className="game-list">
            <article>
              <span className="game-number" aria-hidden="true">
                01
              </span>
              <div>
                <h3>Survival</h3>
                <p>
                  Gifts become creatures, items and custom commands in your
                  survival world.
                </p>
              </div>
              <span className="pill">In testing</span>
            </article>
            <article>
              <span className="game-number" aria-hidden="true">
                02
              </span>
              <div>
                <h3>Battle Simulator</h3>
                <p>
                  Let viewers join the action by bringing troops into an arena.
                </p>
              </div>
              <span className="pill">In testing</span>
            </article>
          </div>
        </section>
        <section className="closing shell">
          <h2>Built around your broadcast.</h2>
          <p>Reusable presets. Flexible events. A focused desktop workspace.</p>
          <Link className="text-link" href="/contact">
            Talk to LionDubai ↗
          </Link>
        </section>
        <p className="independent-note shell">
          An independent application. Not an official Minecraft product; not
          approved by or associated with Mojang or Microsoft. TikTok does not
          own or operate this app.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
