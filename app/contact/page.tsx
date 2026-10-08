import type { Metadata } from "next";
import { SocialLinks } from "../components/social-links";
import { pageMetadata, siteName } from "../site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = pageMetadata({
  title: `Contact | ${siteName}`,
  description: "Get in touch with Alex Spencer about a front-end role or project. He is open to opportunities in London and remote teams.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="get-in-touch container" aria-labelledby="get-in-touch-title">
        <div className="get-in-touch-inner ruled">
          <h1 id="get-in-touch-title" className="heading-2">Get in Touch</h1>
          <div className="get-in-touch-text">
            <p className="body-copy">
              I’d love to hear about what you’re working on and how I could help. I’m currently looking for a new role and am open to a wide range of opportunities. My preference would be to find a position in a company in London. But I’m also happy to hear about opportunites that don’t fit that description. I’m a hard-working and positive person who will always approach each task with a sense of purpose and attention to detail. Please do feel free to check out my online profiles below and get in touch using the form.
            </p>
            <SocialLinks className="contact-social" />
          </div>
        </div>
      </section>
      <section className="contact-me container" aria-labelledby="contact-me-title">
        <h2 id="contact-me-title" className="heading-2">Contact Me</h2>
        <ContactForm />
      </section>
    </>
  );
}
