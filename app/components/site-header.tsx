"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteName } from "../site";
import { CloseIcon, HamburgerIcon, LogoMark } from "./icons";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact Me" },
];

export function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header container">
      <Link href="/" className="logo-link" aria-label={`${siteName}, home`}>
        <LogoMark />
      </Link>
      <button
        ref={toggleRef}
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(value => !value)}
      >
        {open ? <CloseIcon /> : <HamburgerIcon />}
      </button>
      <nav id="site-nav" className="site-nav" data-open={open ? "true" : undefined} aria-label="Main">
        <ul>
          {navLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href} aria-current={isCurrent(pathname, link.href) ? "page" : undefined}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
