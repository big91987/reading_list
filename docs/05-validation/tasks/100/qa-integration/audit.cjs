const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "../../../../..");
const base = path.dirname(__dirname);
const main = "b21c4a1c8875a727adc5eab7af90a8bc70b9ac3e";
const previous = "3f93282a7e6d084bb370079ac227b7ac88da9cea";
const read = (filename) => fs.readFileSync(filename, "utf8");
const load = (filename) => JSON.parse(read(filename));
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" });
git("merge-base", "--is-ancestor", main, "HEAD");
const head = git("rev-parse", "HEAD").trim();
const unchanged = ["app", "scripts/recommendations.py", "scripts/install_local_preview.py", "tests/recommendations_test.py", "tests/recommendations.test.cjs", "deploy/release.json", "docs/04-implementation/tasks/100/prd.md", "docs/01-architecture/tasks/100"];
assert.equal(git("diff", previous, "HEAD", "--", ...unchanged), "");
assert.equal(git("diff", "HEAD", "--", "app", "scripts", "tests", "deploy", ".github", "harness", "full_harness", "harness-project.json", "harness-upstream.json"), "");
assert.equal(git("show", "HEAD:tests/browser/core.json"), read(path.join(root, "tests/browser/core.json")));
const plans = ["main", "network", "candidates", "touch", "keyboard", "storage", "core", "catalogue", "manual", "dedup"];
const browser = plans.map((name, index) => {
  const directory = path.join(base, "browser", `qa-1-${index + 31}`);
  const receipt = load(path.join(directory, "browser.json"));
  assert.equal(receipt.passed, true);
  assert.deepEqual(receipt.errors, []);
  const executed = load(path.join(directory, "executed-plan.json"));
  for (const step of executed) {
    if (step.action === "page_script") {
      assert.equal(step.source, read(path.join(root, step.script)));
      delete step.source;
    }
  }
  const expected = name === "core" ? path.join(root, "tests/browser/core.json") : path.join(["catalogue", "manual"].includes(name) ? __dirname : path.join(base, "qa-recheck"), `${name}-plan.json`);
  assert.deepEqual(executed, load(expected));
  assert.equal(fs.existsSync(path.join(directory, "screenshot.png")), true);
  assert.equal(fs.existsSync(path.join(directory, "mobile.png")), true);
  return { directory: path.relative(root, directory), actions: receipt.performed.length, passed: true, device: receipt.device };
});
assert.equal(browser.reduce((total, entry) => total + entry.actions, 0), 209);
assert.equal(browser[3].device.hasTouch, true);
assert.equal(browser[3].device.isMobile, true);
const checks = load(path.join(__dirname, "host-checks/checks.json"));
assert.equal(checks.length, 9);
assert.equal(checks.every((check) => check.exit_code === 0), true);
assert.match(read(path.join(__dirname, "host-checks/check-7.log")), /Ran 50 tests/);
assert.match(read(path.join(__dirname, "host-checks/check-8.log")), /All checks passed/);
for (const name of ["existing", "feature"]) {
  const receipt = load(path.join(__dirname, "host-checks", name, "browser.json"));
  assert.equal(receipt.passed, true);
  assert.deepEqual(receipt.errors, []);
}
assert.match(read(path.join(__dirname, "python.log")), /Ran 50 tests/);
assert.match(read(path.join(__dirname, "node.log")), /pass 25/);
assert.match(read(path.join(__dirname, "node.log")), /fail 0/);
for (const filename of ["transport-boundaries.json", "wall-budget.json", "source-audit.json"]) assert.equal(load(path.join(__dirname, filename)).passed, true);
assert.equal(load(path.join(__dirname, "validate.json")).ready, true);
const collector = load(path.join(__dirname, "real-run.json"));
const catalogue = load(path.join(__dirname, "catalogue.json"));
assert.equal(collector.count, 32);
assert.equal(catalogue.records.length, 32);
assert.equal(collector.publishRevision, catalogue.revision);
assert.equal(new Set(catalogue.sources.map((source) => source.organisation)).size, 2);
assert.equal(new Set(catalogue.records.flatMap((record) => record.types)).size, 3);
const gaps = collector.requests.slice(1).map((request, index) => request.startedMonotonic - collector.requests[index].startedMonotonic);
assert.equal(gaps.length, 4);
assert.equal(gaps.every((gap) => gap >= 1), true);
const owner = path.join(process.env.HOME, ".local/share/reading-list-preview");
const deployed = load(path.join(owner, "deployed.json"));
const baseline = load(path.join(base, "compatibility/baseline.json"));
assert.equal(deployed.sha, baseline.deployed_sha);
for (const [filename, expected] of Object.entries(baseline.files)) {
  const bytes = fs.readFileSync(path.join(owner, "releases", deployed.sha, filename));
  assert.deepEqual(bytes, fs.readFileSync(path.join(base, "compatibility/baseline", filename)));
  assert.equal(bytes.length, expected.bytes);
  assert.equal(hash(bytes), expected.sha256);
}
const release = load(path.join(root, "deploy/release.json"));
const fingerprint = execFileSync("python3", ["-c", "import importlib.util,pathlib; spec=importlib.util.spec_from_file_location('qa_deploy','scripts/local_deploy.py'); module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module); print(module.fingerprint(pathlib.Path('app')))"], { cwd: root, encoding: "utf8" }).trim();
assert.equal(release.app_sha256, fingerprint);
assert.equal(release.compatible_from, deployed.sha);
function entries(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? entries(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}
const evidence = [...entries(path.join(__dirname, "host-checks")), ...entries(path.join(__dirname, "host-initial-checks")), ...entries(path.join(__dirname, "before-delivery-checks")), ...entries(path.join(__dirname, "before-runner-checks")), ...browser.flatMap((entry) => entries(path.join(root, entry.directory)))].map((filename) => {
  const bytes = fs.readFileSync(filename);
  return { path: path.relative(root, filename), bytes: bytes.length, sha256: hash(bytes) };
});
const result = { audit_passed: true, qa_release_passed: true, ready_pr_integration_only: true, head, main_baseline: main, previous_feature_head: previous, synchronized_changes: git("diff", "--name-only", previous, "HEAD").trim().split("\n"), unchanged_product_scope: unchanged, qa_product_and_protected_diff_empty: true, python_tests: 50, node_tests: 25, trusted_host_checks: 9, browser, browser_actions: 209, real_catalogue_revision: catalogue.revision, actual_send_gaps_seconds: gaps, deployed_sha: deployed.sha, release_fingerprint: fingerprint, private_user_data_read: false, current_browser_evidence_kept_raw: true, old_scanner_used: false, historical_evidence_repacked: false, prior_missing_ax_not_claimed_recovered: true };
fs.writeFileSync(path.join(__dirname, "evidence.json"), JSON.stringify({ scope: "Read-only hashes of copied rolling outputs and this integration round raw browser files; no compression, aliasing or deletion", files: evidence }, null, 2) + "\n");
fs.writeFileSync(path.join(__dirname, "audit.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
