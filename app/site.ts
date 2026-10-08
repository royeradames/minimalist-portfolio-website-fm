export const siteName = "Alex Spencer";
export const siteUrl = "https://minimalist-portfolio-website-fm.royeradames.com";
/** WebSite JSON-LD, emitted by the root layout so every page declares the same site. */
export const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl } as const;
export const challengeUrl = "https://www.frontendmentor.io/challenges/minimalist-portfolio-website-LMy-ZRyiE";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  skills: string;
  tech: string;
  website: string;
  heroAlt: string;
  previewAlts: [string, string];
};

export const projects: Project[] = [
  {
    slug: "manage",
    title: "Manage",
    summary: "This project required me to build a fully responsive landing page to the designs provided. I used HTML5, along with CSS Grid and JavaScript for the areas that required interactivity, such as the testimonial slider.",
    skills: "Interaction Design / Front End Development",
    tech: "HTML / CSS / JS",
    website: "https://www.frontendmentor.io/challenges/manage-landing-page-SLXqC6P5",
    heroAlt: "Manage landing page screens side by side",
    previewAlts: ["Manage landing page at desktop size", "Manage landing page on mobile screens"],
  },
  {
    slug: "bookmark",
    title: "Bookmark",
    summary: "This project required me to build a fully responsive landing page to the designs provided. I used HTML5, along with CSS Grid and JavaScript for the areas that required interactivity, such as the features section.",
    skills: "Interaction Design / Front End Development",
    tech: "HTML / CSS / JS",
    website: "https://www.frontendmentor.io/challenges/bookmark-landing-page-5d0b588a9edda32581d29158",
    heroAlt: "Bookmark landing page screens side by side",
    previewAlts: ["Bookmark landing page at desktop size", "Bookmark landing page on mobile screens"],
  },
  {
    slug: "insure",
    title: "Insure",
    summary: "This was a small project which mostly consisted of HTML and CSS. I built a fully-responsive landing page. The only JavaScript this project required was to enable the toggling of the mobile navigation.",
    skills: "Interaction Design / Front End Development",
    tech: "HTML / CSS / JS",
    website: "https://www.frontendmentor.io/challenges/insure-landing-page-uTU68JV8",
    heroAlt: "Insure landing page screens side by side",
    previewAlts: ["Insure landing page at desktop size", "Insure landing page on mobile screens"],
  },
  {
    slug: "fylo",
    title: "Fylo",
    summary: "This project was built in pure HTML and CSS. I had mobile and desktop designs to work to and built it so that it was fully-responsive. I took a mobile-first approach and used modern CSS like Flexbox and Grid for layout purposes.",
    skills: "Interaction Design / Front End Development",
    tech: "HTML / CSS",
    website: "https://www.frontendmentor.io/challenges/fylo-dark-theme-landing-page-5ca5f2d21e82137ec91a50fd",
    heroAlt: "Fylo landing page screens side by side",
    previewAlts: ["Fylo landing page at desktop size", "Fylo landing page on mobile screens"],
  },
];

export const projectBackground = "This project was a front-end challenge from Frontend Mentor. It’s a platform that enables you to practice building websites to a design and project brief. Each challenge includes mobile and desktop designs to show how the website should look at different screen sizes. Creating these projects has helped me refine my workflow and solve real-world coding problems. I’ve learned something new with each project, helping me to improve and adapt my style.";

export function projectNeighbours(slug: string) {
  const index = projects.findIndex(project => project.slug === slug);
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, url: path, siteName, title, description },
  };
}
