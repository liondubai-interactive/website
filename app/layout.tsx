import type { Metadata } from "next";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { WebSessionProvider } from "./components/WebSession";
import { siteOrigin } from "./site-config";
import { socialImages } from "./site-metadata";
import "./globals.css";

const description =
  "Turn live interactions into in-game actions with LionDubai Interactive.";

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
    images: socialImages,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <WebSessionProvider>
          <div className="site-frame">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </WebSessionProvider>
      </body>
    </html>
  );
}
