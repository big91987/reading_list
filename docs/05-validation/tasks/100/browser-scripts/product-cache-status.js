() => {
  const status = document.querySelector("#recommend-status").textContent;
  if (!status.includes("推荐更新失败，显示上次缓存。") || !status.includes("中国作家网") || !status.includes("福建省图书馆")) throw new Error(`Missing failure/cache/source status: ${status}`);
  return { cachedAfterHTTPFailure: true, status };
}
