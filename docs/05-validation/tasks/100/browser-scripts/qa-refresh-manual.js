async () => {
  const privateBefore = localStorage.getItem("page-between-reading-list");
  const catalogue = JSON.parse(localStorage.getItem("page-between-recommendations-v1"));
  catalogue.records[0].summary = "QA更新后的公共推荐简介";
  const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);
  delete catalogue.revision;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(catalogue)));
  catalogue.revision = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const original = window.fetch;
  try {
    window.fetch = async () => new Response(JSON.stringify(catalogue), { status: 200, headers: { "Content-Type": "application/json" } });
    document.querySelector("#recommend-retry").click();
    for (let attempt = 0; attempt < 50 && !document.querySelector("#recommend-records").textContent.includes("QA更新后的公共推荐简介"); attempt += 1) await new Promise((resolve) => setTimeout(resolve, 20));
    if (!document.querySelector("#recommend-records").textContent.includes("QA更新后的公共推荐简介")) throw new Error("Public update did not render");
    if (localStorage.getItem("page-between-reading-list") !== privateBefore) throw new Error("Public update overwrote manual snapshot");
    const saved = JSON.parse(privateBefore);
    if (saved[0].bookInfo.summary !== "QA人工简介不能被更新覆盖" || saved[0].bookInfo.types[0] !== "仙侠" || !saved[0].read || saved[0].unknown.keep !== 100) throw new Error("Private values changed");
    return { publicUpdated: true, manualSnapshotUnchanged: true, privateRawBytesUnchanged: true };
  } finally { window.fetch = original; }
}
