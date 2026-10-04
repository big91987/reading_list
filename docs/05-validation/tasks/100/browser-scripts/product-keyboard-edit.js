() => {
  const button = document.querySelector("[aria-label='编辑《屯堡》信息']");
  button.focus();
  return {focus:document.activeElement.getAttribute("aria-label")};
}
