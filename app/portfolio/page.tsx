import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "../components/contact-cta";
import { Picture } from "../components/picture";
import { pageMetadata, projects, siteName } from "../site";

export const metadata: Metadata = pageMetadata({
  title: `Portfolio | ${siteName}`,
  description: "Four responsive landing pages by Alex Spencer: Manage, Bookmark, Insure and Fylo, each built from a Frontend Mentor design.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <>
      <h1 className="sr-only">Portfolio</h1>
      <ul className="project-list container">
        {projects.map((project, index) => (
          <li key={project.slug} className={`project-card ${index % 2 ? "project-card-reverse" : ""}`}>
            <Picture folder="portfolio" name={`image-portfolio-${project.slug}`} alt={`${project.title} landing page preview`} width={311} height={288} className="project-card-image" priority={index === 0} />
            <div className="project-card-text ruled">
              <h2 className="heading-2">{project.title}</h2>
              <p className="body-copy">{project.summary}</p>
              <Link href={`/portfolio/${project.slug}`} className="button-secondary" aria-label={`View project: ${project.title}`}>View Project</Link>
            </div>
          </li>
        ))}
      </ul>
      <ContactCta />
    </>
  );
}
