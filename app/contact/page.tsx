import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { siteOrigin } from "../site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact LionDubai Interactive for support or privacy requests.",
  alternates: { canonical: `${siteOrigin}/contact/` },
  openGraph: { url: `${siteOrigin}/contact/` },
};

export default function ContactPage() {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main className="contact-shell shell">
        <section className="contact-card">
          <p className="eyebrow">CONTACT</p>
          <h1>How can we help?</h1>
          <p>
            For support, account access, correction, deletion, or TikTok
            unlinking requests, email the project operator. Include
            &ldquo;LionDubai Interactive&rdquo; and your TikTok username so the
            correct account can be verified.
          </p>
          <a
            className="button button-primary"
            href="mailto:aj.massalkhis@gmail.com?subject=LionDubai%20Interactive%20request"
          >
            Email support
          </a>
          <small>
            aj.massalkhis@gmail.com
            <br />
            Never send passwords, session tokens, or other authentication
            secrets.
          </small>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
