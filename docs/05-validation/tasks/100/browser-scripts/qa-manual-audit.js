() => {
  const books = JSON.parse(localStorage.getItem("page-between-reading-list"));
  if (books.length !== 2 || books[0].unknown.keep !== 100 || books[0].read !== true || books[0].title.length !== 80) throw new Error("Legacy book changed");
  const manual = books[1];
  if (manual.title !== "QA手动新增仙侠书" || manual.read !== false || manual.bookInfo.types.join("/") !== "古典文学/仙侠" || manual.bookInfo.summary !== "这是QA手动新增的简介。") throw new Error("Manual add metadata missing");
  if (manual.bookInfo.fieldOrigins.summary !== "manual") throw new Error("Manual summary provenance missing");
  const editor = document.querySelector(".information-form");
  const savedSummary = books[0].bookInfo.summary;
  if (savedSummary !== "长中文简介。".repeat(100) || !document.querySelector("#book-list").textContent.includes(savedSummary)) throw new Error("Long summary not fully rendered");
  if (editor) throw new Error("Editor did not close after save");
  return { manualTypesAndSummarySaved: true, legacyUnknownAndReadPreserved: true, legacyTitleLength: 80, summaryLength: savedSummary.length };
}
