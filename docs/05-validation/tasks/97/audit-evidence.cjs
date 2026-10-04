const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../../../..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const json = (relativePath) => JSON.parse(read(relativePath));
const task = "docs/05-validation/tasks/97";
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const pairs = [
  ["tests/browser/core.json", 17],
  [`${task}/browser-plan.json`, 18],
  [`${task}/browser-touch.json`, 19],
  [`${task}/browser-native-capabilities.json`, 20],
  [`${task}/browser-layout-regression.json`, 21],
  [`${task}/browser-fixture.json`, 22],
];
const plans = pairs.map(([plan, sequence]) => {
  const receipt = `${task}/browser/development-1-${sequence}/browser.json`;
  const result = json(receipt);
  assert.equal(result.passed, true, receipt);
  const performed = result.performed.map(({ source, ...action }) => action);
  assert.deepEqual(performed, json(plan), receipt);
  return { plan, receipt, actions: performed.length, passed: result.passed };
});
assert.equal(plans.reduce((total, plan) => total + plan.actions, 0), 159);
assert.equal(read("tests/browser/core.json"), read(".harness/reading-core.json"));
const originalScript = json(`${task}/browser/development-1-9/browser.json`).performed.find(
  (action) => action.action === "page_script",
).source;
assert.equal(read(`${task}/browser-scripts/version-layout.js`), originalScript);

const axFiles = [20, 21].flatMap((sequence) => {
  const directory = `${task}/browser/development-1-${sequence}`;
  return fs.readdirSync(path.join(root, directory))
    .filter((filename) => /^accessibility-\d+\.json$/.test(filename))
    .map((filename) => `${directory}/${filename}`);
});
const accessibility = axFiles.map((filename) => {
  const nodes = json(filename).nodes;
  const byId = new Map(nodes.map((node) => [node.nodeId, node]));
  const paragraph = (node) => {
    while (node && node.role?.value !== "paragraph") node = byId.get(node.parentId);
    assert.ok(node && !node.ignored, filename);
    return node.nodeId;
  };
  const label = nodes.find((node) => !node.ignored && node.role?.value === "StaticText" && node.name?.value === "版本 ");
  const value = nodes.find((node) => !node.ignored && node.role?.value === "StaticText" && node.name?.value === "0.1.0 rc2");
  assert.ok(label && value, filename);
  assert.equal(paragraph(label), paragraph(value), filename);
  return { file: filename, sameUnignoredParagraph: true, screenReaderAudioTested: false };
});

const native = json(`${task}/browser/development-1-20/browser.json`);
const zooms = native.observations.filter((entry) => entry.action === "zoom");
assert.deepEqual(zooms.map((entry) => [entry.actual, entry.width, entry.devicePixelRatio]), [[2, 720, 2], [2, 160, 2]]);
const layout = json(`${task}/browser/development-1-21/browser.json`);
const baseline = layout.observations.filter((entry) => entry.script?.endsWith("version-baseline.js"));
assert.equal(baseline.length, 4);
for (const entry of baseline) {
  assert.equal(entry.value.productWidth, entry.value.baselineWidth);
  assert.equal(entry.value.nonOverlapping, true);
  assert.equal(entry.value.storageUnchanged, true);
}
assert.equal(layout.storageWrites, 0);
const touch = json(`${task}/browser/development-1-19/browser.json`);
assert.equal(touch.device.hasTouch, true);
assert.equal(touch.device.isMobile, true);
const positive = json(`${task}/browser/development-1-23/browser.json`);
const negative = json(`${task}/browser/development-1-24/browser.json`);
assert.equal(positive.passed, true);
assert.equal(positive.storageWrites, 0);
assert.equal(negative.passed, false);
assert.equal(negative.storageWrites, 1);
assert.match(negative.failure, /1 !== 0/);
assert.doesNotMatch(negative.failure, /TypeError/);

const source = json(`${task}/fixture/source-hashes.json`);
const baselineCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root }).toString().trim();
assert.equal(source.baseline, baselineCommit);
assert.equal(source.businessJsUnchanged, true);
assert.equal(source.resourceReferencesUnchanged, true);
for (const filename of ["index.html", "styles.css", "app.js"]) {
  const bytes = fs.readFileSync(path.join(root, "app", filename));
  assert.equal(digest(bytes), source.hashes[filename]);
  assert.ok(bytes.equals(fs.readFileSync(path.join(root, "docs/04-implementation/tasks/97/prototype/product-validation/product", filename))));
}
assert.ok(fs.readFileSync(path.join(root, "app/app.js")).equals(execFileSync("git", ["show", "HEAD:app/app.js"], { cwd: root })));
for (const filename of ["index.html", "styles.css"]) {
  const current = read(`app/${filename}`);
  const old = execFileSync("git", ["show", `HEAD:app/${filename}`], { cwd: root }).toString();
  const references = /(?:src|href)="[^"]+"|url\([^)]*\)/g;
  assert.deepEqual(current.match(references), old.match(references));
}
const release = json("deploy/release.json");
assert.equal(release.compatible_from, baselineCommit);
assert.equal(release.data_change, "none");
const checks = json(`${task}/delivery-checks/checks.json`);
assert.equal(checks.length, 8);
for (const check of checks) assert.equal(check.exit_code, 0);

const archive = json(`${task}/browser-archive/manifest.json`);
execFileSync("node", [`${task}/archive-history.cjs`, "verify"], { cwd: root });
const documents = [];
function walk(directory) {
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const filename = `${directory}/${entry.name}`;
    if (entry.isDirectory()) walk(filename);
    else if (entry.name.endsWith(".md")) documents.push(filename);
  }
}
for (const directory of ["docs/01-architecture/tasks/97", "docs/04-implementation/tasks/97", task]) walk(directory);
documents.push("docs/README.md");
let relativeLinks = 0;
let archivedLinks = 0;
for (const filename of documents) {
  for (const match of read(filename).matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
    const resolved = path.resolve(root, path.dirname(filename), target);
    if (resolved === path.join(__dirname, "evidence-audit-resumed.json")) continue;
    if (!fs.existsSync(resolved)) {
      const archivedPath = path.relative(path.join(root, task), resolved);
      assert.ok(archive.files[archivedPath], `${filename}: missing ${target}`);
      archivedLinks++;
    }
    relativeLinks++;
  }
}
execFileSync("git", ["diff", "--check"], { cwd: root });
const result = {
  baselineCommit,
  plans,
  productActions: 159,
  originalNativeScriptUnchanged: true,
  corePlanUnchanged: true,
  accessibility,
  nativeZooms: zooms,
  baselineComparisons: baseline.map((entry) => entry.value),
  toolZeroWrites: { passed: true, writes: 0 },
  toolNewWriteNegative: { actualPassed: false, writes: 1, failure: negative.failure, expectedRejection: true },
  source,
  qualityGates: checks.length,
  relativeLinks,
  archivedLinks,
  archivedOriginalPaths: Object.keys(archive.files).length,
  currentReadiness: "Ready for independent QA; not QA, merge or deployment approval",
};
fs.writeFileSync(path.join(__dirname, "evidence-audit-resumed.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Audited ${plans.length} product plans / 159 actions, ${axFiles.length} AX trees, 8 gates, ${relativeLinks} relative links (${archivedLinks} losslessly archived images)`);
