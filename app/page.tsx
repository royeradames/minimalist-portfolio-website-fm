import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "./components/contact-cta";
import { DownArrowsIcon } from "./components/icons";
import { Picture } from "./components/picture";
import { pageMetadata, siteName } from "./site";

export const metadata: Metadata = pageMetadata({
  title: `${siteName} | Front-end developer portfolio`,
  description: "Alex Spencer is a junior front-end developer in London who writes accessible HTML, modern CSS and clean JavaScript. See his work and get in touch.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <section className="home-hero container" aria-labelledby="home-title">
        <Picture folder="homepage" name="image-homepage-hero" alt="Manage landing page on a desktop monitor, one of Alex’s projects" width={311} height={271} className="home-hero-image" priority />
        <div className="home-intro">
          <h1 id="home-title" className="heading-1">Hey, I’m Alex Spencer and I love building beautiful websites</h1>
          <a href="#about" className="button-primary">
            <span className="button-icon" aria-hidden="true"><DownArrowsIcon /></span>
            <span className="button-label">About Me</span>
          </a>
        </div>
      </section>
      <section id="about" className="about container" aria-labelledby="about-title" tabIndex={-1}>
        <Picture folder="homepage" name="image-homepage-profile" alt="Portrait of Alex Spencer" width={311} height={346} className="about-image" />
        <div className="about-text ruled">
          <h2 id="about-title" className="heading-2">About Me</h2>
          <p className="body-copy">
            I’m a junior front-end developer looking for a new role in an exciting company. I focus on writing accessible HTML, using modern CSS practices and writing clean JavaScript. When writing JavaScript code, I mostly use React, but I can adapt to whatever tools are required. I’m based in London, UK, but I’m happy working remotely and have experience in remote teams. When I’m not coding, you’ll find me outdoors. I love being out in nature whether that’s going for a walk, run or cycling. I’d love you to check out my work.
          </p>
          <Link href="/portfolio" className="button-secondary">Go to Portfolio</Link>
        </div>
      </section>
      <ContactCta />
    </>
  );
}
