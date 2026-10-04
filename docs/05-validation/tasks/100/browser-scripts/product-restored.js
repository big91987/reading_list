() => {
  const saved = JSON.parse(localStorage.getItem("page-between-reading-list"));
  const target = saved[0];
  if (target.title !== "我的梅西传" || target.read !== true || target.unknown.nested[0] !== 7 || target.bookInfo.summary !== "这是我自己写的简介。") throw new Error("Undo did not restore full object and index");
  if (target.bookInfo.catalogueLink.verification !== "needs_review" || target.bookInfo.catalogueLink.titleAtAdoption !== "梅西传") throw new Error("Rename origin state differs");
  return { completeUndo: true, originalIndex: 0, renamedOriginPreserved: true };
}
