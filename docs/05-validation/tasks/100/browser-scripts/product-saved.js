() => {
  const saved = JSON.parse(localStorage.getItem("page-between-reading-list"));
  const target = saved.find((book) => book.title === "梅西传");
  if (target.bookInfo.summary !== "这是我自己写的简介。" || target.bookInfo.fieldOrigins.summary !== "manual" || target.read !== true || target.unknown.nested[0] !== 7) throw new Error("Saved metadata or legacy values differ");
  if (target.bookInfo.catalogueLink.verification !== "verified") throw new Error("Missing adopted origin");
  if (!saved.some((book) => book.title === "屯堡" && book.read === false)) throw new Error("Recommendation not saved unread");
  return { summaryOrigin: "manual", legacyPreserved: true, addedUnread: true };
}
