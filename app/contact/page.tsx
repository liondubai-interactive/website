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
            unlinking requests, contact the project operator by email or
            Telegram. Include
            &ldquo;LionDubai Interactive&rdquo; and your TikTok username so the
            correct account can be verified.
          </p>
          <div className="contact-actions">
            <a
              className="button button-primary"
              href="mailto:liondubai.interactive@gmail.com?subject=LionDubai%20Interactive%20request"
            >
              Email support
            </a>
            <a
              className="button button-secondary"
              href="https://t.me/Lion_Dubai"
            >
              Message on Telegram
            </a>
          </div>
          <address className="contact-details" aria-label="Direct contact details">
            <a href="mailto:liondubai.interactive@gmail.com">
              liondubai.interactive@gmail.com
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://t.me/Lion_Dubai">@Lion_Dubai</a>
          </address>
          <small>
            Never send passwords, session tokens, OAuth codes, or other
            authentication secrets through either channel.
          </small>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
