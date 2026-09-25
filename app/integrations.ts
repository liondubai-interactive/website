/** Reviewed, explicit catalogue. Adding metadata never enables a backend entitlement. */
export type Integration = Readonly<{
  id: string;
  gameId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  cardImage: string;
}>;
export type Game = Readonly<{
  id: string;
  name: string;
  edition: string;
  href: string;
  image: string;
}>;
export const integrations: readonly Integration[] = Object.freeze([]);
export const games: readonly Game[] = Object.freeze([]);
