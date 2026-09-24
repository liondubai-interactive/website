"use client";

import { useMemo, useState } from "react";

// Catalogue only: this selector does not change the document locale or page copy.
type Language = string[];
const english = ["en", "English"];
const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function LanguageMenu() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selected, setSelected] = useState<Language>(english);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(80);
  const [failed, setFailed] = useState(false);
  const searchable = useMemo(() => languages.map(language => ({
    language, search: normalize(language.join(" ")),
  })), [languages]);
  const search = normalize(query.trim());
  const matches = searchable.filter(entry => entry.search.includes(search)).map(entry => entry.language);

  async function loadLanguages() {
    if (languages.length) return;
    setFailed(false);
    try {
      setLanguages((await import("../data/languages.json")).default);
    } catch {
      setFailed(true);
    }
  }

  return (
    <>
      <button type="button" className="language-selector" popoverTarget="language-menu" aria-label={`Select language, ${selected[1]}`}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        <span className="language-label" title={selected[1]}>{selected[1]}</span>
        <svg className="language-chevron" aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </button>
      <div id="language-menu" className="language-dropdown" popover="auto" role="group" aria-label="Language"
        onKeyDown={event => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.hidePopover();
          }
        }}
        onToggle={event => {
          if (event.newState === "open") {
            setQuery("");
            setLimit(80);
            void loadLanguages();
          }
        }}>
        <input className="language-search" type="search" aria-label="Search languages" placeholder="Search languages…" value={query}
          onChange={event => { setQuery(event.target.value); setLimit(80); }} />
        <div className="language-options">
          {matches.slice(0, limit).map(language => (
            <button key={language[0]} type="button" popoverTarget="language-menu" popoverTargetAction="hide"
              aria-current={language[0] === selected[0] ? "true" : undefined} onClick={() => setSelected(language)}>
              <span>{language[1]}{language[2] && <small lang={language[0]} dir="auto">{language[2]}</small>}</span>
              {language[0] === selected[0] && <span aria-hidden="true">✓</span>}
            </button>
          ))}
          {matches.length > limit && <button type="button" className="language-more" onClick={() => setLimit(limit + 80)}>Show more languages</button>}
          {!languages.length && !failed && <p role="status">Loading languages…</p>}
          {failed && <button type="button" onClick={() => void loadLanguages()}>Couldn’t load languages. Try again</button>}
          {!!languages.length && !matches.length && <p role="status">No languages found</p>}
        </div>
      </div>
    </>
  );
}
