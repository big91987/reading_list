const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const root = path.resolve(__dirname, "../../../../..");
const manifestPath = path.join(__dirname, "evidence.json");
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((item) => item.isDirectory() ? files(path.join(directory, item.name)) : [path.join(directory, item.name)]);
}
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { scope: "Only current QA recheck browser evidence: byte-identical PNG aliases and exact gzip of AX/executed plans; no product or receipt edits", directories: [], pngs: [], gzip: [] };
const action = process.argv[2];
if (action === "archive" || action === "archive-json") {
  const directories = process.argv.slice(3);
  const targets = directories.flatMap((directory) => files(path.join(root, directory)));
  const targetSet = new Set(targets);
  const protectedPaths = new Set(manifest.pngs.map((entry) => entry.canonical));
  const originals = new Map();
  const pngs = action === "archive-json" ? [] : files(path.join(root, "docs/05-validation/tasks")).filter((filename) => filename.endsWith(".png")).sort((first, second) => Number(targetSet.has(first)) - Number(targetSet.has(second)));
  if (action === "archive-json") manifest.scope = "Current QA evidence and explicitly selected historical AX/executed-plan JSON: exact lossless gzip; existing PNG aliases remain byte-identical; no product or receipt edits";
  let saved = 0;
  for (const filename of pngs) {
    const bytes = fs.readFileSync(filename);
    const hash = digest(bytes);
    const canonical = originals.get(hash);
    if (canonical && targetSet.has(filename) && !protectedPaths.has(path.relative(root, filename))) {
      if (!bytes.equals(fs.readFileSync(canonical))) throw new Error("PNG bytes differ");
      manifest.pngs.push({ path: path.relative(root, filename), canonical: path.relative(root, canonical), sha256: hash, bytes: bytes.length });
      saved += bytes.length;
    } else if (!canonical) originals.set(hash, filename);
  }
  for (const filename of targets.filter((filename) => /(?:accessibility-\d+|executed-plan)\.json$/.test(filename))) {
    const bytes = fs.readFileSync(filename);
    const encoded = zlib.gzipSync(bytes);
    if (!zlib.gunzipSync(encoded).equals(bytes)) throw new Error("JSON bytes differ");
    fs.writeFileSync(filename + ".gz", encoded);
    manifest.gzip.push({ path: path.relative(root, filename), archive: path.relative(root, filename) + ".gz", sha256: digest(bytes), bytes: bytes.length });
    saved += bytes.length - encoded.length;
  }
  manifest.directories = [...new Set([...manifest.directories, ...directories])];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  for (const entry of [...manifest.pngs, ...manifest.gzip]) if (fs.existsSync(path.join(root, entry.path))) fs.unlinkSync(path.join(root, entry.path));
  console.log(JSON.stringify({ saved, pngs: manifest.pngs.length, gzip: manifest.gzip.length }));
} else if (action === "verify" || action === "restore") {
  for (const entry of [...manifest.pngs, ...manifest.gzip]) {
    const bytes = entry.canonical ? fs.readFileSync(path.join(root, entry.canonical)) : zlib.gunzipSync(fs.readFileSync(path.join(root, entry.archive)));
    if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) throw new Error("Evidence changed");
    if (action === "restore") {
      const target = path.join(root, entry.path);
      if (fs.existsSync(target) && !fs.readFileSync(target).equals(bytes)) throw new Error("Refuse different evidence overwrite");
      fs.writeFileSync(target, bytes);
    }
  }
  console.log(`${action}: ${manifest.pngs.length} PNGs and ${manifest.gzip.length} JSON byte hashes and lengths passed`);
} else throw new Error("Use archive or archive-json <evidence-directory>, verify or restore");
