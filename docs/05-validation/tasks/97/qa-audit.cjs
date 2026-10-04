const fs = require("node:fs");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

const evidence = "docs/05-validation/tasks/97";
const digest = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const baseline = execFileSync("git", ["rev-parse", "HEAD"]).toString().trim();
assert.deepEqual(fs.readFileSync("app/app.js"), execFileSync("git", ["show", "HEAD:app/app.js"]));
assert.deepEqual(fs.readFileSync("tests/browser/core.json"), fs.readFileSync(".harness/reading-core.json"));
const hashes = {};
for (const filename of ["index.html", "styles.css", "app.js"]) {
  const product = fs.readFileSync(`app/${filename}`);
  hashes[filename] = digest(product);
  assert.deepEqual(product, fs.readFileSync(`docs/04-implementation/tasks/97/prototype/product-validation/product/${filename}`));
  if (filename === "app.js") assert.deepEqual(product, fs.readFileSync(`docs/04-implementation/tasks/97/prototype/${filename}`));
  const resources = /(?:src|href)="[^"]+"|url\([^)]*\)/g;
  assert.deepEqual(product.toString().match(resources), execFileSync("git", ["show", `HEAD:app/${filename}`]).toString().match(resources));
}
const release = JSON.parse(fs.readFileSync("deploy/release.json"));
assert.equal(release.compatible_from, baseline);
assert.equal(release.data_change, "none");
const appDigest = crypto.createHash("sha256");
for (const filename of fs.readdirSync("app").sort()) {
  assert.ok(fs.statSync(`app/${filename}`).isFile());
  appDigest.update(`${filename}\0`);
  appDigest.update(fs.readFileSync(`app/${filename}`));
  appDigest.update("\0");
}
assert.equal(release.app_sha256, appDigest.digest("hex"));
const plans = [];
const ax = [];
for (let ordinal = 1; ordinal <= 8; ordinal += 1) {
  const directory = `${evidence}/browser/qa-1-${ordinal}`;
  const result = JSON.parse(fs.readFileSync(`${directory}/browser.json`));
  const executed = JSON.parse(fs.readFileSync(`${directory}/executed-plan.json`));
  assert.equal(result.passed, true);
  assert.equal(result.failure, null);
  assert.deepEqual(result.errors, []);
  assert.equal(result.performed.length, executed.length);
  plans.push({ directory, passed: result.passed, actions: result.performed.length, storageWrites: result.storageWrites, device: result.device, observations: result.observations });
  for (const filename of fs.readdirSync(directory).filter((entry) => /^accessibility-.*\.json$/.test(entry))) {
    const tree = JSON.parse(fs.readFileSync(`${directory}/${filename}`));
    const nodes = tree.nodes;
    const value = nodes.find((node) => !node.ignored && node.role?.value === "StaticText" && node.name?.value === "0.1.0 rc2");
    const label = nodes.find((node) => !node.ignored && node.role?.value === "StaticText" && node.name?.value?.trim() === "版本");
    assert.ok(value && label);
    const paragraph = (start) => {
      let node = start;
      while (node && node.role?.value !== "paragraph") node = nodes.find((entry) => entry.nodeId === node.parentId);
      return node;
    };
    const parent = paragraph(value);
    assert.ok(parent && paragraph(label));
    assert.equal(parent.nodeId, paragraph(label).nodeId);
    assert.equal(parent.ignored, false);
    assert.equal(parent.role.value, "paragraph");
    ax.push({ file: `${directory}/${filename}`, labelAndValueInSameParagraph: true });
  }
}
const gates = JSON.parse(fs.readFileSync(`${evidence}/delivery-checks/checks.json`));
assert.equal(gates.length, 8);
assert.ok(gates.every((gate) => gate.exit_code === 0));
console.log(JSON.stringify({ baseline, hashes, businessJsUnchanged: true, corePlanUnchanged: true, snapshotsMatchProduct: true, resourceReferencesUnchanged: true, releaseValid: true, plans, totalActions: plans.reduce((total, plan) => total + plan.actions, 0), ax, gates }, null, 2));
