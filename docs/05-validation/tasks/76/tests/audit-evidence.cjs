const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "../../../../..");
const task = "docs/05-validation/tasks/76";
const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const digest = (name) =>
  crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(root, name)))
    .digest("hex");
const write = (name, value) =>
  fs.writeFileSync(
    path.join(root, name),
    JSON.stringify(value, null, 2) + "\n",
  );

function files(directory) {
  return fs
    .readdirSync(path.join(root, directory), { withFileTypes: true })
    .flatMap((entry) => {
      const name = `${directory}/${entry.name}`;
      return entry.isDirectory() ? files(name) : [name];
    });
}

const finalPlans = [
  [20, "tests/browser/core.json"],
  [21, `${task}/browser-plan.json`],
  [22, `${task}/browser-flow-320.json`],
  [23, `${task}/browser-flow-390.json`],
  [24, `${task}/browser-flow-768.json`],
  [25, `${task}/browser-keyboard-plan.json`],
  [18, `${task}/browser-integration-plan.json`],
  [19, `${task}/browser-failure-plan.json`],
  [12, `${task}/browser-visual-320.json`],
  [13, `${task}/browser-visual-390.json`],
  [14, `${task}/browser-visual-768.json`],
  [15, `${task}/browser-visual-1440.json`],
];
const results = finalPlans.map(([run, plan]) => {
  const report = `${task}/browser/development-1-${run}/browser.json`;
  const result = read(report);
  assert.equal(result.passed, true, report);
  assert.deepEqual(result.errors, [], report);
  assert.deepEqual(result.performed, read(plan), report);
  return { plan, report, actions: result.performed.length, passed: true };
});
assert.equal(
  fs.readFileSync(path.join(root, "tests/browser/core.json"), "utf8"),
  fs.readFileSync(path.join(root, ".harness/reading-core.json"), "utf8"),
);
const product = {
  html: digest("app/index.html"),
  javascript: digest("app/app.js"),
  css: digest("app/styles.css"),
};
for (const name of [
  "fixture-source-hashes.json",
  "failure-source-hashes.json",
]) {
  assert.deepEqual(
    read(`${task}/${name}`).product,
    product,
    "Evidence must match final product",
  );
  assert.equal(
    read(`${task}/${name}`).tests.javascript,
    digest(`${task}/tests/browser-tests.js`),
  );
}
assert.deepEqual(
  files("app").sort(),
  ["app/acceptance.json", "app/app.js", "app/index.html", "app/styles.css"],
  "Temporary test entrypoints must be restored",
);
const integration = read(`${task}/browser/development-1-18/download-1.json`);
assert.equal(integration.records.length, 26);
assert(integration.records.every((record) => record.passed));
assert.deepEqual(integration.browserErrors, []);
assert.equal(
  read(`${task}/verification-status.json`).shared_verify,
  "blocked_by_sandbox",
);
assert(
  fs
    .readFileSync(path.join(root, task, "delivery-checks/check-4.log"), "utf8")
    .includes("listen EPERM"),
);

const sources = [
  "app/index.html",
  "app/app.js",
  "app/styles.css",
  "tests/browser/core.json",
  ...files(`${task}/tests`),
];
write(`${task}/source-manifest.json`, {
  product,
  purpose:
    "Final implemented source; fixture original-product hashes equal these bytes",
  sources: sources.map((name) => ({ path: name, sha256: digest(name) })),
});
const screenshots = files(`${task}/browser`)
  .filter((name) => name.includes("/development-") && name.endsWith(".png"))
  .map((name) => ({
    path: name,
    bytes: fs.statSync(path.join(root, name)).size,
    sha256: digest(name),
  }));
write(`${task}/development-screenshot-manifest.json`, {
  purpose:
    "PNG files remain in shared workspace; UTF-8 handoff snapshots this manifest, not image bytes",
  screenshots,
});

const documents = [
  ...files("docs/01-architecture/tasks/76"),
  ...files("docs/04-implementation/tasks/76"),
  ...files(task),
  ...files(".trellis/spec"),
  "docs/README.md",
  "docs/00-global/project.md",
].filter((name) => name.endsWith(".md"));
let links = 0;
function checkLinks() {
  for (const name of documents) {
    for (const match of fs
      .readFileSync(path.join(root, name), "utf8")
      .matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const reference = match[1].split("#")[0];
      if (
        !reference ||
        /^(https?:|mailto:)/.test(reference) ||
        reference.includes("<issue>")
      )
        continue;
      assert(
        fs.existsSync(path.resolve(root, path.dirname(name), reference)),
        `Missing ${reference} from ${name}`,
      );
      links += 1;
    }
  }
}
const audit = {
  passed: true,
  final_plan_results: results,
  actions: results.reduce((total, entry) => total + entry.actions, 0),
  integration_groups: 26,
  product_hashes_match: true,
  core_bytes_unchanged: true,
  temporary_files_absent: true,
  screenshots: screenshots.length,
  relative_links_checked: links,
  limits:
    "Shared verify blocked by sandbox port binding; human acceptance pending as validation.md; visual 12-15 precede editor type/alert-only fixes",
};
write(`${task}/evidence-audit.json`, {
  passed: false,
  phase: "checking links",
});
const artifacts = [
  ...new Set([
    ...sources,
    ...files("docs/01-architecture/tasks/76"),
    ...files("docs/04-implementation/tasks/76"),
    ...files(task),
    ...files(".trellis/spec/frontend"),
    "docs/README.md",
    "docs/00-global/project.md",
  ]),
]
  .filter((name) => /\.(md|txt|json|log|js|cjs|html|css)$/.test(name))
  .sort();
fs.writeFileSync(
  path.join(root, task, "development-artifacts.txt"),
  artifacts.join("\n") + "\n",
);
checkLinks();
audit.relative_links_checked = links;
write(`${task}/evidence-audit.json`, audit);
console.log(JSON.stringify(audit, null, 2));
