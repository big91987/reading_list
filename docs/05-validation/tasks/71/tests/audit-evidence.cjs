const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "../../../../..");
const taskPath = path.join(root, "docs/05-validation/tasks/71");

function read(filename) {
  return JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
}

function digest(filename) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filename))
    .digest("hex");
}

function files(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(folder, entry.name);
    return entry.isDirectory() ? files(filename) : [filename];
  });
}

for (const filename of ["product-under-test-71.html", "browser-tests-71.js"]) {
  assert(
    !fs.existsSync(path.join(root, "app", filename)),
    "Temporary fixtures must be restored",
  );
}
const expected = read("docs/05-validation/tasks/71/fixture-source-hashes.json");
const productFiles = {
  html: "app/index.html",
  javascript: "app/app.js",
  css: "app/styles.css",
};
const testFiles = {
  html: "docs/05-validation/tasks/71/tests/fixture.html",
  javascript: "docs/05-validation/tasks/71/tests/browser-tests.js",
};
for (const [kind, sources] of Object.entries({
  product: productFiles,
  tests: testFiles,
})) {
  for (const [field, filename] of Object.entries(sources)) {
    assert.equal(
      digest(path.join(root, filename)),
      expected[kind][field],
      `${filename} differs from tested source`,
    );
  }
}

const planReports = [
  ["docs/05-validation/tasks/71/browser-plan.json", "development-1-3"],
  ["docs/05-validation/tasks/71/browser-keyboard-plan.json", "development-1-4"],
  [
    "docs/05-validation/tasks/71/browser-integration-plan.json",
    "development-1-7",
  ],
  [".harness/reading-core.json", "development-1-6"],
];
let actions = 0;
for (const [plan, run] of planReports) {
  const report = read(
    `docs/05-validation/tasks/71/browser/${run}/browser.json`,
  );
  assert.equal(report.passed, true, `${run} failed`);
  assert.deepEqual(report.errors, []);
  assert.deepEqual(
    report.performed,
    read(plan),
    `${run} does not match current plan`,
  );
  actions += report.performed.length;
}
const integration = read(
  "docs/05-validation/tasks/71/browser/development-1-7/download-1.json",
);
assert.equal(integration.records.length, 18);
assert(integration.records.every((record) => record.passed));
assert.deepEqual(integration.browserErrors, []);
assert.deepEqual(
  [...new Set(integration.records.flatMap((record) => record.ac))].sort(
    (first, second) => first - second,
  ),
  Array.from({ length: 13 }, (_value, index) => index + 1),
);

const screenshots = files(path.join(taskPath, "browser"))
  .filter(
    (filename) =>
      filename.includes(`${path.sep}development-`) && filename.endsWith(".png"),
  )
  .map((filename) => ({
    path: path.relative(root, filename),
    bytes: fs.statSync(filename).size,
    sha256: digest(filename),
  }));
fs.writeFileSync(
  path.join(taskPath, "development-screenshot-manifest.json"),
  JSON.stringify(
    {
      purpose:
        "Original PNG evidence remains in the shared workspace. UTF-8 handoff snapshots this manifest, not image bytes.",
      screenshots,
    },
    null,
    2,
  ) + "\n",
);
for (const image of read("docs/05-validation/tasks/71/screenshot-manifest.json")
  .screenshots) {
  assert.equal(fs.statSync(path.join(root, image.path)).size, image.bytes);
  assert.equal(digest(path.join(root, image.path)), image.sha256);
}

const documents = [
  ...files(path.join(root, "docs/01-architecture/tasks/71")),
  ...files(path.join(root, "docs/04-implementation/tasks/71")),
  ...files(taskPath),
  ...files(path.join(root, ".trellis/spec")),
  path.join(root, "docs/README.md"),
  path.join(root, "docs/00-global/project.md"),
].filter((filename) => filename.endsWith(".md"));
let links = 0;
for (const filename of documents) {
  const contents = fs.readFileSync(filename, "utf8");
  for (const match of contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const reference = match[1].split("#")[0];
    if (
      !reference ||
      /^(https?:|mailto:)/.test(reference) ||
      reference.includes("<issue>")
    )
      continue;
    links += 1;
    assert(
      fs.existsSync(path.resolve(path.dirname(filename), reference)),
      `Missing ${reference} from ${filename}`,
    );
  }
}
const result = {
  passed: true,
  product_and_test_hashes: "match tested source",
  final_plan_actions: actions,
  integration_groups: integration.records.length,
  ac_mapping: "1-13 covered; AC-12 OS IME/screen-reader remains manual",
  development_screenshots: screenshots.length,
  design_screenshots_verified: read(
    "docs/05-validation/tasks/71/screenshot-manifest.json",
  ).screenshots.length,
  local_links_checked: links,
};
fs.writeFileSync(
  path.join(taskPath, "evidence-audit.json"),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result, null, 2));
