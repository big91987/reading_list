async () => {
  const catalogue = JSON.parse(localStorage.getItem("page-between-recommendations-v1"));
  catalogue.records = [catalogue.records[0]];
  const record = catalogue.records[0];
  record.title = "MIXED";
  record.id = "d".repeat(64);
  const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);
  delete catalogue.revision;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(catalogue)));
  catalogue.revision = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  localStorage.setItem("page-between-recommendations-v1", JSON.stringify(catalogue));
  localStorage.setItem("page-between-reading-list", JSON.stringify([
    { title: "  mIxEd  ", read: true, unknown: { keep: 100 }, bookInfo: { schemaVersion: 1, types: ["仙侠"], summary: "QA人工简介不能被更新覆盖", author: record.author, edition: null, fieldOrigins: { types: "manual", summary: "manual", author: "catalogue" }, catalogueLink: { recordId: record.id, titleAtAdoption: "  mIxEd  ", verification: "verified", origins: record.origins } } },
    { title: "其他未读书", read: false }
  ]));
  return { syntheticTitle: record.title, existingTitle: "  mIxEd  ", existingRead: true, manualSummary: true };
}
