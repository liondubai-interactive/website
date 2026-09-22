import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { pageMetadata } from "../site-metadata";

export const metadata = pageMetadata(
  "Contact",
  "Contact LionDubai Interactive for support or privacy requests.",
  "contact",
);
export default function ContactPage() {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main id="main-content" className="contact-shell shell">
        <section className="contact-card">
          <p className="eyebrow">CONTACT</p>
          <h1>
            How can
            <br />
            we help?
          </h1>
          <p className="contact-lead">
            Support, account questions or an idea for your stream. We&rsquo;re
            here.
          </p>
          <div className="contact-links">
            <a href="mailto:liondubai.interactive@gmail.com?subject=LionDubai%20Interactive%20request">
              <span>
                <span className="small-label">EMAIL</span>
                <strong>liondubai.interactive@gmail.com</strong>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
            <a href="https://t.me/Lion_Dubai">
              <span>
                <span className="small-label">TELEGRAM</span>
                <strong>@Lion_Dubai</strong>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="contact-note">
            For account correction, deletion or TikTok unlinking, include your
            TikTok username so we can verify the account. Never send passwords,
            session tokens or sign-in codes.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
