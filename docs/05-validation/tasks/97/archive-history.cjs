const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const taskRoot = __dirname;
const browserRoot = path.join(taskRoot, "browser");
const archiveRoot = path.join(taskRoot, "browser-archive");
const manifestPath = path.join(archiveRoot, "manifest.json");
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

function readArchived(manifest, relativePath) {
  const entry = manifest.files[relativePath];
  assert.ok(entry, "Screenshot is not in the historical archive");
  const pack = fs.readFileSync(path.join(archiveRoot, entry.pack));
  assert.equal(digest(pack), manifest.packs[entry.pack]);
  const assets = JSON.parse(zlib.gunzipSync(pack));
  const bytes = Buffer.from(assets[entry.sha256], "base64");
  assert.equal(digest(bytes), entry.sha256);
  assert.equal(bytes.length, entry.bytes);
  return bytes;
}

if (process.argv[2] === "restore") {
  const relativePath = process.argv[3];
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  const bytes = readArchived(manifest, relativePath);
  const destination = path.resolve(taskRoot, relativePath);
  assert.ok(destination.startsWith(`${browserRoot}${path.sep}`));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (fs.existsSync(destination)) assert.ok(fs.readFileSync(destination).equals(bytes));
  else fs.writeFileSync(destination, bytes);
  console.log(`Restored original screenshot bytes: ${relativePath}`);
} else if (process.argv[2] === "verify") {
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  for (const relativePath of Object.keys(manifest.files)) readArchived(manifest, relativePath);
  console.log(`Verified ${Object.keys(manifest.files).length} original screenshot hashes`);
} else if (process.argv[2] === "archive") {
  assert.ok(!fs.existsSync(manifestPath), "Historical archive already exists");
  const directories = fs.readdirSync(browserRoot).filter((name) =>
    /^design-1-\d+$/.test(name) || /^development-1-(?:[1-9]|1[0-6])$/.test(name),
  );
  const assets = new Map();
  const originals = [];
  for (const directory of directories) {
    for (const filename of fs.readdirSync(path.join(browserRoot, directory)).filter((name) => name.endsWith(".png"))) {
      const relativePath = `browser/${directory}/${filename}`;
      const bytes = fs.readFileSync(path.join(taskRoot, relativePath));
      const sha256 = digest(bytes);
      assets.set(sha256, bytes);
      originals.push({ relativePath, sha256, bytes: bytes.length });
    }
  }
  fs.mkdirSync(archiveRoot, { recursive: true });
  const manifest = { format: "sha256-deduplicated-original-png-v1", files: {}, packs: {} };
  const packByHash = new Map();
  let batch = {};
  let batchBytes = 0;
  let sequence = 0;
  function savePack() {
    if (!batchBytes) return;
    const filename = `pack-${String(++sequence).padStart(3, "0")}.json.gz`;
    const bytes = zlib.gzipSync(Buffer.from(JSON.stringify(batch)));
    assert.ok(bytes.length < 1900000, "Archive pack exceeds file import limit");
    fs.writeFileSync(path.join(archiveRoot, filename), bytes);
    manifest.packs[filename] = digest(bytes);
    for (const sha256 of Object.keys(batch)) packByHash.set(sha256, filename);
    batch = {};
    batchBytes = 0;
  }
  for (const [sha256, bytes] of assets) {
    if (batchBytes && batchBytes + bytes.length > 1200000) savePack();
    batch[sha256] = bytes.toString("base64");
    batchBytes += bytes.length;
  }
  savePack();
  for (const entry of originals) {
    manifest.files[entry.relativePath] = { sha256: entry.sha256, bytes: entry.bytes, pack: packByHash.get(entry.sha256) };
    assert.ok(readArchived(manifest, entry.relativePath).equals(fs.readFileSync(path.join(taskRoot, entry.relativePath))));
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  for (const entry of originals) fs.unlinkSync(path.join(taskRoot, entry.relativePath));
  console.log(`Archived ${originals.length} historical PNG paths as ${assets.size} unique original images in ${sequence} bounded packs; receipts unchanged`);
} else {
  throw new Error("Use archive, verify, or restore <manifest-relative PNG path>");
}
