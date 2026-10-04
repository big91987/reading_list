() => {
  const raw='[ { "title": "备份恢复中文书", "read": true, "unknown": {"nested":[1,2]} } ]';
  const parsed=JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every((book)=>typeof book.title==="string"&&typeof book.read==="boolean")) throw new Error("Invalid restore fixture");
  localStorage.setItem("page-between-reading-list",raw);
  if (localStorage.getItem("page-between-reading-list")!==raw) throw new Error("Backup raw bytes not restored");
  return {restoreAtExistingStorageBoundary:true,rawWhitespaceAndUnknownFieldsPreserved:true};
}
