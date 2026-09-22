const examples = [
  { event: "Gift", detail: "Rose", action: "Spawn a zombie", kind: "gift" },
  {
    event: "Like",
    detail: "Every 15",
    action: "Give a diamond",
    kind: "heart",
  },
  {
    event: "Comment",
    detail: "!night",
    action: "Set time to night",
    kind: "comment",
  },
] as const;

function EventIcon({ kind }: { kind: (typeof examples)[number]["kind"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "gift" ? (
        <>
          <path d="M4 10h16v11H4zM3 6h18v4H3zM12 6v15" />
          <path d="M12 6H8a2.5 2.5 0 1 1 2.5-2.5L12 6Zm0 0h4a2.5 2.5 0 1 0-2.5-2.5L12 6Z" />
        </>
      ) : kind === "heart" ? (
        <path d="m12 20-8-8a5 5 0 0 1 8-6 5 5 0 0 1 8 6Z" />
      ) : (
        <path d="M20 11a8 8 0 0 1-8 8H4l1.5-3A8 8 0 1 1 20 11Z" />
      )}
    </svg>
  );
}

export function EventPreview() {
  return (
    <div
      className="event-preview"
      role="img"
      aria-label="Example Survival preset: a Rose spawns a zombie, 15 likes give a diamond, and the comment !night sets the time to night."
    >
      <div className="preview-top">
        <span className="preview-brand">
          L<span>.</span>
        </span>
        <span>EXAMPLE PRESET</span>
        <span className="preview-dots" aria-hidden="true">
          &middot;&middot;&middot;
        </span>
      </div>
      <div className="preview-title">
        <div>
          <span className="small-label">MINECRAFT</span>
          <h2>Survival</h2>
        </div>
        <span className="preview-tag">TikTok LIVE</span>
      </div>
      <div className="preview-columns" aria-hidden="true">
        <span>When this happens</span>
        <span>Make this happen</span>
      </div>
      <div className="event-rows">
        {examples.map(({ event, detail, action, kind }) => (
          <div className="event-row" key={event}>
            <div className={`event-icon ${kind}`}>
              <EventIcon kind={kind} />
            </div>
            <div className="event-source">
              <strong>{event}</strong>
              <span>{detail}</span>
            </div>
            <span className="event-arrow" aria-hidden="true">
              &rarr;
            </span>
            <strong className="event-action">{action}</strong>
          </div>
        ))}
      </div>
      <div className="preview-bottom">
        <span className="preview-line" />
        <span>Your rules. Their next move.</span>
      </div>
    </div>
  );
}
