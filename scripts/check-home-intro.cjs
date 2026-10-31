// Optional browser regression check; no runtime dependency is added to the site.
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const home = pathToFileURL(path.resolve(__dirname, "../index.html")).href;
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      for (const reducedMotion of ["no-preference", "reduce"]) {
        const context = await browser.newContext({ viewport, reducedMotion });
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(home);
        await page.evaluate(() => document.fonts.ready);
        const layout = await page.evaluate(() => ({
          height: document.querySelector(".hero").getBoundingClientRect().height,
          contentTop: document.getElementById("home-content").getBoundingClientRect().top,
          navTop: document.querySelector(".site-nav").getBoundingClientRect().top,
          wash: getComputedStyle(document.getElementById("home-content")).backgroundColor,
          introWash: getComputedStyle(document.querySelector(".site-scrim")).backgroundColor,
          width: document.documentElement.scrollWidth,
          headings: document.querySelectorAll("h1").length,
          ascii: document.querySelector(".site-ascii").textContent.length
        }));
        assert.equal(layout.height, viewport.height);
        assert.equal(layout.contentTop, viewport.height);
        assert.equal(layout.navTop, viewport.height);
        assert.equal(layout.width, viewport.width);
        assert.equal(layout.headings, 1);
        assert.equal(layout.wash, "rgba(10, 35, 38, 0.72)");
        assert.equal(layout.introWash, "rgba(0, 0, 0, 0)");
        assert.ok(layout.ascii > 500);

        if (reducedMotion === "no-preference") {
          await page.waitForFunction(() => document.getElementById("rotating-word").textContent === "a digital fixer");
        } else {
          assert.equal(await page.locator(".site-background").evaluate((video) => video.paused), true);
          assert.equal(await page.locator(".scroll-arrow").evaluate((arrow) => getComputedStyle(arrow).animationDuration), "1e-06s");
        }

        const atContent = () => page.waitForFunction(() => Math.abs(scrollY - document.getElementById("home-content").offsetTop) < 2);
        await page.locator(".scroll-arrow").click({ force: true });
        await atContent();
        assert.equal(await page.evaluate(() => document.activeElement.id), "home-content");
        await page.waitForTimeout(800);
        await page.keyboard.press("PageUp");
        await page.waitForFunction(() => scrollY < 2);
        await page.waitForTimeout(800);
        await page.mouse.wheel(0, 100);
        await atContent();
        await page.waitForTimeout(800);
        await page.mouse.wheel(0, 300);
        await page.waitForFunction(() => scrollY > document.getElementById("home-content").offsetTop + 100);
        // The text is static when reduced motion is requested, even after scrolling.
        if (reducedMotion === "reduce") assert.equal(await page.locator("#rotating-word").textContent(), "a UX designer");
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await page.waitForTimeout(800);
        await page.evaluate(() => {
          const touch = (type, y) => window.dispatchEvent(new TouchEvent(type, {
            touches: [new Touch({ identifier: 1, target: document.body, clientX: 150, clientY: y })],
            cancelable: true
          }));
          touch("touchstart", 650);
          touch("touchmove", 450);
        });
        await atContent();
        assert.deepEqual(errors, []);
        await context.close();
        console.log(`Intro, tagline, arrow, keyboard, wheel and swipe passed: ${viewport.width}px / ${reducedMotion}`);
      }
    }
    const noScript = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce" });
    const fallback = await noScript.newPage();
    await fallback.goto(home);
    await fallback.locator(".scroll-arrow").click();
    await fallback.waitForFunction(() => location.hash === "#home-content");
    assert.ok(await fallback.locator(".site-nav").isVisible());
    await noScript.close();
    console.log("No-JavaScript scroll-link fallback passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
