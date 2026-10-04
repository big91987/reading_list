const assert = require("node:assert/strict");

assert.throws(
  () => assert.equal(0, [], 0, "localStorage write attempts changed"),
  { name: "TypeError", code: "ERR_INVALID_ARG_TYPE" },
);
assert.equal(0, 0, "localStorage write attempts changed");
console.log("Reproduced shared-tool argument error even with zero writes; the expected three-argument equality succeeds.");
