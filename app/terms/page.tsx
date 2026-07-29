import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "../components/PolicyPage";
import { siteOrigin } from "../site-config";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for the LionDubai Interactive sandbox desktop app.",
  alternates: { canonical: `${siteOrigin}/terms/` },
  openGraph: { url: `${siteOrigin}/terms/` },
};

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="TERMS"
      title="Terms of Use"
      summary="These terms govern access to the LionDubai Interactive desktop app and its limited developer sandbox."
    >
      <section>
        <h2>Accepting these terms</h2>
        <p>
          By using LionDubai Interactive, you agree to these terms and the
          <Link href="/privacy"> Privacy Policy</Link>. If you do not agree, do
          not use the app. You must be legally able to use TikTok, Steam, and
          UEBS2 in your location; minors must have any consent required by law.
        </p>
      </section>

      <section>
        <h2>Sandbox service</h2>
        <p>
          The app is currently a limited beta and developer sandbox. Features,
          availability, saved data, and access may change, pause, or end while
          testing continues. The service is not represented as production-ready
          or approved for unrestricted public TikTok access.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          You are responsible for activity through your account and for keeping
          your device and credentials secure. Provide accurate information and
          notify us privately if you believe your account or session has been
          compromised.
        </p>
      </section>

      <section>
        <h2>Fair and permitted use</h2>
        <p>You must not:</p>
        <ul>
          <li>forge TikTok events, scores, identities, or match outcomes;</li>
          <li>cheat, automate abuse, exploit vulnerabilities, or evade controls;</li>
          <li>harass users or submit unlawful, deceptive, or harmful content;</li>
          <li>interfere with the service, reverse engineer protected services, or
            access another person&apos;s account without permission; or</li>
          <li>use the app in a way that violates third-party terms or applicable law.</li>
        </ul>
        <p>
          We may invalidate results, restrict access, or remove accounts when
          needed to protect users, competitive integrity, or the service.
        </p>
      </section>

      <section>
        <h2>Third-party products</h2>
        <p>
          You need your own lawful access to Ultimate Epic Battle Simulator 2
          and any required Steam Workshop items. TikTok, TikTok Login Kit,
          UEBS2, Steam, and related services are governed by their owners&apos;
          separate terms. LionDubai Interactive is an official TikTok LIVE
          agency. This app is independently developed; TikTok does not own or
          operate it. The app is not sponsored by, endorsed by, or affiliated
          with Brilliant Game Studios, Steam, or Valve.
        </p>
      </section>

      <section>
        <h2>Project rights</h2>
        <p>
          LionDubai Interactive&apos;s original app code, design, and branding
          remain the property of its operator or licensors. These terms do not
          grant rights to third-party games, platforms, trademarks, or assets.
        </p>
      </section>

      <section>
        <h2>Availability and disclaimers</h2>
        <p>
          The sandbox is provided on an “as available” basis. To the maximum
          extent permitted by law, we do not guarantee uninterrupted access,
          compatibility, error-free operation, preservation of beta data, or a
          particular competitive result. Nothing here limits rights that cannot
          legally be excluded.
        </p>
      </section>

      <section>
        <h2>Liability and changes</h2>
        <p>
          To the maximum extent permitted by law, the operator is not liable for
          indirect or consequential loss arising from use of the sandbox. We may
          update these terms as the product develops. Continued use after an
          updated effective date means you accept the revised terms. Mandatory
          consumer protections and the laws applicable to you remain unaffected.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions, account issues, and legal requests can be sent privately
          through the <Link href="/contact">contact page</Link>.
        </p>
      </section>
    </PolicyPage>
  );
}
