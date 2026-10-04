() => {
  const origin = { organisation: '<img src=x onerror=alert(1)>', recommendationStatus: '恶意内容测试', sourceType: '其他', url: 'javascript:alert(1)', publishedAt: null, collectedAt: '2026-10-04T00:00:00Z' };
  localStorage.setItem('page-between-reading-list', '[{"title":"真实书单隔离标记","read":true}]');
  localStorage.setItem('issue-100-prototype-books', JSON.stringify([{ title: '<script>alert(1)</script>', read: true, extension: { untouched: true }, bookInfo: { schemaVersion: 1, types: ['其他'], summary: '<img src=x onerror=alert(1)>', catalogueLink: { verification: 'verified', origins: [origin] } } }]));
  return { seeded: true, note: 'This tool fixture writes before snapshot; application must not touch actual product key' };
}
