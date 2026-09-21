import Link from "next/link";
import { PolicyPage } from "../components/PolicyPage";
import { pageMetadata } from "../site-metadata";
export const metadata = pageMetadata("Privacy", "How LionDubai Interactive handles account and app data.", "privacy");
export default function PrivacyPage() {
  return <PolicyPage eyebrow="PRIVACY" title="Privacy Policy" summary="What the application processes, where it is stored, and the choices available to you.">
    <section><h2>Who operates the app</h2><p>LionDubai Interactive operates this application. TikTok does not own or operate it. The app is not approved by or associated with Mojang or Microsoft. For questions about your information, use our <Link href="/contact">contact page</Link>.</p></section>
    <section><h2>Information we process</h2><ul>
      <li><strong>Account information:</strong> platform account identifiers, username, display name, profile image, and an internal LionDubai account ID.</li>
      <li><strong>Sign-in and security:</strong> session records, sign-in activity, connection information and the authorization data needed to verify your sign-in.</li>
      <li><strong>LIVE interactions:</strong> viewer identifiers and names, gifts and counts, comments, likes, follows, joins, shares and other supported broadcast events used by your presets.</li>
      <li><strong>Local app data:</strong> presets, preferences, downloaded artwork, game configuration and diagnostic event logs stored on your device.</li>
      <li><strong>Service logs:</strong> technical information such as IP addresses, request routes, timestamps, response status and errors.</li>
    </ul></section>
    <section><h2>How we use it</h2><p>We use this information to authenticate you, maintain your session, show your profile, connect your broadcast, execute the events you configure, enforce access and troubleshoot problems. Presets are stored locally, not in the account database. We do not sell personal information or use it for advertising.</p></section>
    <section><h2>Storage and service providers</h2><p>Account and session records are processed by our backend and database. The desktop processes gameplay and keeps local diagnostic evidence. TikTok handles its sign-in flow; our LIVE and metadata providers, including Eulerstream, support broadcast connectivity and event information. Hosting providers process the information needed to run and secure the service. These services may process data outside your country.</p><p>This website has no analytics, advertising or account sign-in. Its hosting provider may process ordinary request logs to deliver the site.</p></section>
    <section><h2>Remembered sign-in</h2><p>If you choose to remain signed in, a credential is retained on your device using operating-system protection. The backend stores its hash rather than the original credential. Logging out ends that app session; it does not automatically delete your account or revoke permissions in TikTok.</p></section>
    <section><h2>Retention and control</h2><p>Account records are kept while needed to provide the service, handle requests and protect account access. Session records expire or are revoked according to the app&apos;s session rules. Diagnostic logs have local retention controls. You can clear local app data in Settings or contact us to request access, correction, account deletion or disconnection. We may need to verify that you own the account.</p><p>Uninstalling the app does not automatically delete backend records. Do not share diagnostic logs publicly; they can contain broadcast and account information.</p></section>
    <section><h2>Security and updates</h2><p>We use access controls, encrypted public connections and protected session credentials. No service can guarantee absolute security. The app is in limited testing; this policy will be updated as features and data processing change. Use requires meeting the eligibility rules of the platforms and games you connect.</p></section>
    <section><h2>Contact</h2><p>Send privacy requests through our <Link href="/contact">contact page</Link>. Depending on your location, you may have additional rights under applicable data protection law.</p></section>
  </PolicyPage>;
}
