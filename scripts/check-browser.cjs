const { chromium } = require("playwright");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const files = new Map([["/", "text/html"], ["/index.html", "text/html"], ["/app.js", "text/javascript"], ["/business-demo.mjs", "text/javascript"], ["/styles.css", "text/css"], ["/og.png", "image/png"], ["/og.svg", "image/svg+xml"]]);
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
      await page.getByRole("button", { name: "Continue demo work", exact: true }).click();
      await page.reload();
      assert.match(await page.locator("#draft-stage").innerText(), /external work not performed/);
      assert.ok(await page.locator("#next-step").isVisible());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      await page.locator("#draft-review").scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(root, "reports", `journey-${width}.png`) });
      await page.getByRole("button", { name: "Reset demo", exact: true }).click();
      await page.reload();
      assert.equal(await page.locator("#profile-saved").innerText(), "No profile saved yet");
      assert.equal(await page.locator("#draft-review").isVisible(), false);
      assert.deepEqual(errors, []); await page.close();
    }
    assert.equal(external, 0); console.log(JSON.stringify({ status: "PASS", viewports: [1280, 390], reviewedContinuation: true, reloadAndReset: true, externalRequests: external }));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
