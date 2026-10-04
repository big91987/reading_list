() => {
  const focused=document.activeElement;
  if (focused.id !== "recommend-type") throw new Error(`Tab did not focus type filter: ${focused.id}`);
  return {id:focused.id,value:focused.value,privateSectionsHidden:document.querySelector(".add-panel").getClientRects().length===0};
}
