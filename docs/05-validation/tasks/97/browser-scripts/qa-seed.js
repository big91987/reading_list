() => {
  const books = Array.from({ length: 30 }, (_, index) => ({
    title: index === 0 ? "旧中文已读书" : index === 1 ? "旧中文未读书" : `旧书第${index + 1}本`,
    read: index % 2 === 0,
    extension: { retained: true, ordinal: index },
  }));
  const raw = JSON.stringify(books, null, 2);
  localStorage.setItem("page-between-reading-list", raw);
  return { seededBooks: books.length, rawLength: raw.length };
}
