import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const routes = ["/", "/portfolio", "/portfolio/manage", "/portfolio/bookmark", "/portfolio/insure", "/portfolio/fylo", "/contact"];

async function readableText(page: Page, rootSelector = "body") {
  const texts = await page.evaluate(rootSelector => {
    const root = document.querySelector(rootSelector);
    if (!root) throw new Error(`Missing readable text root ${rootSelector}`);
    const found = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim() || parent.closest("script,style,noscript,.sr-only")) continue;
      const style = getComputedStyle(parent);
      if (style.visibility !== "visible" || !parent.getClientRects().length) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter(r => r.width && r.height).map(r => ({ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }));
      if (!rects.length) continue;
      let opacity = 1;
      for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) opacity *= Number(getComputedStyle(ancestor).opacity);
      found.push({ text: node.textContent.trim().slice(0, 65), color: style.color, opacity, size: parseFloat(style.fontSize), weight: Number(style.fontWeight), rects });
    }
    for (const control of root.querySelectorAll("input,textarea")) {
      if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) || !control.getClientRects().length) continue;
      const style = getComputedStyle(control, control.value ? undefined : "::placeholder");
      const box = control.getBoundingClientRect();
      let opacity = control.value ? 1 : Number(style.opacity);
      for (let ancestor: Element | null = control; ancestor; ancestor = ancestor.parentElement) opacity *= Number(getComputedStyle(ancestor).opacity);
      const ownStyle = getComputedStyle(control);
      const left = parseFloat(ownStyle.paddingLeft), right = parseFloat(ownStyle.paddingRight);
      const top = parseFloat(ownStyle.paddingTop), bottom = parseFloat(ownStyle.paddingBottom);
      found.push({ text: control.value || control.placeholder, color: style.color, opacity, size: parseFloat(style.fontSize), weight: Number(style.fontWeight), rects: [{ x: box.x + scrollX + left + 1, y: box.y + scrollY + top + 1, width: box.width - left - right - 2, height: box.height - top - bottom - 2 }] });
    }
    return found;
  }, rootSelector);

  // Mask foreground ink without changing layout, then sample the genuine rendered
  // backgrounds. This includes the supplied translucent SVG patterns and photos.
  const mask = await page.addStyleTag({ content: "* { transition: none !important; color: transparent !important; caret-color: transparent !important; text-shadow: none !important; } *::placeholder { color: transparent !important; }" });
  let pixels;
  try {
    pixels = (await page.screenshot({ fullPage: true })).toString("base64");
  } finally {
    // Keep transitions disabled while restoring ink so the sampler cannot start
    // a transparent-to-ink animation that contaminates the next real state.
    await mask.evaluate(node => { node.textContent = "* { transition: none !important; }"; });
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await mask.evaluate(node => { node.parentNode?.removeChild(node); });
  }
  return page.evaluate(async ({ texts, pixels }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${pixels}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Rendered background sampler needs a canvas context");
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const luminance = (rgb: number[]) => rgb.reduce((sum, channel, index) => {
      const value = channel / 255;
      return sum + (value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4) * ([.2126, .7152, .0722][index] ?? 0);
    }, 0);
    return texts.flatMap(text => {
      const channels = text.color.match(/[\d.]+/g)?.map(Number);
      if (!channels || channels.length < 3) throw new Error(`Unsupported rendered color ${text.color}`);
      const alpha = (channels[3] ?? 1) * text.opacity;
      const minimum = text.size >= 24 || (text.size >= 18.66 && text.weight >= 700) ? 3 : 4.5;
      let worst = Infinity;
      for (const rect of text.rects) {
        for (let y = Math.ceil(rect.y); y < rect.y + rect.height; y += 8) {
          for (let x = Math.ceil(rect.x); x < rect.x + rect.width; x += 8) {
            if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
            const offset = (y * canvas.width + x) * 4;
            const background = [data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0];
            const foreground = background.map((channel, index) => (channels[index] ?? 0) * alpha + channel * (1 - alpha));
            const a = luminance(foreground), b = luminance(background);
            worst = Math.min(worst, (Math.max(a, b) + .05) / (Math.min(a, b) + .05));
          }
        }
      }
      return worst + .01 < minimum ? [{ text: text.text, ratio: +worst.toFixed(3), minimum, color: text.color, effectiveOpacity: text.opacity, fontSize: text.size, fontWeight: text.weight }] : [];
    });
  }, { texts, pixels });
}

for (const width of [375, 768, 1440]) {
  test(`shared text remains readable on actual backgrounds at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    const observations: { route: string; state: string; failures: Awaited<ReturnType<typeof readableText>> }[] = [];
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page.locator("main img").all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(async element => {
          if (!(element instanceof HTMLImageElement)) throw new Error("Expected project image");
          await element.decode();
        });
      }
      await page.evaluate(() => scrollTo(0, 0));
      const record = async (state: string, root = "body") => observations.push({ route, state, failures: await readableText(page, root) });
      await record("default");
      for (const selector of [".button-primary", ".button-secondary", ".project-nav-link", ".button-submit"]) {
        const target = page.locator(selector).first();
        if (!(await target.count())) continue;
        await target.hover();
        await page.waitForTimeout(250);
        await record(`settled hover ${selector}`);
        await page.mouse.move(0, 0);
        await page.waitForTimeout(250);
      }
      if (width === 375) {
        await page.getByRole("button", { name: "Open menu" }).click();
        // Main content intentionally covered by the mobile menu is not visible ink.
        await record("mobile navigation", ".site-nav");
        await page.keyboard.press("Escape");
      } else {
        await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Portfolio", exact: true }).hover();
        await record("desktop navigation hover");
      }
      if (route === "/contact") {
        await page.getByRole("button", { name: "Send Message", exact: true }).click();
        await record("empty validation");
        await page.getByLabel("Name", { exact: true }).fill("Jane Appleseed");
        await page.getByLabel("Email Address", { exact: true }).fill("jane#example.com");
        await page.getByRole("button", { name: "Send Message", exact: true }).click();
        await record("invalid email");
      }
    }
    await writeFile(test.info().outputPath("contrast-observations.json"), JSON.stringify(observations, null, 2));
    expect(observations.filter(state => state.failures.length)).toEqual([]);
  });
}

async function buttonFrames(page: Page, selector: string) {
  return page.evaluate(selector => new Promise<{ time: number; foreground: string; background: string; hovered: boolean; ratio: number }[]>(resolve => {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Missing hover control ${selector}`);
    const label = element.querySelector(".button-label") ?? element;
    const samples: { time: number; foreground: string; background: string; hovered: boolean; ratio: number }[] = [];
    const channels = (color: string) => {
      const values = color.match(/[\d.]+/g)?.map(Number);
      if (!values || values.length < 3) throw new Error(`Unsupported rendered color ${color}`);
      return values;
    };
    const luminance = (rgb: number[]) => rgb.reduce((sum, channel, index) => {
      const value = channel / 255;
      return sum + (value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4) * ([.2126, .7152, .0722][index] ?? 0);
    }, 0);
    const frame = (time: number) => {
      const backgroundStyle = getComputedStyle(element), textStyle = getComputedStyle(label);
      const layers = [];
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) layers.push(channels(getComputedStyle(ancestor).backgroundColor));
      let background = [255, 255, 255];
      for (const layer of layers.reverse()) {
        const alpha = layer[3] ?? 1;
        background = background.map((channel, index) => (layer[index] ?? 0) * alpha + channel * (1 - alpha));
      }
      const ink = channels(textStyle.color);
      let opacity = 1;
      for (let ancestor: Element | null = label; ancestor; ancestor = ancestor.parentElement) opacity *= Number(getComputedStyle(ancestor).opacity);
      const alpha = (ink[3] ?? 1) * opacity;
      const foreground = background.map((channel, index) => (ink[index] ?? 0) * alpha + channel * (1 - alpha));
      const a = luminance(foreground), b = luminance(background);
      samples.push({ time, foreground: textStyle.color, background: backgroundStyle.backgroundColor, hovered: element.matches(":hover"), ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) });
      if (samples.length === 24) resolve(samples);
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }), selector);
}

test("button text remains readable during real hover enter and leave frames", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const observations = [];
  for (const item of [{ route: "/", selector: ".button-primary" }, { route: "/", selector: ".button-secondary" }, { route: "/contact", selector: ".button-submit" }]) {
    await page.goto(item.route);
    await page.evaluate(() => document.fonts.ready);
    const target = page.locator(item.selector).first();
    await target.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    const entering = buttonFrames(page, item.selector);
    await target.hover();
    observations.push({ ...item, state: "enter", frames: await entering });
    const leaving = buttonFrames(page, item.selector);
    await page.mouse.move(0, 0);
    observations.push({ ...item, state: "leave", frames: await leaving });
  }
  for (const item of observations) expect(item.frames.some(frame => frame.hovered === (item.state === "enter")), `Actual ${item.state} action sampled for ${item.selector}`).toBe(true);
  await writeFile(test.info().outputPath("hover-frames.json"), JSON.stringify(observations, null, 2));
  expect(observations.flatMap(item => item.frames.filter(frame => frame.ratio + .01 < 4.5).map(frame => ({ route: item.route, selector: item.selector, state: item.state, ...frame })))).toEqual([]);
});

test("custom focus indicators contrast with their actual adjacent backgrounds", async ({ page }) => {
  const observations = [];
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.keyboard.press("Tab");
    const controls = [".site-header .logo-link", ".button-primary", ".site-footer .footer-links a"];
    if (width === 375) {
      await page.getByRole("button", { name: "Open menu" }).focus();
      await page.keyboard.press("Enter");
      controls.push(".site-nav a");
    } else controls.push(".site-nav a");
    const measure = async (selector: string, property: "outline" | "border") => {
      const target = page.locator(selector).first();
      await target.scrollIntoViewIfNeeded();
      await target.focus();
      return target.evaluate((element, property) => {
        const style = getComputedStyle(element);
        const channels = (color: string) => {
          const values = color.match(/[\d.]+/g)?.map(Number);
          if (!values || values.length < 3) throw new Error(`Unsupported focus color ${color}`);
          return values;
        };
        const luminance = (rgb: number[]) => rgb.reduce((sum, channel, index) => {
          const value = channel / 255;
          return sum + (value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4) * ([.2126, .7152, .0722][index] ?? 0);
        }, 0);
        const layers = [];
        for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) layers.push(channels(getComputedStyle(ancestor).backgroundColor));
        let adjacent = [255, 255, 255];
        for (const layer of layers.reverse()) {
          const alpha = layer[3] ?? 1;
          adjacent = adjacent.map((channel, index) => (layer[index] ?? 0) * alpha + channel * (1 - alpha));
        }
        const foreground = channels(property === "outline" ? style.outlineColor : style.borderTopColor);
        const alpha = foreground[3] ?? 1;
        const ink = adjacent.map((channel, index) => (foreground[index] ?? 0) * alpha + channel * (1 - alpha));
        const a = luminance(ink), b = luminance(adjacent);
        const insideLayer = channels(style.backgroundColor);
        const insideAlpha = insideLayer[3] ?? 1;
        const inside = adjacent.map((channel, index) => (insideLayer[index] ?? 0) * insideAlpha + channel * (1 - insideAlpha));
        const insideInk = inside.map((channel, index) => (foreground[index] ?? 0) * alpha + channel * (1 - alpha));
        const c = luminance(insideInk), d = luminance(inside);
        const outsideRatio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        const insideRatio = (Math.max(c, d) + .05) / (Math.min(c, d) + .05);
        return { focused: element.matches(":focus-visible"), style: property === "outline" ? style.outlineStyle : style.borderTopStyle, thickness: property === "outline" ? style.outlineWidth : style.borderTopWidth, color: property === "outline" ? style.outlineColor : style.borderTopColor, adjacent, inside, outsideRatio, insideRatio, ratio: property === "border" ? Math.min(outsideRatio, insideRatio) : outsideRatio };
      }, property);
    };
    for (const selector of controls) observations.push({ width, selector, ...await measure(selector, "outline") });
    await page.goto("/contact");
    await page.keyboard.press("Tab");
    observations.push({ width, selector: "input[name=name]", ...await measure("input[name=name]", "border") });
  }
  await writeFile(test.info().outputPath("focus-indicators.json"), JSON.stringify(observations, null, 2));
  for (const item of observations) {
    expect(item.focused, `${item.selector} at${item.width}`).toBe(true);
    expect(item.style, `${item.selector} at${item.width}`).toBe("solid");
    expect(parseFloat(item.thickness)).toBeGreaterThanOrEqual(1);
  }
  expect(observations.filter(item => item.ratio + .01 < 3)).toEqual([]);
});

test("mobile menu icons remain visible on their actual hover background", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const observations = [];
  const measure = async (state: string) => page.locator(".menu-toggle svg path").evaluate((element, state) => {
    const color = getComputedStyle(element).fill;
    const channels = (color: string) => {
      const values = color.match(/[\d.]+/g)?.map(Number);
      if (!values || values.length < 3) throw new Error(`Unsupported actual icon color ${color}`);
      return values;
    };
    const luminance = (rgb: number[]) => rgb.reduce((sum, channel, index) => {
      const value = channel / 255;
      return sum + (value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4) * ([.2126, .7152, .0722][index] ?? 0);
    }, 0);
    const layers = [];
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) layers.push(channels(getComputedStyle(ancestor).backgroundColor));
    let background = [255, 255, 255];
    for (const layer of layers.reverse()) {
      const alpha = layer[3] ?? 1;
      background = background.map((channel, index) => (layer[index] ?? 0) * alpha + channel * (1 - alpha));
    }
    const ink = channels(color), alpha = ink[3] ?? 1;
    const foreground = background.map((channel, index) => (ink[index] ?? 0) * alpha + channel * (1 - alpha));
    const a = luminance(foreground), b = luminance(background);
    return { state, color, background, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
  }, state);
  await page.getByRole("button", { name: "Open menu" }).hover();
  observations.push(await measure("open icon hover"));
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
  observations.push(await measure("close icon hover"));
  await writeFile(test.info().outputPath("menu-icon-hover.json"), JSON.stringify(observations, null, 2));
  expect(observations.filter(item => item.ratio + .01 < 3)).toEqual([]);
});
