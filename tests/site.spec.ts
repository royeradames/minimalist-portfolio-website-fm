import { expect, test, type Page } from "@playwright/test";

const box = async (page: Page, selector: string) => (await page.locator(selector).first().boundingBox())!;
const near = (actual: number, expected: number, tolerance = 2) => expect(Math.abs(actual - expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(tolerance);

const routes = [
  { path: "/", title: "Alex Spencer | Front-end developer portfolio", h1: "Hey, I’m Alex Spencer and I love building beautiful websites", nav: "Home" },
  { path: "/portfolio", title: "Portfolio | Alex Spencer", h1: "Portfolio", nav: "Portfolio" },
  { path: "/portfolio/manage", title: "Manage landing page project | Alex Spencer", h1: "Manage", nav: "Portfolio" },
  { path: "/portfolio/bookmark", title: "Bookmark landing page project | Alex Spencer", h1: "Bookmark", nav: "Portfolio" },
  { path: "/portfolio/insure", title: "Insure landing page project | Alex Spencer", h1: "Insure", nav: "Portfolio" },
  { path: "/portfolio/fylo", title: "Fylo landing page project | Alex Spencer", h1: "Fylo", nav: "Portfolio" },
  { path: "/contact", title: "Contact | Alex Spencer", h1: "Get in Touch", nav: "Contact Me" },
];

test("every route has a unique title, description, one h1, landmarks and the current nav item", async ({ page }) => {
  const descriptions = new Set<string>();
  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    descriptions.add(description!);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Alex Spencer");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.h1);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("Challenge by Frontend Mentor. Built by Royer Adames.");
    const current = page.getByRole("navigation", { name: "Main" }).locator('[aria-current="page"]');
    await expect(current).toHaveText(route.nav);
    await expect(current).toHaveCSS("color", "rgb(52, 123, 108)");
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).not.toHaveAttribute("alt", "");
      await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
    }
  }
  expect(descriptions.size).toBe(routes.length);
});

test("home declares one site name in the logo, og:site_name and WebSite JSON-LD", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("link", { name: "Alex Spencer, home" })).toBeVisible();
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? "{}");
  expect(jsonLd).toEqual({ "@context": "https://schema.org", "@type": "WebSite", name: "Alex Spencer", url: "https://minimalist-portfolio-website-fm.royeradames.com" });
});

test("uses the Figma type presets and colours", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const hero = page.getByRole("heading", { level: 1 });
  await expect(hero).toHaveCSS("font-size", "50px");
  await expect(hero).toHaveCSS("font-weight", "700");
  await expect(hero).toHaveCSS("font-family", /Ibarra/);
  await expect(hero).toHaveCSS("color", "rgb(51, 50, 61)");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(250, 250, 250)");
  await expect(page.locator(".about .body-copy")).toHaveCSS("font-family", /Public Sans/);
  await expect(page.locator(".about .body-copy")).toHaveCSS("line-height", "30px");
  await expect(page.locator(".button-primary")).toHaveCSS("background-color", "rgb(32, 58, 76)");
  await expect(page.locator(".site-footer")).toHaveCSS("background-color", "rgb(51, 50, 61)");
  await page.goto("/portfolio/manage");
  await expect(page.locator(".detail-skills")).toHaveCSS("color", "rgb(52, 123, 108)");
  await expect(page.locator(".heading-3").first()).toHaveCSS("font-size", "32px");
});

test("home follows the Figma desktop, tablet and mobile frames", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const logo = await box(page, ".site-header .logo-link svg");
  near(logo.x, 165); near(logo.y, 64);
  const hero = await box(page, ".home-hero-image img");
  near(hero.x, 165); near(hero.y, 150); near(hero.width, 1110); near(hero.height, 600);
  const intro = await box(page, ".home-intro");
  near(intro.x, 165); near(intro.width, 445); near(intro.y, 393, 4); near(intro.y + intro.height, 750);
  const about = await box(page, ".about-image img");
  near(about.x, 165); near(about.y, 900); near(about.width, 540); near(about.height, 600);
  const aboutText = await box(page, ".about-text");
  near(aboutText.x, 830); near(aboutText.width, 350);

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  const tHero = await box(page, ".home-hero-image img");
  near(tHero.x, 40); near(tHero.y, 143); near(tHero.width, 688); near(tHero.height, 600);
  const tIntro = await box(page, ".home-intro");
  near(tIntro.width, 514); near(tIntro.y + tIntro.height, 743);
  const tAbout = await box(page, ".about-image img");
  near(tAbout.y, 839); near(tAbout.width, 281, 3); near(tAbout.height, 600);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const mHero = await box(page, ".home-hero-image img");
  near(mHero.x, 32); near(mHero.y, 104); near(mHero.width, 311); near(mHero.height, 271);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
});

test("About Me scrolls to the about section", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("link", { name: "About Me" }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(600);
  await expect(page.getByRole("heading", { name: "About Me", level: 2 })).toBeInViewport();
});

test("mobile menu opens, closes with Escape and returns focus to the toggle", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu" });
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  await expect(nav).toBeVisible();
  await expect(nav).toHaveCSS("background-color", "rgb(51, 50, 61)");
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.getByRole("button", { name: "Open menu" }).click();
  await nav.getByRole("link", { name: "Portfolio" }).click();
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect(nav).toBeHidden();

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByRole("button", { name: /menu/ })).toBeHidden();
  await expect(nav).toBeVisible();
});

test("portfolio index alternates cards like the Figma and links to each project", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/portfolio");
  await expect(page.getByRole("heading", { level: 2 }).filter({ hasNotText: "Interested" })).toHaveText(["Manage", "Bookmark", "Insure", "Fylo"]);
  const cards = page.locator(".project-card");
  const first = (await cards.nth(0).locator("img").boundingBox())!;
  near(first.x, 165); near(first.y, 190); near(first.width, 540); near(first.height, 500);
  const firstText = (await cards.nth(0).locator(".project-card-text").boundingBox())!;
  near(firstText.x, 830); near(firstText.width, 350);
  const second = (await cards.nth(1).locator("img").boundingBox())!;
  near(second.x, 735); near(second.y, 770);
  const secondText = (await cards.nth(1).locator(".project-card-text").boundingBox())!;
  near(secondText.x, 260);
  await page.getByRole("link", { name: "View project: Insure" }).click();
  await expect(page).toHaveURL(/\/portfolio\/insure$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Insure");
});

test("project pages show details and cycle through previous and next projects", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/portfolio/manage");
  const hero = await box(page, ".detail-hero img");
  near(hero.x, 165); near(hero.y, 190); near(hero.width, 1110); near(hero.height, 500);
  const info = await box(page, ".detail-info");
  near(info.x, 165); near(info.y, 805); near(info.width, 350);
  const background = await box(page, "#background-title");
  near(background.x, 640); near(background.y, 805);
  await expect(page.getByText("Interaction Design / Front End Development")).toBeVisible();
  await expect(page.getByText("HTML / CSS / JS")).toBeVisible();
  await expect(page.getByRole("link", { name: "Visit Website" })).toHaveAttribute("href", /frontendmentor\.io\/challenges\/manage-landing-page/);
  const projects = page.getByRole("navigation", { name: "Projects" });
  await expect(projects.getByRole("link", { name: "Fylo Previous Project" })).toHaveAttribute("href", "/portfolio/fylo");
  await projects.getByRole("link", { name: "Bookmark Next Project" }).click();
  await expect(page).toHaveURL(/\/portfolio\/bookmark$/);
  await expect(projects.getByRole("link", { name: "Insure Next Project" })).toBeVisible();
  await page.goto("/portfolio/fylo");
  await expect(page.getByText("HTML / CSS", { exact: true })).toBeVisible();
  await expect(projects.getByRole("link", { name: "Manage Next Project" })).toBeVisible();
  const response = await page.goto("/portfolio/unknown");
  expect(response?.status()).toBe(404);
});

test("contact form shows required errors and focuses the first invalid field", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/contact");
  await expect(page.getByText("Demo only: nothing is sent.")).toBeVisible();
  const send = page.getByRole("button", { name: "Send Message" });
  await send.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("This field is required")).toHaveCount(3);
  const name = page.getByLabel("Name");
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAttribute("aria-describedby", "name-error");
  await expect(name).toHaveCSS("border-top-color", "rgb(244, 48, 48)");
  await expect(page.locator(".field-error").first()).toHaveCSS("color", "rgb(189, 23, 23)");
  await name.fill("Jane Appleseed");
  await page.getByLabel("Email Address").fill("jane#example.com");
  await send.click();
  await expect(page.getByText("Please use a valid email address")).toBeVisible();
  await expect(page.getByLabel("Email Address")).toBeFocused();
  await expect(page.getByText("This field is required")).toHaveCount(1);
});

test("a valid contact message shows a busy, focusable button, then confirms without sending", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", request => { if (request.method() !== "GET") writes.push(request.url()); });
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Jane Appleseed");
  await page.getByLabel("Email Address").fill("jane@example.com");
  await page.getByLabel("Message").fill("Hello Alex");
  await page.getByRole("button", { name: "Send Message" }).click();
  const busy = page.getByRole("button", { name: "Checking…" });
  await expect(busy).toHaveAttribute("aria-busy", "true");
  await expect(busy).toBeEnabled();
  await busy.focus();
  await expect(busy).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Thanks, Jane Appleseed! Your message was checked on this page only. Nothing was sent.");
  await expect(page.getByLabel("Name")).toHaveValue("");
  await expect(page.locator(".field-error")).toHaveCount(0);
  expect(writes).toEqual([]);
});

test("every route fits narrow and wide layouts with the family text and target floors", async ({ page }) => {
  for (const route of ["/", "/portfolio", "/portfolio/manage", "/contact"]) {
    for (const width of [320, 375, 400, 768, 1024, 1152, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${route} at ${width}`).toBe(true);
      const smallText = await page.locator("h1, h2, p, li, a, button, label, input, textarea, span").evaluateAll(elements =>
        elements.filter(element => element.getClientRects().length > 0 && element.textContent?.trim() && parseFloat(getComputedStyle(element).fontSize) < 16).map(element => element.textContent));
      expect(smallText, `${route} at ${width}`).toEqual([]);
      for (const control of await page.locator("a:visible, button:visible, input:visible").all()) {
        if (await control.evaluate(element => element.classList.contains("skip-link"))) continue;
        const controlBox = await control.boundingBox();
        expect(controlBox?.height, `${route} at ${width}: ${await control.textContent()}`).toBeGreaterThanOrEqual(44);
      }
    }
  }
});

test("keyboard users can skip to content and see hover and focus states", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("banner").getByRole("link", { name: "Alex Spencer, home" })).toBeFocused();
  await page.keyboard.press("Tab");
  const home = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Home" });
  await expect(home).toBeFocused();
  await expect(home).toHaveCSS("outline-style", "solid");
  const portfolio = page.getByRole("link", { name: "Go to Portfolio" });
  await portfolio.hover();
  await expect(portfolio).toHaveCSS("background-color", "rgb(51, 50, 61)");
  await expect(portfolio).toHaveCSS("color", "rgb(255, 255, 255)");
  const about = page.getByRole("link", { name: "About Me" });
  await about.hover();
  await expect(about).toHaveCSS("background-color", "rgb(52, 123, 108)");
  const navLink = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Portfolio" });
  await navLink.hover();
  await expect(navLink).toHaveCSS("color", "rgb(52, 123, 108)");
});
