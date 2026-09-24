import type { Metadata } from "next";
import { siteOrigin } from "./site-config";

export const socialImages = [
  {
    url: "/og.png",
    width: 1536,
    height: 1024,
    alt: "LionDubai Interactive — Interactive — Multi-platform",
  },
];

export function pageMetadata(
  title: string,
  description: string,
  route: string,
): Metadata {
  const url = `${siteOrigin}/${route}/`;
  const socialTitle = `${title} · LionDubai Interactive`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: socialTitle,
      description,
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: socialImages,
    },
  };
}
