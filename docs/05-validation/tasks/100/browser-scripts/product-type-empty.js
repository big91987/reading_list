() => {
  const privateBefore = localStorage.getItem("page-between-reading-list");
  const filter = document.querySelector("#recommend-type");
  for (const kind of ["古典文学", "仙侠"]) {
    filter.value = kind;
    filter.dispatchEvent(new Event("change", {bubbles:true}));
    if (document.querySelectorAll(".recommend-card").length || !document.querySelector("#recommend-records").textContent.includes("这个类型暂无推荐。")) throw new Error(`${kind} is not an honest empty state`);
  }
  if (localStorage.getItem("page-between-reading-list") !== privateBefore) throw new Error("Type browsing wrote private list");
  return {classicsEmpty:true, xianxiaEmpty:true, noPrivateWrite:true};
}
