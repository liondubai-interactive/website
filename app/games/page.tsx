import Image from "next/image";
import Link from "next/link";
import { integrations } from "../integrations";
import { pageMetadata } from "../site-metadata";

export const metadata = pageMetadata(
  "Games",
  "Explore games and plugins for interactive TikTok LIVE streams.",
  "games",
);

export default function GamesPage() {
  return (
    <main id="main-content" className="catalog-shell shell">
      <p className="eyebrow">PLAY WITH YOUR AUDIENCE</p>
      <h1>Games.</h1>
      <p className="hero-lead">Choose a game. Let your viewers join the action.</p>
      <Link href="/#games" className="game-item catalog-game" aria-label="Explore Minecraft plugins">
        <div className="catalog-art">
          <Image className="plugin-image" src="/games/minecraft.webp" alt="" width={384} height={384} unoptimized />
        </div>
        <div className="catalog-copy">
          <p className="eyebrow">JAVA EDITION</p>
          <h2>Minecraft</h2>
          <p>Change the adventure with Survival, bring armies into Battle Simulator, or take sides in Clash Royale.</p>
          <span className="catalog-link">Explore {integrations.length} plugins <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
    </main>
  );
}
