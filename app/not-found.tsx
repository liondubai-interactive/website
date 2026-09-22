import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="contact-shell shell">
      <section className="contact-card">
        <p className="eyebrow">404</p>
        <h1>Page not found.</h1>
        <Link className="text-link" href="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
