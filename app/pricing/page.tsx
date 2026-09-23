import Link from "next/link";
import { pageMetadata } from "../site-metadata";
import { integrations } from "../integrations";
import { PluginImage } from "../components/PluginImage";

export const metadata = pageMetadata(
  "Pricing",
  "Monthly subscriptions for LionDubai Interactive's Minecraft integrations.",
  "pricing",
);
export default function PricingPage() {
  return (
    <main id="main-content" className="pricing-shell shell">
      <header className="pricing-intro">
        <p className="eyebrow">PRICING &middot; COMING SOON</p>
        <h1>
          Your game.
          <br />
          Your way to play.
        </h1>
        <p>One subscription per integration. Try each free for 24 hours.</p>
      </header>
      <div className="pricing-list">
        {integrations.map(({ id, name, price, description }) => (
          <section
            id={id}
            className="pricing-item"
            key={id}
            aria-label={name}
          >
            <div className="plugin-summary">
              <PluginImage id={id} />
              <div>
                <span className="small-label">MINECRAFT</span>
                <h2>{name}</h2>
                <p>{description}</p>
              </div>
            </div>
            <p className="pricing-amount">
              <strong>${price}</strong>
              <span>USD / month</span>
            </p>
          </section>
        ))}
      </div>
      <div className="pricing-essentials">
        <section>
          <h2>Try it first.</h2>
          <p>
            One 24-hour trial per plugin, started when you choose. No card
            required. No automatic charge.
          </p>
        </section>
        <section>
          <h2>Keep it flexible.</h2>
          <p>
            Subscriptions renew monthly. Cancel future renewals anytime;
            access lasts until the paid period ends.
          </p>
        </section>
      </div>
      <div className="pricing-notes">
        <p>
          Planned launch prices. The app is in limited testing; purchases and
          public downloads are not available yet.
        </p>
        <p>
          Taxes are additional and shown at checkout. Requires Windows and
          Minecraft Java Edition, sold separately.
        </p>
        <p>
          Read the <Link href="/terms">Terms</Link> and{" "}
          <Link href="/refunds">refund policy</Link>, or{" "}
          <Link href="/contact">get in touch</Link>.
        </p>
      </div>
    </main>
  );
}
