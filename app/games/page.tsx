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
      <h1>Games</h1>
      <p className="hero-lead">Choose a game. Let your viewers join the action.</p>
      <div className="game-list">
        <Link href="/#games" className="game-item" aria-label="Explore Minecraft plugins">
          <div className="game-artwork">
            <Image className="plugin-image" src="/games/minecraft.webp" alt="" width={384} height={384} unoptimized />
          </div>
          <div className="game-copy">
            <h2>Minecraft</h2>
            <p>Java Edition. Explore Survival, Battle Simulator and Clash Royale.</p>
          </div>
          <span className="game-meta">{integrations.length}<span> plugins</span></span>
          <span className="game-arrow" aria-hidden="true">↗</span>
        </Link>
      </div>
    </main>
  );
}
