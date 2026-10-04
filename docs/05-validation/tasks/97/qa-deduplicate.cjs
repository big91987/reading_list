const fs = require("node:fs");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const path = require("node:path");
const root = __dirname;
const manifestPath = path.join(root, "qa-image-aliases.json");
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

if (process.argv[2] === "deduplicate") {
  assert.ok(!fs.existsSync(manifestPath));
  const groups = new Map();
  const directories = fs.readdirSync(path.join(root, "browser"))
    .filter((name) => /^development-1-(1[7-9]|2[0-4])$|^qa-1-/.test(name))
    .sort((first, second) => Number(!first.startsWith("qa")) - Number(!second.startsWith("qa")) || first.localeCompare(second));
  for (const directory of directories) {
    for (const filename of fs.readdirSync(path.join(root, "browser", directory)).filter((name) => name.endsWith(".png"))) {
      const relative = `browser/${directory}/${filename}`;
      const bytes = fs.readFileSync(path.join(root, relative));
      const sha256 = digest(bytes);
      const entries = groups.get(sha256) || [];
      entries.push({ relative, bytes: bytes.length });
      groups.set(sha256, entries);
    }
  }
  const aliases = {};
  for (const [sha256, entries] of groups) {
    const retained = entries[0];
    for (const entry of entries.slice(1)) {
      assert.deepEqual(fs.readFileSync(path.join(root, entry.relative)), fs.readFileSync(path.join(root, retained.relative)));
      aliases[entry.relative] = { retained: retained.relative, sha256, bytes: entry.bytes };
    }
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify({ format: "identical-original-png-alias-v1", aliases }, null, 2)}\n`);
  for (const relative of Object.keys(aliases)) fs.unlinkSync(path.join(root, relative));
  console.log(JSON.stringify({ removedDuplicatePaths: Object.keys(aliases).length, savedBytes: Object.values(aliases).reduce((total, entry) => total + entry.bytes, 0), originalPixelsAndReceiptsUnchanged: true }));
} else {
  const { aliases } = JSON.parse(fs.readFileSync(manifestPath));
  for (const [relative, entry] of Object.entries(aliases)) {
    const bytes = fs.readFileSync(path.join(root, entry.retained));
    assert.equal(digest(bytes), entry.sha256);
    assert.equal(bytes.length, entry.bytes);
    if (process.argv[2] === "restore" && process.argv[3] === relative) {
      fs.writeFileSync(path.join(root, relative), bytes);
      console.log(`Restored ${relative}`);
    }
  }
  assert.ok(process.argv[2] === "verify" || aliases[process.argv[3]]);
  console.log(`Verified ${Object.keys(aliases).length} exact original PNG aliases`);
}
