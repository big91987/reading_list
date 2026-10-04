() => {
  const select = document.querySelector('#edit-types');
  for (const option of select.options) option.selected = option.value === '仙侠' || option.value === '古典文学';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return { selected: [...select.selectedOptions].map((option) => option.value) };
}
