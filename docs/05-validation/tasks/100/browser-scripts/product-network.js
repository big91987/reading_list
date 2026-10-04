async () => {
  const privateBefore = localStorage.getItem("page-between-reading-list");
  const cacheBefore = JSON.parse(localStorage.getItem("page-between-recommendations-v1"));
  const originalFetch = window.fetch;
  const calls = [];
  const sign = async (value) => {
    const canonical = (input) => Array.isArray(input) ? `[${input.map(canonical).join(",")}]` : input && typeof input === "object" ? `{${Object.keys(input).sort().map((key) => `${JSON.stringify(key)}:${canonical(input[key])}`).join(",")}}` : JSON.stringify(input);
    delete value.revision;
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(value)));
    value.revision = [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return value;
  };
  const read = async (value, status = 200) => {
    window.fetch = async (url, options) => {
      calls.push({url, credentials: options.credentials});
      return new Response(typeof value === "string" ? value : JSON.stringify(value), {status, headers: {"Content-Type":"application/json"}});
    };
    document.querySelector("#recommend-retry").click();
    await new Promise((resolve) => setTimeout(resolve, 100));
    return document.querySelector("#recommend-status").textContent;
  };
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  try {
    const empty = await sign({...structuredClone(cacheBefore), records: []});
    assert((await read(empty)).includes("当前推荐目录为空。"), "Valid empty confused with failure");
    const partial = structuredClone(cacheBefore);
    partial.status = "partial";
    partial.sources[1].status = "failed";
    partial.sources[1].errorCode = "network";
    partial.sources[1].lastSuccessAt = "2026-09-01T00:00:00Z";
    await sign(partial);
    const status = await read(partial);
    assert(status.includes("部分来源失败") && status.includes("目录已过期"), "Partial/stale states not composable");
    const prior = localStorage.getItem("page-between-recommendations-v1");
    assert((await read({...partial,schemaVersion:2})).includes("推荐更新失败，显示上次缓存。"), "Unsupported version not rejected");
    assert(localStorage.getItem("page-between-recommendations-v1") === prior, "Bad schema overwrote cache");
    assert((await read("x".repeat(1048577))).includes("推荐更新失败"), "Oversize not rejected");
    assert(localStorage.getItem("page-between-recommendations-v1") === prior, "Oversize overwrote cache");
    const malicious = structuredClone(cacheBefore);
    malicious.records[0].origins[0].url = "javascript:alert(1)";
    await sign(malicious);
    await read(malicious);
    assert(localStorage.getItem("page-between-recommendations-v1") === prior, "Unsafe origin accepted");
    const safeText = structuredClone(cacheBefore);
    safeText.records[0].summary = '<img src=x onerror="window.__executed=true">测试文本';
    await sign(safeText);
    await read(safeText);
    assert(!document.querySelector("#recommend-records img") && !window.__executed, "HTML interpreted");
    assert(document.querySelector("#recommend-records").textContent.includes("<img src=x"), "Safe text missing");
    await read(await sign(structuredClone(cacheBefore)));
    assert(calls.every((call) => call.url === "/__recommendations/catalogue.json" && call.credentials === "omit"), "Request carried private data or used relative route");
    assert(localStorage.getItem("page-between-reading-list") === privateBefore, "Network/display wrote private list");
    return {validEmpty:true, partialAndStale:true, unsupportedAndOversizeRejected:true, unsafeOriginRejected:true, HTMLIsText:true, privateZeroWrite:true, requests:calls};
  } finally { window.fetch = originalFetch; }
}
