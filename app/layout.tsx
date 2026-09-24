import type { Metadata } from "next";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { BackgroundParticles } from "./components/BackgroundParticles";
import { WebSessionProvider } from "./components/WebSession";
import { siteOrigin } from "./site-config";
import { socialImages } from "./site-metadata";
import "./globals.css";

const description =
  "Go live on any streaming platform and bind any type of donation to in-game events.";

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
    icon: "/app-icon-v3.png",
    shortcut: "/app-icon-v3.png",
    apple: "/app-icon-v3.png",
  },
  openGraph: {
    type: "website",
    siteName: "LionDubai Interactive",
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
            <BackgroundParticles />
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </WebSessionProvider>
      </body>
    </html>
  );
}
