const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "../../../../..");
const app = path.join(root, "app");
const product = path.join(app, "index.html");
const backup = path.join(app, "product-under-test-76.html");
const testScript = path.join(app, "browser-tests-76.js");
const action = process.argv[2];
const boot = path.join(app, "test-boot-76.js");
const instrumented = path.join(app, "instrumented-76.html");

function digest(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

if (action === "prepare" || action === "prepare-fault") {
  if (fs.existsSync(backup) || fs.existsSync(testScript)) {
    throw new Error("Existing fixture must be restored before preparing again");
  }
  fs.copyFileSync(product, backup, fs.constants.COPYFILE_EXCL);
  fs.writeFileSync(
    instrumented,
    fs
      .readFileSync(product, "utf8")
      .replace(
        '<script src="app.js">',
        '<script src="test-boot-76.js"></script><script src="app.js">',
      ),
  );
  fs.copyFileSync(path.join(__dirname, "test-boot.js"), boot);
  fs.copyFileSync(path.join(__dirname, "browser-tests.js"), testScript);
  if (action === "prepare-fault") {
    fs.writeFileSync(
      product,
      fs
        .readFileSync(instrumented, "utf8")
        .replace('src="test-boot-76.js"', 'src="test-boot-76.js?mode=fault"'),
    );
  } else {
    fs.copyFileSync(path.join(__dirname, "fixture.html"), product);
  }
  console.log(
    JSON.stringify(
      {
        fixture: "temporary app/index.html, restored after registered check",
        product: {
          html: digest(backup),
          javascript: digest(path.join(app, "app.js")),
          css: digest(path.join(app, "styles.css")),
        },
        tests: {
          html: digest(path.join(__dirname, "fixture.html")),
          javascript: digest(path.join(__dirname, "browser-tests.js")),
        },
      },
      null,
      2,
    ),
  );
} else if (action === "restore") {
  if (!fs.existsSync(backup)) throw new Error("No fixture backup to restore");
  const faultEntry = fs
    .readFileSync(instrumented, "utf8")
    .replace('src="test-boot-76.js"', 'src="test-boot-76.js?mode=fault"');
  if (
    digest(product) !== digest(path.join(__dirname, "fixture.html")) &&
    fs.readFileSync(product, "utf8") !== faultEntry
  ) {
    throw new Error(
      "Fixture entry changed; refusing to overwrite unknown edits",
    );
  }
  fs.copyFileSync(backup, product);
  fs.unlinkSync(backup);
  fs.unlinkSync(testScript);
  fs.unlinkSync(boot);
  fs.unlinkSync(instrumented);
  console.log("Product index restored; temporary test files removed");
} else {
  throw new Error("Use prepare or restore");
}
