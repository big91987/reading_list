() => {
  const title = document.querySelector('h1');
  if (!title || !title.textContent.includes('页间')) throw new Error('Existing product heading missing');
  return { heading: title.textContent, width: window.innerWidth, note: 'Capability probe only; not recommendation acceptance' };
}
