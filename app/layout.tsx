import type { Metadata } from "next";
import { Ibarra_Real_Nova, Public_Sans } from "next/font/google";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { siteName, siteUrl, websiteJsonLd } from "./site";
import "./globals.css";

const ibarra = Ibarra_Real_Nova({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-ibarra", display: "swap" });
const publicSans = Public_Sans({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-public-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: { type: "website", siteName },
  icons: { icon: "/images/favicon-32x32.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${ibarra.variable} ${publicSans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <a className="skip-link" href="#main">Skip to content</a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
