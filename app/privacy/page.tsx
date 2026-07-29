import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "../components/PolicyPage";
import { siteOrigin } from "../site-config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How LionDubai Interactive handles account and app data.",
  alternates: { canonical: `${siteOrigin}/privacy/` },
  openGraph: { url: `${siteOrigin}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="PRIVACY"
      title="Privacy Policy"
      summary="This policy explains what LionDubai Interactive processes during its limited sandbox testing and how you can control your information."
    >
      <section>
        <h2>Who operates the app</h2>
        <p>
          The UEBS2 Live desktop app is operated by LionDubai, an official
          TikTok LIVE agency. UEBS2 Live is an independent application and is
          not affiliated with Brilliant Game Studios, Steam, or Valve. For
          privacy or account requests, use our{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </section>

      <section>
        <h2>Information we process</h2>
        <ul>
          <li>
            <strong>TikTok profile data:</strong> TikTok account identifiers,
            username, display name, and avatar supplied through TikTok Login Kit.
          </li>
          <li>
            <strong>Account and session data:</strong> an internal account ID,
            session records, sign-in timestamps, and security metadata.
          </li>
          <li>
            <strong>Game and community data:</strong> classic and ranked
            statistics, scores, rankings, online presence, invitations, and
            matchmaking activity.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, requested route, response
            status, timing, and ordinary security or delivery logs created by
            our service and hosting providers.
          </li>
          <li>
            <strong>Device-local preferences:</strong> theme and selected UEBS2
            game-folder path remain in the desktop app&apos;s local settings.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use information</h2>
        <p>
          We use this information to authenticate accounts, keep sessions
          working, display creator profiles and rankings, provide presence and
          matchmaking, protect competitive integrity, troubleshoot failures,
          and improve the app during testing.
        </p>
      </section>

      <section>
        <h2>Sessions and TikTok tokens</h2>
        <p>
          TikTok authorization codes, PKCE values, and TikTok access tokens are
          used to verify identity. TikTok access tokens are transient and the app
          does not retain TikTok refresh tokens. If you choose to remain signed
          in, the desktop credential is stored in Windows Credential Locker; the
          server stores only its cryptographic hash. A saved desktop session
          normally lasts up to 30 days and can be revoked by logging out.
        </p>
      </section>

      <section>
        <h2>What other users can see</h2>
        <p>
          Your username, avatar, online or match status, statistics, and ranking
          may be visible through public leaderboards and to signed-in users in
          presence or matchmaking views. We do not sell personal data or use it
          for advertising.
        </p>
      </section>

      <section>
        <h2>Service providers and transfers</h2>
        <p>
          TikTok processes the Login Kit flow and may serve profile images. Our
          infrastructure and hosting providers process data only as needed to
          deliver, secure, and operate the service. Those providers may process
          information in countries other than your own under their applicable
          safeguards and terms.
        </p>
      </section>

      <section>
        <h2>Retention and security</h2>
        <p>
          Account identifiers and match records remain while the account is
          active or until a verified deletion request is completed. Temporary
          authorization challenges expire after about five minutes. Revoked
          desktop-session records are eligible for cleanup after seven days.
          Operational logs are retained only as reasonably needed for security
          and debugging during the sandbox. We use access controls, hashed
          server-side session credentials, and operating-system credential
          storage, but no system can guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>Your choices and rights</h2>
        <p>
          You may request access, correction, deletion, or TikTok unlinking.
          These requests are currently handled manually and may require account
          verification. Logging out revokes the saved desktop session; it does
          not by itself delete your account, profile, or match history.
        </p>
        <p>
          Start a private request through our <Link href="/contact">contact page</Link>.
          You may also have rights to object, restrict processing, or complain to
          a local data-protection authority, depending on your location.
        </p>
      </section>

      <section>
        <h2>Children and policy updates</h2>
        <p>
          The app is not directed to children. Users must meet the age and
          eligibility requirements of TikTok, Steam, UEBS2, and their local law.
          We may update this policy as the sandbox develops and will revise the
          effective date when material changes are published.
        </p>
      </section>
    </PolicyPage>
  );
}
