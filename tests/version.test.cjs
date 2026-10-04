const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const appRoot = path.join(__dirname, "../app");
const html = fs.readFileSync(path.join(appRoot, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(appRoot, "styles.css"), "utf8");

test("version is a single static accessible text declaration", () => {
  assert.equal((html.match(/id="app-version"/g) || []).length, 1);
  assert.match(html, /<span id="app-version">0\.1\.0 rc2<\/span>/);
  assert.match(html, /<p class="footer-motto">一本一本，慢慢读完。<\/p>/);
  const version = html.match(/<p class="app-version">([\s\S]*?)<\/p>/)[0];
  assert.equal(version.replace(/<[^>]*>/g, ""), "版本 0.1.0 rc2");
  assert.doesNotMatch(version, /tabindex|aria-|title=|button|href=/);
  assert.deepEqual(html.match(/<script[^>]*>/g), ['<script src="app.js">']);
});

test("version uses readable muted styling in normal document flow", () => {
  const versionStyles = styles.match(/\.app-version\s*\{([^}]+)\}/)[1];
  assert.match(versionStyles, /font-size:\s*0\.875rem/);
  assert.match(versionStyles, /line-height:\s*1\.5/);
  assert.match(versionStyles, /color:\s*var\(--muted\)/);
  assert.match(versionStyles, /margin:\s*8px 0 0/);
  assert.doesNotMatch(versionStyles, /position:|overflow:|white-space:|text-overflow:/);
  assert.match(styles, /\.footer-motto\s*\{\s*margin:\s*0;/);
});

test("footer stays inside the layout viewport at native browser zoom", () => {
  const footerStyles = styles.match(/(?:^|\n)footer\s*\{([^}]+)\}/)[1];
  assert.match(footerStyles, /max-width:\s*100vw/);
});
