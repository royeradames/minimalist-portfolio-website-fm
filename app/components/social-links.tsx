import { GithubIcon, LinkedinIcon, TwitterIcon } from "./icons";

const links = [
  { name: "GitHub", href: "https://github.com/", Icon: GithubIcon },
  { name: "Twitter", href: "https://x.com/", Icon: TwitterIcon },
  { name: "LinkedIn", href: "https://www.linkedin.com/", Icon: LinkedinIcon },
];

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={`social-links ${className ?? ""}`}>
      {links.map(({ name, href, Icon }) => (
        <li key={name}>
          <a href={href} aria-label={name}>
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
