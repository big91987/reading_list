() => {
  const saved = JSON.parse(localStorage.getItem("page-between-reading-list"));
  if (saved[0].bookInfo.author !== "作者乙" || saved[0].bookInfo.edition !== "第二版" || saved[0].unknown.order !== 7 || saved[0].read !== false) throw new Error("Wrong selected identity or legacy mutation");
  const manual = saved.find((book) => book.title === "完整人工书").bookInfo;
  if (manual.summary !== "人工简介保留" || manual.author !== "人工作者" || manual.edition !== "人工版次" || manual.extra.keep !== 9 || manual.types[0] !== "古典文学") throw new Error("Manual fields overwritten");
  if (saved[3].bookInfo !== null) throw new Error("Conflicting namespace overwritten");
  const focus = document.activeElement.getAttribute("aria-label");
  if (focus !== "查看《歧义书》补全建议") throw new Error(`Suggestion close focus differs: ${focus}`);
  return {selectedSecondEdition:true,manualFieldsIntact:true,unknownFieldsIntact:true,conflictingNullIntact:true,focus};
}
