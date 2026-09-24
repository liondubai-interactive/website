import Link from "next/link";
import { windowsRelease } from "../site-config";

export function DownloadButton() {
  return (
    <div className="download-action">
      <div className="download-buttons">
        {windowsRelease ? (
          <a className="button button-primary windows-download" href={windowsRelease.url} aria-label="Download for Windows">
            <DownloadLabel />
          </a>
        ) : (
          <button className="button button-primary windows-download" disabled title="Download unavailable" aria-label="Download for Windows">
            <DownloadLabel />
          </button>
        )}
        <Link className="button button-secondary" href="/games/">Explore games</Link>
      </div>
      {windowsRelease && (
        <p className="release-note">
          Version {windowsRelease.version} · Windows x64
        </p>
      )}
    </div>
  );
}

function DownloadLabel() {
  return (
    <>
      <WindowsIcon />
      <span className="windows-download-label">
        <span>Download for</span>
        <strong>Windows</strong>
      </span>
    </>
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
