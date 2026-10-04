() => {
  const container = document.querySelector('#book-list');
  if (!container.textContent.includes('<script>alert(1)</script>') || !container.textContent.includes('<img src=x onerror=alert(1)>')) throw new Error('External strings not shown as safe text');
  if (container.querySelector('script, img, a[href^="javascript:"]')) throw new Error('External data rendered executable DOM');
  if (!container.textContent.includes('来源链接不可用')) throw new Error('Unsafe URL not rejected');
  if (localStorage.getItem('page-between-reading-list') !== '[{"title":"真实书单隔离标记","read":true}]') throw new Error('Real product storage changed');
  return { textOnly: true, unsafeLinkRejected: true, actualProductKeyUnchanged: true };
}
