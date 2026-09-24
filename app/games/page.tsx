import { GameCatalog } from "../components/GameCatalog";
import { pageMetadata } from "../site-metadata";

export const metadata = pageMetadata(
  "Games",
  "Explore games and plugins for interactive live streams.",
  "games",
);

export default function GamesPage() {
  return (
    <main id="main-content" className="catalog-shell shell">
      <h1 className="sr-only">Games</h1>
      <GameCatalog />
    </main>
  );
}
