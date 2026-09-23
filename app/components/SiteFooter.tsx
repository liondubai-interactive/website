import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner shell">
        <p>&copy; 2026 LionDubai Interactive</p>
        <nav className="footer-contact" id="contact" aria-label="Contact">
          {[
            { id: "telegram", label: "Telegram: @Lion_Dubai", href: "https://t.me/Lion_Dubai" },
            { id: "gmail", label: "Email: liondubai.interactive@gmail.com", href: "https://mail.google.com/mail/?view=cm&fs=1&to=liondubai.interactive%40gmail.com" },
            { id: "tiktok", label: "TikTok: @_liondubai", href: "https://www.tiktok.com/@_liondubai" },
          ].map(({ id, label, href }) => (
            <a key={id} href={href} aria-label={label} title={label} target="_blank" rel="noopener noreferrer">
              <Image src={`/brands/${id}.svg`} alt="" width={22} height={22} unoptimized />
            </a>
          ))}
        </nav>
        <nav className="footer-legal" aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
        </nav>
      </div>
    </footer>
  );
}
