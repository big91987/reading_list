() => {
  const original=JSON.parse(localStorage.getItem("page-between-reading-list"));
  const newer=[...original,{title:"其他标签页的新书",read:false,unknown:{owner:"external"}}];
  const changed=JSON.stringify(newer);
  localStorage.setItem("page-between-reading-list",changed);
  document.querySelector(".information-form button[type=submit]").click();
  if (localStorage.getItem("page-between-reading-list") !== changed) throw new Error("Concurrent raw storage overwritten");
  if (document.querySelector(".information-form textarea").value !== "冲突时保留的草稿") throw new Error("Draft lost on conflict");
  if (!document.querySelector(".information-form .edit-error").textContent.includes("其他标签页冲突")) throw new Error("Missing conflict instruction");
  return {method:"external storage write injected at real Storage boundary, not physical multi-tab certification",externalSnapshotPreserved:true,draftPreserved:true};
}
