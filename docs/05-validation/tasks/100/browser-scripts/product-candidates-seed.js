async () => {
  const value = JSON.parse(localStorage.getItem("page-between-recommendations-v1"));
  const base = value.records.find((record) => record.title === "梅西传");
  value.records = [
    {...structuredClone(base),id:"a".repeat(64),title:"歧义书",author:"作者甲",edition:"第一版",summary:"第一候选的测试简介"},
    {...structuredClone(base),id:"b".repeat(64),title:"歧义书",author:"作者乙",edition:"第二版",summary:"第二候选的测试简介"},
    {...structuredClone(base),id:"c".repeat(64),title:"完整人工书",author:"作者甲",edition:"第一版",summary:"候选不能覆盖人工简介"}
  ];
  const canonical = (input) => Array.isArray(input) ? `[${input.map(canonical).join(",")}]` : input && typeof input === "object" ? `{${Object.keys(input).sort().map((key) => `${JSON.stringify(key)}:${canonical(input[key])}`).join(",")}}` : JSON.stringify(input);
  delete value.revision;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(value)));
  value.revision = [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2,"0")).join("");
  localStorage.setItem("page-between-recommendations-v1", JSON.stringify(value));
  const privateBooks = [
    {title:"歧义书",read:false,unknown:{order:7}},
    {title:"没有候选",read:true},
    {title:"完整人工书",read:false,bookInfo:{schemaVersion:1,types:["古典文学"],summary:"人工简介保留",author:"人工作者",edition:"人工版次",extra:{keep:9},fieldOrigins:{types:"manual",summary:"manual",author:"manual",edition:"manual"}}},
    {title:"命名空间冲突",read:false,bookInfo:null}
  ];
  localStorage.setItem("page-between-reading-list", JSON.stringify(privateBooks));
  return {fixture:"isolated synthetic ambiguous editions and manual legacy values",candidateCount:2};
}
