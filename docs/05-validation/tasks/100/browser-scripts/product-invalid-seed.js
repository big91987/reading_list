() => {
  localStorage.setItem("page-between-reading-list", '[{"title":"有效条目","read":true},null]');
  return {fixture:"invalid entry original must not be silently discarded by a write"};
}
