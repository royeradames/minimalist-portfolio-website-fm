import Link from "next/link";
import { challengeUrl, siteName } from "../site";
import { LogoMark } from "./icons";
import { SocialLinks } from "./social-links";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link href="/" className="logo-link" aria-label={`${siteName}, home`}>
            <LogoMark />
          </Link>
          <nav aria-label="Footer">
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/portfolio">Portfolio</Link></li>
              <li><Link href="/contact">Contact Me</Link></li>
            </ul>
          </nav>
        </div>
        <SocialLinks className="footer-social" />
      </div>
      <p className="container credit">
        <span>Challenge by <a href={challengeUrl}>Frontend Mentor</a>.</span>{" "}
        <span>Built by <a href="https://royeradames.com">Royer Adames</a>.</span>
      </p>
    </footer>
  );
}
