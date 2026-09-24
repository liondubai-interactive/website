import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found-shell shell">
      <section className="not-found-card">
        <p className="eyebrow">404</p>
        <h1>Page not found.</h1>
        <Link className="text-link" href="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
