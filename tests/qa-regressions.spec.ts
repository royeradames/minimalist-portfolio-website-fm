import { expect, test, type Page } from "@playwright/test";

// Regression checks for the October 8 width-sweep findings (overflow, crowded-header, squeezed,
// meta-identity). Each fails on the shipped layout and passes once it is fixed.

const routes = ["/", "/portfolio", "/contact", "/portfolio/manage", "/portfolio/bookmark", "/portfolio/insure", "/portfolio/fylo"];
const widths = [320, 340, 360, 374, 375, 560, 768, 1024, 1152, 1440, 1920];

/** In-flow children that cross the edge of a visible-overflow parent (the sweep's `overflow` rule, simplified). */
const spills = (page: Page) =>
  page.evaluate(() => {
    const outOfFlow = (el: Element, stop: Element) => {
      for (let n: Element | null = el; n && n !== stop; n = n.parentElement) {
        if (["absolute", "fixed"].includes(getComputedStyle(n).position)) return true;
      }
      return false;
    };
    const found: string[] = [];
    for (const parent of document.body.querySelectorAll("*")) {
      const style = getComputedStyle(parent);
      if (style.overflowX !== "visible" || style.display === "contents" || parent.scrollWidth <= parent.clientWidth + 1) continue;
      const box = parent.getBoundingClientRect();
      if (!box.width) continue;
      for (const child of parent.querySelectorAll("button, input, a, span, p, h1, h2, h3, li")) {
        if (outOfFlow(child, parent) || child.closest(".sr-only, [hidden]")) continue;
        const r = child.getBoundingClientRect();
        if (r.width && (r.right > box.right + 1 || r.left < box.left - 1)) found.push(`${child.textContent?.trim().slice(0, 30)} in ${parent.className.toString().slice(0, 40)}`);
      }
    }
    return [...new Set(found)];
  });

for (const path of routes) {
  test(`${path} keeps the header controls and every label inside their boxes from 320 to 1920 px`, async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await spills(page), `spill at ${width}px`).toEqual([]);
    }
  });

  test(`${path} declares og:site_name and WebSite JSON-LD`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Alex Spencer");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.map(text => JSON.parse(text)).filter(data => data["@type"] === "WebSite")).toEqual([
      { "@context": "https://schema.org", "@type": "WebSite", name: "Alex Spencer", url: "https://minimalist-portfolio-website-fm.royeradames.com" },
    ]);
  });
}

test("project pager labels stay on one line and never squeeze, at every width", async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of ["manage", "insure"]) {
      await page.goto(`/portfolio/${slug}`);
      const problems = await page.locator(".project-nav-link").evaluateAll(links => links.flatMap(link => {
        const found: string[] = [];
        const label = link.querySelector(".project-nav-label")!;
        const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
        if (label.getBoundingClientRect().height > 1.5 * lineHeight) found.push(`${label.textContent} wraps`);
        if (label.getBoundingClientRect().width / Math.max(1, label.textContent!.length) < 4) found.push(`${label.textContent} is squeezed`);
        return found;
      }));
      expect(problems, `/portfolio/${slug} at ${width}px`).toEqual([]);
    }
  }
});

test("the logo and menu button keep their positions on phones", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/portfolio/manage");
  const header = (await page.locator(".site-header").boundingBox())!;
  const toggle = (await page.getByRole("button", { name: "Open menu" }).boundingBox())!;
  const icon = (await page.locator(".menu-toggle svg").boundingBox())!;
  expect(toggle.x + toggle.width).toBeLessThanOrEqual(header.x + header.width + 0.5);
  expect(toggle.y).toBeGreaterThanOrEqual(header.y - 0.5);
  expect(toggle.y + toggle.height).toBeLessThanOrEqual(header.y + header.height + 0.5);
  expect(Math.abs(icon.x + icon.width - (375 - 32))).toBeLessThanOrEqual(1);
  expect(Math.abs(icon.y + icon.height / 2 - 48)).toBeLessThanOrEqual(1);
});
