() => {
  const clickNamed = (name) => {
    const button = [...document.querySelectorAll('#book-list button')].find((node) => node.getAttribute('aria-label') === name || node.textContent === name);
    if (!button) throw new Error(`Missing ${name}`);
    button.click();
  };
  const before = localStorage.getItem('issue-100-prototype-books');
  clickNamed('查看《同名示例》补全建议');
  if (document.querySelectorAll('#book-list .candidate').length !== 2) throw new Error('Ambiguous candidates missing');
  if (localStorage.getItem('issue-100-prototype-books') !== before) throw new Error('View silently saved candidate');
  clickNamed('关闭建议');
  if (localStorage.getItem('issue-100-prototype-books') !== before) throw new Error('Reject candidate wrote storage');
  clickNamed('查看《旧书示例》补全建议');
  if (!document.querySelector('#book-list').textContent.includes('没有匹配候选')) throw new Error('No match state missing');
  clickNamed('关闭建议');
  clickNamed('查看《梅西传》补全建议');
  clickNamed('确认采用[阿根廷] 塞尔吉奥·莱文斯基的候选');
  const books = JSON.parse(localStorage.getItem('issue-100-prototype-books'));
  const book = books.find((entry) => entry.title === '梅西传');
  if (book.bookInfo.summary !== '这是我自己写的简介。' || !book.bookInfo.types.includes('仙侠')) throw new Error('Candidate overwrote manual information');
  const adoptedBefore = localStorage.getItem('issue-100-prototype-books');
  clickNamed('查看《梅西传》补全建议');
  clickNamed('确认采用[阿根廷] 塞尔吉奥·莱文斯基的候选');
  if (localStorage.getItem('issue-100-prototype-books') !== adoptedBefore) throw new Error('No gaps should be no-op');
  clickNamed('关闭建议');
  return { ambiguous: 2, viewAndRejectNoWrite: true, noMatch: true, manualPreserved: true, noGapsNoWrite: true };
}
