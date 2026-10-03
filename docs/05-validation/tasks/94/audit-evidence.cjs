const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const directory = "docs/05-validation/tasks/94/";
const planNames = [
  "browser-plan.json",
  "browser-hover-unread.json",
  "browser-hover-read.json",
  "browser-touch.json",
  "browser-layout.json",
  "browser-hover-empty.json",
  "browser-hover-read-empty.json",
  "browser-hover-unread-empty.json",
  "browser-click-keyboard.json",
  "browser-button-geometry.json",
  "browser-hover-editor.json",
  "tests/browser/core.json",
  "browser-states.json",
  "docs/05-validation/tasks/82/browser-plan.json",
  "docs/05-validation/tasks/82/product-storage-failure-plan.json",
  "docs/05-validation/tasks/71/browser-keyboard-plan.json",
];
const digest = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const records = planNames.map((planName, index) => {
  const planPath =
    planName.startsWith("docs/") || planName.startsWith("tests/")
      ? planName
      : directory + planName;
  const resultPath = `${directory}browser/development-1-${index + 10}/browser.json`;
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const result = JSON.parse(fs.readFileSync(resultPath, "utf8"));
  assert.equal(result.passed, true, resultPath);
  assert.deepEqual(result.performed, plan, resultPath);
  assert.deepEqual(result.errors, [], resultPath);
  assert.equal(result.failure, null, resultPath);
  assert.ok(plan.length <= 80, planPath);
  const imagePaths = ["screenshot.png", "mobile.png"].map((name) =>
    resultPath.replace("browser.json", name),
  );
  return {
    plan: planPath,
    result: resultPath,
    actionCount: plan.length,
    passed: result.passed,
    device: result.device,
    totalStorageWritesIncludingFixtureSetup: result.storageWrites,
    planSha256: digest(planPath),
    resultSha256: digest(resultPath),
    images: imagePaths.map((file) => ({ file, sha256: digest(file) })),
  };
});
const hostPath = directory + "host-checks-before-resume/checks.json";
const hostChecks = JSON.parse(fs.readFileSync(hostPath, "utf8"));
assert.equal(hostChecks.length, 8);
for (const check of hostChecks) assert.equal(check.exit_code, 0);
const archivedHostFeature = JSON.parse(
  fs.readFileSync(
    directory + "host-checks-before-resume/feature/browser.json",
    "utf8",
  ),
);
assert.equal(archivedHostFeature.passed, true);
assert.deepEqual(
  archivedHostFeature.performed,
  JSON.parse(
    fs.readFileSync(directory + "browser-click-keyboard.json", "utf8"),
  ),
);
const hostNodeLog = fs.readFileSync(
  directory + "host-checks-before-resume/check-6.log",
  "utf8",
);
assert.match(hostNodeLog, /tests 13/);
assert.match(hostNodeLog, /pass 13/);
assert.match(hostNodeLog, /fail 0/);
const hostPythonLog = fs.readFileSync(
  directory + "host-checks-before-resume/check-7.log",
  "utf8",
);
assert.match(hostPythonLog, /Ran 8 tests/);
assert.match(hostPythonLog, /\nOK\s*$/);
const touch = records[3];
assert.equal(touch.device.hasTouch, true);
assert.equal(touch.device.isMobile, true);
assert.equal(touch.device.viewport.width, 390);
const oldFailure = JSON.parse(
  fs.readFileSync(directory + "browser/development-1-3/browser.json", "utf8"),
);
assert.equal(oldFailure.passed, false);
assert.ok(fs.existsSync(directory + "local-deploy-tests.log"));
assert.ok(fs.existsSync(directory + "unit-tests-format-failure.log"));
console.log(
  JSON.stringify(
    {
      passed: true,
      finalPlanCount: records.length,
      finalActionCount: records.reduce(
        (total, record) => total + record.actionCount,
        0,
      ),
      hostChecks: {
        file: hostPath,
        passedCount: hostChecks.length,
        sha256: digest(hostPath),
        featurePlanAtHostRun: directory + "browser-click-keyboard.json",
      },
      sourceDigests: ["app/index.html", "app/styles.css", "app/app.js"].map(
        (file) => ({ file, sha256: digest(file) }),
      ),
      history: {
        firstPassBrowserFailureRetained: true,
        firstPassEnvironmentFailureLogRetained: true,
      },
      limitations: [
        "Touch result is Chromium hasTouch/isMobile emulation, not a physical phone",
        "No Firefox/Safari or screen-reader certification",
        "Host pre-resume gate tested the earlier click/keyboard feature plan; current primary hover plan is independently verified via official MCP and will be rechecked by Runner",
      ],
      records,
    },
    null,
    2,
  ),
);
