import { DownloadButton } from "../components/DownloadButton";
import { pageMetadata } from "../site-metadata";
import { windowsRelease } from "../site-config";

export const metadata = pageMetadata(
  "Download",
  "Download LionDubai Interactive for Windows.",
  "download",
);

export default function DownloadPage() {
  return (
    <main id="main-content" className="download-shell shell">
      <p className="eyebrow">DESKTOP APPLICATION</p>
      <h1>
        Take your stream
        <br />
        into the game.
      </h1>
      <p className="hero-lead">
        LionDubai Interactive for Windows. Sign in with TikTok inside the app to get started.
      </p>
      <DownloadButton />
      <section className="download-details">
        <h2>Getting started</h2>
        <ol>
          <li>Download and install the Windows app.</li>
          <li>Sign in with your TikTok account.</li>
          <li>Choose a plugin and start its free trial when you&apos;re ready.</li>
        </ol>
        <p>
          Minecraft plugins require Minecraft Java Edition, sold separately. An internet connection
          is required.
        </p>
        {windowsRelease && (
          <details>
            <summary>Verify your download</summary>
            <p>SHA-256</p>
            <code className="checksum">{windowsRelease.checksum}</code>
          </details>
        )}
      </section>
    </main>
  );
}
