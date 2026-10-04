() => {
  const select = document.querySelector('#type-filter');
  select.value = '仙侠';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  if (!document.querySelector('#recommend-empty').textContent.includes('暂无仙侠推荐')) throw new Error('Missing honest type empty state');
  select.value = '全部类型';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return { typeEmptyState: true, restored: true };
}
