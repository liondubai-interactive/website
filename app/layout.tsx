import type { Metadata } from "next";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { siteOrigin } from "./site-config";
import { socialImages } from "./site-metadata";
import "./globals.css";

const description =
  "Turn TikTok LIVE interactions into Minecraft game events with LionDubai Interactive.";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "LionDubai Interactive",
    template: "%s · LionDubai Interactive",
  },
  description,
  alternates: {
    canonical: `${siteOrigin}/`,
  },
  icons: {
    icon: "/app-icon.png",
    shortcut: "/app-icon.png",
    apple: "/app-icon.png",
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
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-frame">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
