const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../../..");
const manifestPath = path.join(__dirname, "qa-evidence-aliases.json");
const digest = (data) => crypto.createHash("sha256").update(data).digest("hex");
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const filename = path.join(directory, item.name);
    return item.isDirectory() ? files(filename) : [filename];
  });
}
const action = process.argv[2];
if (action === "archive") {
  const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")).files : [];
  const originals = new Map();
  const entries = [];
  const isQA = (filename) => filename.includes("/100/browser/qa-") || filename.includes("/100/delivery-checks/");
  const pngs = files(path.join(root, "docs/05-validation/tasks"))
    .filter((filename) => filename.endsWith(".png"))
    .sort((first, second) => Number(isQA(first)) - Number(isQA(second)));
  for (const filename of pngs) {
    const data = fs.readFileSync(filename);
    const sha256 = digest(data);
    const canonical = originals.get(sha256);
    if (canonical && isQA(filename)) {
      if (!data.equals(fs.readFileSync(canonical))) throw new Error("Bytes differ");
      entries.push({ path: path.relative(root, filename), canonical: path.relative(root, canonical), sha256, bytes: data.length });
    } else if (!canonical) originals.set(sha256, filename);
  }
  fs.writeFileSync(manifestPath, JSON.stringify({ scope: "Only independently generated QA and current verify byte-identical PNGs; receipts unchanged; all unique bytes retained", files: [...previous, ...entries] }, null, 2) + "\n");
  for (const entry of entries) fs.unlinkSync(path.join(root, entry.path));
  console.log(JSON.stringify({ archived: entries.length, saved: entries.reduce((sum, entry) => sum + entry.bytes, 0) }));
} else if (action === "verify" || action === "restore") {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const entry of manifest.files) {
    const data = fs.readFileSync(path.join(root, entry.canonical));
    if (digest(data) !== entry.sha256 || data.length !== entry.bytes) throw new Error("Evidence changed");
    if (action === "restore") {
      const target = path.join(root, entry.path);
      if (fs.existsSync(target) && !data.equals(fs.readFileSync(target))) throw new Error("Refuse conflicting restore");
      fs.writeFileSync(target, data);
    }
  }
  console.log(`${action}: ${manifest.files.length} original QA image hashes and lengths passed`);
} else throw new Error("Use archive, verify or restore");
