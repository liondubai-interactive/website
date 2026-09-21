import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { pageMetadata } from "../site-metadata";

export const metadata = pageMetadata(
  "Pricing",
  "Monthly subscriptions for LionDubai Interactive's Minecraft integrations.",
  "pricing",
);

const plugins = [
  {
    name: "Survival",
    price: 5,
    description:
      "Turn LIVE interactions into creatures, items and custom commands in your Minecraft world.",
  },
  {
    name: "Battle Simulator",
    price: 10,
    description: "Let your viewers bring troops into Minecraft arena battles.",
  },
  {
    name: "Clash Royale",
    price: 30,
    description:
      "Bring viewer interactions into tower battles inside Minecraft.",
  },
];

export default function PricingPage() {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main className="pricing-shell shell">
        <header className="pricing-intro">
          <p className="eyebrow">PLUGIN SUBSCRIPTIONS</p>
          <h1>Choose your way to play.</h1>
          <p>One subscription per integration. Your presets, your broadcast.</p>
          <span className="pill">Coming soon</span>
        </header>
        <div className="pricing-list">
          {plugins.map(({ name, price, description }) => (
            <section className="pricing-item" key={name} aria-label={name}>
              <div>
                <h2>{name}</h2>
                <p>{description}</p>
              </div>
              <p className="pricing-amount">
                <strong>${price}</strong>
                <span>USD / month</span>
              </p>
            </section>
          ))}
        </div>
        <div className="pricing-notes">
          <p>
            Each subscription unlocks its selected plugin in the Windows desktop
            app. Billed monthly and renewed automatically until cancelled.
            Cancelling stops the next renewal; access continues until the paid
            period ends.
          </p>
          <p>
            One free 24-hour trial per plugin, activated when you choose. No
            card required and no automatic charge after the trial.
          </p>
          <p>
            Prices exclude applicable taxes, which are shown at checkout.
            Minecraft Java Edition is required and sold separately.
          </p>
          <p>
            The app is in limited testing. These are our planned launch prices;
            purchases and public downloads are not available yet.
          </p>
          <p>
            See our <Link href="/terms">Terms</Link> and{" "}
            <Link href="/refunds">refund policy</Link> before subscribing.
          </p>
          <Link className="text-link" href="/contact">
            Questions? Get in touch.
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
