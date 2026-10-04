() => {
  const summary = document.querySelector('#edit-summary');
  summary.value = '很长的中文简介，仍然应该可以完整读取与编辑。'.repeat(20);
  summary.dispatchEvent(new Event('input', { bubbles: true }));
  return { length: summary.value.length };
}
