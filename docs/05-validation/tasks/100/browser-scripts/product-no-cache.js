async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (!document.querySelector("#recommend-status").textContent.includes("推荐加载失败；我的书单仍可使用，请重试。")) throw new Error("No-cache failure not distinct");
  if (localStorage.getItem("page-between-reading-list") !== null) throw new Error("Viewing failure created private list");
  return {failureWithoutCache:true, privateKeyAbsent:true};
}
