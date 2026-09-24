import Link from "next/link";
import { windowsRelease } from "../site-config";

export function DownloadButton() {
  return (
    <div className="download-action">
      {windowsRelease ? (
        <a className="button button-primary" href={windowsRelease.url}>
          <WindowsIcon /> Download for Windows
        </a>
      ) : (
        <button className="button button-primary" disabled>
          <WindowsIcon /> Download for Windows
        </button>
      )}
      <p className="beta-note">
        {windowsRelease ? (
          <>
            Version {windowsRelease.version} · Windows x64 ·{" "}
            <Link href="/download/">Installation details</Link>
          </>
        ) : (
          "Limited testing · Public download coming soon"
        )}
      </p>
      <p className="independent-note">
        An independent app. Not an official Minecraft product or associated with Mojang or
        Microsoft. TikTok does not own or operate this app.
      </p>
    </div>
  );
}

function WindowsIcon() {
  // Microsoft Windows mark: https://commons.wikimedia.org/wiki/File:Windows_logo_-_2012.svg
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 88 88" fill="currentColor">
      <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.011 41.34-47.318-6.678-.066-34.739z" />
    </svg>
  );
}
