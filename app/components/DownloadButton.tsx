import Link from "next/link";
import { windowsRelease } from "../site-config";

export function DownloadButton() {
  return (
    <div className="download-action">
      {windowsRelease ? (
        <a className="button button-primary" href={windowsRelease.url}>
          <WindowsIcon /> Download for Windows <span aria-hidden="true">↓</span>
        </a>
      ) : (
        <button className="button button-primary" disabled>
          <WindowsIcon /> Download for Windows <span aria-hidden="true">↓</span>
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
    </div>
  );
}

function WindowsIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 1h6v6H1zm8 0h6v6H9zM1 9h6v6H1zm8 0h6v6H9z" />
    </svg>
  );
}
