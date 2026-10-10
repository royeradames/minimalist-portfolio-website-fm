# Minimalist portfolio website

An implementation of the [Frontend Mentor minimalist portfolio website challenge](https://www.frontendmentor.io/challenges/minimalist-portfolio-website-LMy-ZRyiE): Alex Spencer's home, portfolio index, four project detail pages and contact page, using the supplied copy, art-directed photos and icons. Layout and spacing come from the decoded Figma frames for Desktop 1440, Tablet 768 and Mobile 375, including the mobile menu and the form and button states.

The contact form is an honest demo. TanStack Form and Zod show "This field is required" and "Please use a valid email address", move focus to the first invalid field, and keep the button focusable while a short busy state runs. Nothing leaves the browser, and the page says so above the button.

## Development

Node 22.13 or later. Use `npm ci`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test`. Browser tests use installed Chrome and own port 4552.

Next 16.3.6, React 19.2.8, TypeScript 5.9.3, Tailwind 4.2.1, TanStack Form 1.33.5 and Zod 4.4.3 are pinned to the family baseline. Every page is statically rendered; only the header menu and the contact form are client components.

## Sources and choices

- Original challenge files are preserved under `reference/`; supplied images moved byte-for-byte to `public/images/` and are served through `<picture>` with their desktop, tablet and mobile crops plus the 2x versions.
- Ibarra Real Nova and Public Sans load through `next/font`.
- The Figma uses 12 px uppercase labels (navigation and buttons), 13–15 px body and form text, and a 10 px error. The family text floor is 16 px, so those are raised to 16 px; headings keep the Figma sizes (50/40/32 px). Controls are at least 44 px tall, so buttons are 48 px instead of 46.
- Darker teal keeps light-surface navigation, skills, button hover labels and focus indicators readable. Dark navigation and footer surfaces keep the original bright teal. Project labels reuse the existing 80% slate, placeholders use 80% opacity, and error text uses darker red while error borders keep the original red. The secondary button switches colours immediately because its opposing foreground and background transitions briefly made the label unreadable.
- The desktop layout starts at 1152 px (the point where the 540 + 125 + 350 px rows fit); between 768 and 1151 px the tablet layout stretches.
- Social links point to the GitHub, X and LinkedIn home pages because Alex Spencer is a fictional persona. "Visit Website" opens each project's Frontend Mentor challenge page.
- A credit line in the footer names Frontend Mentor and the author; the Figma footer has none.
