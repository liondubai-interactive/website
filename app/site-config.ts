export const siteBasePath = "";
export const siteHost = "https://liondubai.net";
export const siteOrigin = `${siteHost}${siteBasePath}`;

export function publicAsset(path: string): string {
  return `${siteBasePath}${path}`;
}
