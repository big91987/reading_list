() => {
  const privateBefore = localStorage.getItem("page-between-reading-list");
  const catalogue = JSON.parse(localStorage.getItem("page-between-recommendations-v1"));
  const filter = document.querySelector("#recommend-type");
  const results = [];
  for (const kind of ["现当代文学", "历史社科", "科普", "仙侠", "古典文学", ""]) {
    filter.value = kind;
    filter.dispatchEvent(new Event("change", { bubbles: true }));
    const expected = catalogue.records.filter((record) => !kind || record.types.includes(kind));
    const cards = [...document.querySelectorAll(".recommend-card")];
    if (cards.length !== expected.length) throw new Error(`Filter count ${kind}: ${cards.length}/${expected.length}`);
    for (const [index, card] of cards.entries()) {
      const record = expected[index];
      if (card.querySelector("h3").textContent !== record.title || !card.textContent.includes(record.summary)) throw new Error("Missing full recommendation information");
      for (const anchor of card.querySelectorAll("a")) {
        if (!record.origins.some((origin) => origin.url === anchor.href) || anchor.target !== "_blank" || !anchor.rel.includes("noopener")) throw new Error("Incorrect concrete source navigation");
      }
    }
    if (!expected.length && !document.querySelector("#recommend-records").textContent.includes("这个类型暂无推荐。")) throw new Error("Missing empty-type explanation");
    results.push({ kind: kind || "全部", count: cards.length });
  }
  if (localStorage.getItem("page-between-reading-list") !== privateBefore) throw new Error("Catalogue browsing wrote private data");
  return { results, sourceAnchorsChecked: true, fullSummariesPresent: true, privateOriginalPreserved: true };
}
