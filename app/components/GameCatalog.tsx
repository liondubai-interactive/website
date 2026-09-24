"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { integrations } from "../integrations";

const games = [{
  name: "Minecraft",
  edition: "Java Edition",
  href: "/#games",
  image: "/games/minecraft-cover.webp",
  plugins: integrations.length,
}];

export function GameCatalog() {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const matches = games.filter(game => `${game.name} ${game.edition}`.toLowerCase().includes(search));

  return (
    <>
      <label className="catalog-search">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input type="search" aria-label="Search games" placeholder="Search games…" value={query}
          onChange={event => setQuery(event.target.value)} />
      </label>
      <div className="game-catalog">
        {matches.map(game => (
          <Link key={game.name} href={game.href} className="game-item" aria-label={`Explore ${game.name} plugins`}>
            <div className="game-artwork">
              <Image className="plugin-image" src={game.image} alt="" width={780} height={333} unoptimized />
            </div>
            <div className="game-copy">
              <h2>{game.name}</h2>
              <p>{game.edition}</p>
            </div>
            <span className="game-meta">{game.plugins}<span> plugins</span></span>
            <span className="game-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      <p role="status" className={matches.length ? "sr-only" : "catalog-empty"}>
        {matches.length ? `${matches.length} ${matches.length === 1 ? "game" : "games"} found` : "No games found."}
      </p>
    </>
  );
}
