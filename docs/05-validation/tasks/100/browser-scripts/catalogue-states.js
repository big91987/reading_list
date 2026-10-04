() => {
  const storageBefore = localStorage.getItem('issue-100-prototype-books');
  const scenario = document.querySelector('#scenario');
  const expected = { loading: '加载中', empty: '读取成功', stale: '已过期', partial: '部分来源失败', 'failed-cache': '显示最后成功缓存', 'failed-none': '没有可用缓存', ok: '2个官方组织' };
  const observed = [];
  for (const [value, text] of Object.entries(expected)) {
    scenario.value = value;
    scenario.dispatchEvent(new Event('change', { bubbles: true }));
    if (!document.querySelector('#catalogue-status').textContent.includes(text)) throw new Error(`Status missing: ${value}`);
    const count = document.querySelectorAll('#recommend-list article').length;
    if (count !== (['loading', 'empty', 'failed-none'].includes(value) ? 0 : 6)) throw new Error(`Wrong records for ${value}`);
    observed.push({ value, count });
  }
  if (localStorage.getItem('issue-100-prototype-books') !== storageBefore) throw new Error('Scenario changed private list');
  return { observed, privateStorageUnchanged: true, note: 'UI scenario checks, not collector/backend proof' };
}
