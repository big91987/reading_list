const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../../../..");
const fixtureRoot = path.join(root, "docs/04-implementation/tasks/97/prototype/product-validation");
const destination = path.join(fixtureRoot, "product");
fs.mkdirSync(destination, { recursive: true });
for (const filename of ["index.html", "audit.js"]) {
  fs.copyFileSync(path.join(__dirname, "fixture", filename), path.join(fixtureRoot, filename));
}
const hashes = {};
for (const filename of ["index.html", "styles.css", "app.js"]) {
  const source = fs.readFileSync(path.join(root, "app", filename));
  fs.writeFileSync(path.join(destination, filename), source);
  hashes[filename] = crypto.createHash("sha256").update(source).digest("hex");
}
const currentJs = fs.readFileSync(path.join(root, "app/app.js"));
const baselineJs = execFileSync("git", ["show", "HEAD:app/app.js"], { cwd: root });
if (!currentJs.equals(baselineJs)) throw new Error("Business JS differs from HEAD");
for (const filename of ["index.html", "styles.css"]) {
  const current = fs.readFileSync(path.join(root, "app", filename), "utf8");
  const baseline = execFileSync("git", ["show", `HEAD:app/${filename}`], { cwd: root }).toString();
  const resources = /(?:src|href)="[^"]+"|url\([^)]*\)/g;
  assert.deepEqual(current.match(resources), baseline.match(resources));
}
const manifest = {
  baseline: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root }).toString().trim(),
  businessJsUnchanged: true,
  resourceReferencesUnchanged: true,
  hashes,
};
fs.writeFileSync(path.join(__dirname, "fixture/source-hashes.json"), `${JSON.stringify(manifest, null, 2)}\n`);
