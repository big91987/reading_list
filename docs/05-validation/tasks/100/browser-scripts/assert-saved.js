() => {
  const books = JSON.parse(localStorage.getItem('issue-100-prototype-books'));
  const book = books.find((entry) => entry.title === '梅西传');
  if (!book || book.bookInfo.summary !== '这是我自己写的简介。' || !book.bookInfo.types.includes('仙侠')) throw new Error('Metadata did not persist');
  if (book.read !== false) throw new Error('Edit changed read state');
  return { summarySaved: true, types: book.bookInfo.types, read: book.read };
}
