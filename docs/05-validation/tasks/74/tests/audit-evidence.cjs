const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "../../../../..");
const task = path.join(root, "docs/05-validation/tasks/74");

function read(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function digest(filename) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filename))
    .digest("hex");
}

for (const issue of [71, 74]) {
  for (const filename of [
    `product-under-test-${issue}.html`,
    `browser-tests-${issue}.js`,
  ]) {
    assert(
      !fs.existsSync(path.join(root, "app", filename)),
      "Temporary fixture remains",
    );
  }
  const snapshot = read(
    path.join(
      task,
      issue === 74
        ? "fixture-source-hashes.json"
        : "fixture-71-source-hashes.json",
    ),
  );
  const files = {
    product: {
      html: "app/index.html",
      javascript: "app/app.js",
      css: "app/styles.css",
    },
    tests: {
      html: `docs/05-validation/tasks/${issue}/tests/fixture.html`,
      javascript: `docs/05-validation/tasks/${issue}/tests/browser-tests.js`,
    },
  };
  for (const [group, entries] of Object.entries(files)) {
    for (const [kind, filename] of Object.entries(entries)) {
      assert.equal(
        digest(path.join(root, filename)),
        snapshot[group][kind],
        `${filename} differs from tested sources`,
      );
    }
  }
}

const plans = [
  ["browser-plan.json", 19],
  ["browser-states-plan.json", 2],
  ["browser-integration-plan.json", 17],
  ["browser-integration-71-plan.json", 6],
  ["tests/browser/core.json", 18],
  ["browser-regression-71-plan.json", 8],
  ["browser-keyboard-plan.json", 10],
  ["browser-keyboard-71-plan.json", 11],
  ["browser-sample-plan.json", 13],
  ["browser-large-plan.json", 16],
];
let actions = 0;
for (const [filename, run] of plans) {
  const evidence = path.join(task, "browser", `development-1-${run}`);
  const plan = read(
    path.join(filename.startsWith("tests/") ? root : task, filename),
  );
  const report = read(path.join(evidence, "browser.json"));
  assert.equal(report.passed, true, filename);
  assert.deepEqual(report.errors, [], filename);
  assert.deepEqual(report.performed, plan, filename);
  assert(plan.length <= 80, "Plan exceeds registered tool limit");
  actions += plan.length;
  for (const screenshot of ["screenshot.png", "mobile.png"]) {
    assert(
      fs.statSync(path.join(evidence, screenshot)).size > 0,
      "Missing screenshot",
    );
  }
}
for (const [run, expected] of [
  [17, 28],
  [6, 18],
]) {
  const report = read(
    path.join(task, "browser", `development-1-${run}`, "download-1.json"),
  );
  assert.equal(report.records.length, expected);
  assert(report.records.every((record) => record.passed));
  assert.deepEqual(report.browserErrors, []);
}
const original = execFileSync(
  "git",
  ["show", "HEAD:.harness/reading-core.json"],
  { cwd: root, encoding: "utf8" },
);
assert.equal(
  fs.readFileSync(path.join(root, ".harness/reading-core.json"), "utf8"),
  original,
  "Protected Owner plan changed",
);
const updated = JSON.parse(original).map((step) => {
  if (step.action !== "click" || step.role !== "button") return step;
  const names = { 已读: "已读 1", 未读: "未读 1", 全部: "全部 2" };
  return names[step.name] ? { ...step, name: names[step.name] } : step;
});
assert.deepEqual(
  read(path.join(root, "tests/browser/core.json")),
  updated,
  "Owner journey changed beyond expected names",
);
const changed = execFileSync("git", ["diff", "--name-only", "HEAD"], {
  cwd: root,
  encoding: "utf8",
})
  .trim()
  .split("\n");
assert(
  !changed.some(
    (filename) =>
      filename.startsWith(".github/") ||
      filename.startsWith("harness/") ||
      [
        "harness-project.json",
        "harness-upstream.json",
        ".harness/reading-core.json",
      ].includes(filename),
  ),
  "Protected path changed",
);
console.log(
  JSON.stringify(
    {
      passed: true,
      plans: plans.length,
      actions,
      integrationCases: 46,
      sourceHashesMatch: true,
      temporaryFixturesRemoved: true,
      protectedOwnerPlanUnchanged: true,
      gate: "Registered browser and static evidence complete; independent formal Runner verification pending",
    },
    null,
    2,
  ),
);
