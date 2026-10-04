const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const root = path.resolve(__dirname, "../../../..");
const manifestPath = path.join(__dirname, "development-rework/ax-archives.json");
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const action = process.argv[2];
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : { scope: "Lossless development AX packaging; all original bytes recoverable; receipts unchanged", files: [] };
if (action === "archive-png") {
  manifest.pngFiles ||= [];
  const protectedPaths = new Set(manifest.pngFiles.map((entry) => entry.canonical));
  const directories = fs.readdirSync(path.join(__dirname, "browser"));
  const candidates = directories.flatMap((directory) => fs.readdirSync(path.join(__dirname, "browser", directory)).filter((name) => name.endsWith(".png")).map((name) => path.join(__dirname, "browser", directory, name)));
  const current = (filename) => Number(path.basename(path.dirname(filename)).match(/^development-1-(\d+)$/)?.[1] || 0) >= 21;
  candidates.sort((first, second) => Number(current(first)) - Number(current(second)));
  const originals = new Map();
  let saved = 0;
  for (const filename of candidates) {
    const bytes = fs.readFileSync(filename);
    const sha256 = digest(bytes);
    const canonical = originals.get(sha256);
    if (canonical && current(filename) && !protectedPaths.has(path.relative(root, filename))) {
      if (!fs.readFileSync(canonical).equals(bytes)) throw new Error("PNG bytes changed");
      manifest.pngFiles.push({ path: path.relative(root, filename), canonical: path.relative(root, canonical), sha256, bytes: bytes.length });
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
      fs.unlinkSync(filename);
      saved += bytes.length;
    } else if (!canonical) originals.set(sha256, filename);
  }
  console.log(JSON.stringify({ saved, pngTotal: manifest.pngFiles.length }));
} else if (action === "archive") {
  let saved = 0;
  for (const directory of fs.readdirSync(path.join(__dirname, "browser"))) {
    if (!directory.startsWith("development-")) continue;
    for (const name of fs.readdirSync(path.join(__dirname, "browser", directory))) {
      if (!/^accessibility-\d+\.json$/.test(name)) continue;
      const filename = path.join(__dirname, "browser", directory, name);
      const bytes = fs.readFileSync(filename);
      const archive = filename + ".gz";
      const encoded = zlib.gzipSync(bytes);
      if (!zlib.gunzipSync(encoded).equals(bytes)) throw new Error("AX bytes changed");
      const previous = manifest.files.find((entry) => entry.path === path.relative(root, filename));
      if (previous && previous.sha256 !== digest(bytes)) throw new Error("Refuse changed evidence");
      fs.writeFileSync(archive, encoded);
      if (!previous) manifest.files.push({ path: path.relative(root, filename), archive: path.relative(root, archive), bytes: bytes.length, sha256: digest(bytes) });
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
      fs.unlinkSync(filename);
      saved += bytes.length - encoded.length;
    }
  }
  console.log(JSON.stringify({ saved, archivedTotal: manifest.files.length }));
} else if (action === "verify" || action === "restore") {
  for (const entry of manifest.pngFiles || []) {
    const bytes = fs.readFileSync(path.join(root, entry.canonical));
    if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) throw new Error("PNG evidence changed");
    if (action === "restore") {
      const target = path.join(root, entry.path);
      if (fs.existsSync(target) && !fs.readFileSync(target).equals(bytes)) throw new Error("Refuse conflicting PNG restore");
      fs.writeFileSync(target, bytes);
    }
  }
  for (const entry of manifest.files) {
    const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, entry.archive)));
    if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) throw new Error("AX evidence changed");
    if (action === "restore") {
      const target = path.join(root, entry.path);
      if (fs.existsSync(target) && !fs.readFileSync(target).equals(bytes)) throw new Error("Refuse conflicting restore");
      fs.writeFileSync(target, bytes);
    }
  }
  console.log(`${action}: ${manifest.files.length} AX byte hashes and lengths passed`);
} else throw new Error("Use archive, archive-png, verify or restore");
