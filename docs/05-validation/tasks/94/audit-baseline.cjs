const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const baselineSha = "82ec5a7653d57939df276058b7cbf465bfe8c90c";
const baseline = (file) =>
  execFileSync("git", ["show", `${baselineSha}:${file}`], { encoding: "utf8" });
const script = fs.readFileSync("app/app.js", "utf8");
const withoutListeners = script
  .replace(
    /  button.addEventListener\("pointerleave", \(\) => \{\n    button.classList.remove\("tooltip-dismissed"\);\n  \}\);\n/,
    "",
  )
  .replace(
    /document.addEventListener\("keydown", \(event\) => \{\n  if \(event.key !== "Escape"\) return;\n  filterButtons.forEach\(\(button\) => \{\n    if \(button.matches\(":hover"\)\) button.classList.add\("tooltip-dismissed"\);\n  \}\);\n\}\);\n\n/,
    "",
  );
assert.equal(withoutListeners, baseline("app/app.js"));
const style = fs.readFileSync("app/styles.css", "utf8");
assert.equal(
  style.replace(
    /\.filter-tooltip \{[\s\S]*?\n\}\n@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\n\}\n/,
    "",
  ),
  baseline("app/styles.css"),
);
const html = fs.readFileSync("app/index.html", "utf8");
const stripTooltip = (text) =>
  text
    .replace(
      /<span class="filter-tooltip" aria-hidden="true"\s*>[\s\S]*?<\/span\s*>/g,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
assert.equal(stripTooltip(html), stripTooltip(baseline("app/index.html")));
assert.equal(
  fs.readFileSync("tests/browser/core.json", "utf8"),
  fs.readFileSync(".harness/reading-core.json", "utf8"),
);
console.log(
  JSON.stringify(
    {
      baseline: baselineSha,
      passed: true,
      assertions: [
        "app.js only dismissal listeners; original business code byte-identical",
        "styles.css only tooltip rules; original layout rules byte-identical",
        "HTML only three spans after whitespace normalization",
        "core plan byte-identical to owner regression plan",
      ],
      limitations: [
        "No browser geometry comparison or deployed-baseline observation",
      ],
    },
    null,
    2,
  ),
);
