export const siteBasePath = "/website";
export const siteHost = "https://liondubai-interactive.github.io";
export const siteOrigin = `${siteHost}${siteBasePath}`;

export function publicAsset(path: string): string {
  return `${siteBasePath}${path}`;
}
