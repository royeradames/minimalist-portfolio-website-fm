import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactCta } from "../../components/contact-cta";
import { Picture } from "../../components/picture";
import { pageMetadata, projectBackground, projectNeighbours, projects, siteName } from "../../site";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title} landing page project | ${siteName}`,
    description: `How Alex Spencer built the ${project.title} landing page: ${project.tech}, with desktop and mobile previews.`,
    path: `/portfolio/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) notFound();
  const { previous, next } = projectNeighbours(project.slug);

  return (
    <>
      <article className="project-detail container" aria-labelledby="project-title">
        <Picture folder="detail" name={`image-${project.slug}-hero`} alt={project.heroAlt} width={311} height={140} className="detail-hero" priority />
        <div className="detail-body">
          <div className="detail-info ruled">
            <h1 id="project-title" className="heading-2">{project.title}</h1>
            <p className="body-copy detail-summary">{project.summary}</p>
            <ul className="detail-skills" aria-label="Skills and technology">
              <li>{project.skills}</li>
              <li>{project.tech}</li>
            </ul>
            <a href={project.website} className="button-secondary detail-website">Visit Website</a>
          </div>
          <div className="detail-main">
            <section aria-labelledby="background-title">
              <h2 id="background-title" className="heading-3">Project Background</h2>
              <p className="body-copy">{projectBackground}</p>
            </section>
            <section aria-labelledby="previews-title">
              <h2 id="previews-title" className="heading-3">Static Previews</h2>
              <div className="detail-previews">
                <Picture folder="detail" name={`image-${project.slug}-preview-1`} alt={project.previewAlts[0]} width={313} height={197} className="detail-preview" />
                <Picture folder="detail" name={`image-${project.slug}-preview-2`} alt={project.previewAlts[1]} width={313} height={197} className="detail-preview" />
              </div>
            </section>
          </div>
        </div>
      </article>
      <nav className="project-nav container" aria-label="Projects">
        <Link href={`/portfolio/${previous.slug}`} className="project-nav-link project-nav-previous" rel="prev">
          <span className="project-nav-arrow" aria-hidden="true" />
          <span className="project-nav-text">
            <span className="project-nav-title">{previous.title}</span>
            <span className="project-nav-label">Previous Project</span>
          </span>
        </Link>
        <Link href={`/portfolio/${next.slug}`} className="project-nav-link project-nav-next" rel="next">
          <span className="project-nav-arrow" aria-hidden="true" />
          <span className="project-nav-text">
            <span className="project-nav-title">{next.title}</span>
            <span className="project-nav-label">Next Project</span>
          </span>
        </Link>
      </nav>
      <ContactCta />
    </>
  );
}
