() => {
  if (document.querySelector(".information-form")) throw new Error("Escape did not cancel editor");
  if (document.activeElement.getAttribute("aria-label") !== "编辑《屯堡》信息") throw new Error("Cancel did not restore edit action focus");
  const saved=JSON.parse(localStorage.getItem("page-between-reading-list"));
  if (saved.find((book)=>book.title==="屯堡").bookInfo.summary === "键盘未保存草稿") throw new Error("Cancel wrote draft");
  return {escapeCanceled:true,focusRestored:true,draftNotSaved:true};
}
