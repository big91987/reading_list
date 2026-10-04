() => {
  const filter = document.querySelector("#recommend-type");
  filter.value = "历史社科";
  filter.dispatchEvent(new Event("change", {bubbles:true}));
  const cards = [...document.querySelectorAll(".recommend-card")];
  if (cards.length !== 1 || !cards[0].textContent.includes("梅西传")) throw new Error("Showcase filter differs");
  return {showcaseType: "历史社科", count: cards.length, fullCatalogueAlreadyAsserted: true};
}
