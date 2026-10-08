import Link from "next/link";

export function ContactCta() {
  return (
    <section className="contact-cta container" aria-labelledby="contact-cta-title">
      <h2 id="contact-cta-title" className="heading-2">Interested in doing a project together?</h2>
      <span className="cta-rule" aria-hidden="true" />
      <Link href="/contact" className="button-secondary">Contact Me</Link>
    </section>
  );
}
