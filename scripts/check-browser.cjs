const { chromium } = require("playwright");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const files = new Map([["/", "text/html"], ["/index.html", "text/html"], ["/app.js", "text/javascript"], ["/business-demo.mjs", "text/javascript"], ["/styles.css", "text/css"], ["/og.png", "image/png"], ["/og.svg", "image/svg+xml"]]);
for (const file of ["demo-state.mjs", "demo-template.mjs", "demo-storage.mjs"]) files.set(`/${file}`, "text/javascript");
(async () => {
  const server = http.createServer(async (req, res) => {
    const file = new URL(req.url, "http://localhost").pathname;
    if (!files.has(file)) return res.writeHead(404).end();
    res.setHeader("Content-Type", files.get(file)); res.end(await fs.readFile(path.join(root, file === "/" ? "index.html" : file.slice(1))));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true, ...(process.platform === "win32" ? { channel: "msedge" } : {}) });
  let external = 0;
  try {
    await fs.mkdir(path.join(root, "reports"), { recursive: true });
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = []; page.on("pageerror", error => errors.push(error.message));
      await page.route("**/*", route => { if (new URL(route.request().url()).hostname !== "127.0.0.1") { external++; return route.abort(); } return route.continue(); });
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      await page.getByRole("button", { name: "Save business profile", exact: true }).click();
      await page.getByLabel("Business request", { exact: true }).fill("Prepare a fictional Tuesday dinner activity.");
      await page.getByRole("button", { name: "Prepare demo result", exact: true }).click();
      assert.match(await page.locator("#journey-sources").innerText(), /Synthetic profile v1/);
      await page.getByRole("button", { name: "Confirm draft", exact: true }).click();
      assert.match(await page.locator("#journey-status").innerText(), /explicitly confirm/);
      await page.getByLabel("Prepared draft", { exact: true }).fill("Synthetic edited draft. Source: profile v1. Pricing still needs owner confirmation.");
      await page.getByRole("button", { name: "Save draft changes", exact: true }).click();
      await page.getByLabel("I reviewed this synthetic draft and its sources.", { exact: true }).check();
      await page.getByRole("button", { name: "Confirm draft", exact: true }).click();
      for (const [label, changed] of [["Business name", "Synthetic changed name"], ["Business request", "A revised fictional request"], ["Prepared draft", "Recovered synthetic draft. Budget remains unknown."]]) {
        await page.getByLabel(label, { exact: true }).fill(changed);
        assert.equal(await page.locator("#continue-draft").isDisabled(), true);
        await page.reload();
        assert.equal(await page.getByLabel(label, { exact: true }).inputValue(), changed);
        assert.equal(await page.locator("#continue-draft").isDisabled(), true);
        await page.getByRole("button", { name: "Discard unsaved changes", exact: true }).click();
        assert.equal(await page.locator("#continue-draft").isEnabled(), true);
      }
      await page.getByRole("button", { name: "Continue demo work", exact: true }).click();
      await page.reload();
      assert.match(await page.locator("#draft-stage").innerText(), /external work not performed/);
      assert.ok(await page.locator("#next-step").isVisible());
      await page.locator("#journey-history summary").focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("#journey-history details").getAttribute("open"), "");
      assert.match(await page.locator("#journey-history").innerText(), /Pricing still needs owner confirmation/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      await page.locator("#draft-review").scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(root, "reports", `journey-${width}.png`) });
      await page.getByRole("button", { name: "Reset demo", exact: true }).click();
      await page.reload();
      assert.equal(await page.locator("#profile-saved").innerText(), "No profile saved yet");
      assert.equal(await page.locator("#draft-review").isVisible(), false);
      assert.equal(await page.locator("#journey-history details").count(), 0);
      assert.deepEqual(errors, []); await page.close();
    }
    // Same-origin tabs share storage; stale work must not silently overwrite newer input.
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const errors = []; let requests = 0;
    await context.route("**/*", route => { if (new URL(route.request().url()).hostname !== "127.0.0.1") { external++; return route.abort(); } requests++; return route.continue(); });
    const a = await context.newPage(), b = await context.newPage();
    for (const page of [a, b]) page.on("pageerror", error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}/`;
    await a.goto(url);
    await a.getByRole("button", { name: "Save business profile", exact: true }).click();
    await a.getByLabel("Business request", { exact: true }).fill("Synthetic shared-tab request");
    await a.getByRole("button", { name: "Prepare demo result", exact: true }).click();
    await a.getByLabel("I reviewed this synthetic draft and its sources.", { exact: true }).check();
    await a.getByRole("button", { name: "Confirm draft", exact: true }).click();
    await b.goto(url);
    await a.getByLabel("Prepared draft", { exact: true }).fill("Unsaved changes in the first tab.");
    await b.locator("#reload-saved").waitFor({ state: "visible" });
    assert.equal(await b.locator("#continue-draft").isDisabled(), true);
    await b.locator("#reload-saved").click();
    assert.equal(await b.getByLabel("Prepared draft", { exact: true }).inputValue(), "Unsaved changes in the first tab.");
    await a.getByRole("button", { name: "Reset demo", exact: true }).click();
    await b.locator("#reload-saved").waitFor({ state: "visible" }); await b.locator("#reload-saved").click();
    assert.equal(await b.locator("#profile-saved").innerText(), "No profile saved yet");
    // CSS 200% zoom checks reflow only; this is not a physical-device or OS zoom claim.
    await b.evaluate(() => { document.body.style.zoom = "2"; });
    const zoomLayout = await b.evaluate(() => ({ viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll("body *")].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > window.innerWidth + 1; }).slice(0, 20).map(el => ({ tag: el.tagName, id: el.id, className: el.className, right: el.getBoundingClientRect().right })) }));
    await fs.writeFile(path.join(root, "reports", "zoom-layout-2026-10-29.json"), JSON.stringify(zoomLayout, null, 2));
    await b.screenshot({ path: path.join(root, "reports", "journey-css-zoom-200.png") });
    assert.ok(zoomLayout.scrollWidth <= zoomLayout.viewport, "200% CSS zoom overflow");
    assert.deepEqual(errors, []); await context.close();
    // Inject denied writes/removals without changing the browser's real privacy settings.
    const denied = await browser.newContext();
    await denied.route("**/*", route => { if (new URL(route.request().url()).hostname !== "127.0.0.1") { external++; return route.abort(); } return route.continue(); });
    await denied.addInitScript(() => {
      Storage.prototype.setItem = function() { throw new DOMException("Synthetic quota failure", "QuotaExceededError"); };
      Storage.prototype.removeItem = function() { throw new DOMException("Synthetic denied removal", "SecurityError"); };
    });
    const failurePage = await denied.newPage(); failurePage.on("pageerror", error => errors.push(error.message)); await failurePage.goto(url);
    await failurePage.getByRole("button", { name: "Save business profile", exact: true }).click();
    assert.match(await failurePage.locator("#journey-status").innerText(), /this tab only/);
    await failurePage.getByLabel("Business request", { exact: true }).fill("Synthetic memory-only request");
    await failurePage.getByRole("button", { name: "Prepare demo result", exact: true }).click();
    await failurePage.getByLabel("I reviewed this synthetic draft and its sources.", { exact: true }).check();
    await failurePage.getByRole("button", { name: "Confirm draft", exact: true }).click();
    assert.match(await failurePage.locator("#draft-stage").innerText(), /this tab only/);
    await failurePage.getByRole("button", { name: "Reset demo", exact: true }).click();
    assert.match(await failurePage.locator("#journey-status").innerText(), /could not be cleared/);
    assert.equal(await failurePage.locator("#profile-saved").innerText(), "No profile saved yet");
    assert.deepEqual(errors, []); await denied.close();
    assert.equal(external, 0); console.log(JSON.stringify({ status: "PASS", viewports: [1280, 390], reviewedContinuation: true, reloadAndReset: true, externalRequests: external }));
    await fs.writeFile(path.join(root, "reports", "recovery-browser-2026-10-29.json"), JSON.stringify({ status: "PASS", viewports: [1280, 390], input: "synthetic", recoveredUnsavedFields: ["profile", "request", "draft"], historyKeyboard: true, multiTabConflict: true, crossTabReset: true, injectedStorageFailures: true, cssZoomPercent: 200, externalRequests: external, pageErrors: errors, independentHuman: false }, null, 2));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
