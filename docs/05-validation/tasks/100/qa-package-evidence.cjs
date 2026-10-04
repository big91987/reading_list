const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const root = path.resolve(__dirname, "../../../..");
const digest = (data) => crypto.createHash("sha256").update(data).digest("hex");
const historical = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence-aliases.json"), "utf8"));
const reused = [];
for (const entry of historical.files.filter((entry) => entry.path.includes("/100/delivery-checks/"))) {
  const filename = path.join(root, entry.path);
  if (!fs.existsSync(filename)) continue;
  const raw = fs.readFileSync(filename);
  if (!raw.equals(fs.readFileSync(path.join(root, entry.canonical))) || raw.length !== entry.bytes || digest(raw) !== entry.sha256) throw new Error("Restored gate screenshot differs from canonical");
  reused.push(entry);
}
const manifestPath = path.join(__dirname, "qa-packaged-evidence.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { scope: "Exact gzip packaging of QA AX trees; no receipt or unique screenshot changes", gzipFiles: [], existingAliasesReused: [] };
manifest.gzipFiles ||= [];
let gzipSaved = 0;
for (const original of ["qa-1-1/accessibility-44.json", "qa-1-4/accessibility-13.json", "qa-1-8/accessibility-8.json", "qa-1-9/accessibility-16.json"].map((name) => "docs/05-validation/tasks/100/browser/" + name)) {
  const filename = path.join(root, original);
  if (!fs.existsSync(filename)) continue;
  const raw = fs.readFileSync(filename);
  const encoded = zlib.gzipSync(raw);
  if (!zlib.gunzipSync(encoded).equals(raw)) throw new Error("AX bytes differ");
  fs.writeFileSync(filename + ".gz", encoded);
  manifest.gzipFiles.push({ path: original, archive: original + ".gz", sha256: digest(raw), bytes: raw.length });
  gzipSaved += raw.length - encoded.length;
}
manifest.existingAliasesReused.push(...reused);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
for (const entry of manifest.gzipFiles) if (fs.existsSync(path.join(root, entry.path))) fs.unlinkSync(path.join(root, entry.path));
for (const entry of reused) fs.unlinkSync(path.join(root, entry.path));
console.log(JSON.stringify({ gzipSaved, aliases: reused.length, aliasSaved: reused.reduce((sum, entry) => sum + entry.bytes, 0) }));
