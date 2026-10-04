() => {
  localStorage.setItem("page-between-reading-list", "{invalid old data");
  return { injected: "invalid JSON in isolated browser context" };
}
