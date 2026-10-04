() => {
  const books = JSON.parse(localStorage.getItem('issue-100-prototype-books'));
  const matched = books.find((book) => book.title === '梅西传');
  if (!matched.bookInfo?.summary || matched.bookInfo.catalogueLink.verification !== 'verified') throw new Error('Single candidate was not adopted');
  const select = document.querySelector('#scenario');
  select.value = 'failed-none';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return { candidateAdopted: true, nextScenario: 'failed-none' };
}
