import type { Metadata } from "next";
import { publicAsset, siteHost, siteOrigin } from "./site-config";
import { socialImages } from "./site-metadata";
import "./globals.css";

const description =
  "Turn TikTok LIVE interactions into Minecraft game events with LionDubai Interactive.";

export const metadata: Metadata = {
  metadataBase: new URL(siteHost),
  title: {
    default: "LionDubai Interactive",
    template: "%s · LionDubai Interactive",
  },
  description,
  alternates: {
    canonical: `${siteOrigin}/`,
  },
  icons: {
    icon: publicAsset("/app-icon.png"),
    shortcut: publicAsset("/app-icon.png"),
    apple: publicAsset("/app-icon.png"),
  },
  openGraph: {
    type: "website",
    url: `${siteOrigin}/`,
    title: "LionDubai Interactive",
    description,
    images: socialImages,
  },
  twitter: {
    card: "summary_large_image",
    title: "LionDubai Interactive",
    description,
    images: [publicAsset("/og.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
