const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "../../../../..");
const app = path.join(root, "app");
const product = path.join(app, "index.html");
const backup = path.join(app, "product-under-test-74.html");
const testScript = path.join(app, "browser-tests-74.js");
const action = process.argv[2];

function digest(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

if (action === "prepare") {
  if (fs.existsSync(backup) || fs.existsSync(testScript)) {
    throw new Error("Existing fixture must be restored before preparing again");
  }
  fs.copyFileSync(product, backup, fs.constants.COPYFILE_EXCL);
  fs.copyFileSync(path.join(__dirname, "browser-tests.js"), testScript);
  fs.copyFileSync(path.join(__dirname, "fixture.html"), product);
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
  if (digest(product) !== digest(path.join(__dirname, "fixture.html"))) {
    throw new Error(
      "Fixture entry changed; refusing to overwrite unknown edits",
    );
  }
  fs.copyFileSync(backup, product);
  fs.unlinkSync(backup);
  fs.unlinkSync(testScript);
  console.log("Product index restored; temporary test files removed");
} else {
  throw new Error("Use prepare or restore");
}
