async () => {
  const privateBefore = localStorage.getItem("page-between-reading-list");
  const publicBefore = localStorage.getItem("page-between-recommendations-v1");
  const originalFetch = window.fetch;
  try {
    window.fetch = async () => new Response(publicBefore, {status:200,headers:{"Content-Type":"application/json"}});
    document.querySelector("#recommend-retry").click();
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (!document.querySelector("#recommend-status").textContent.includes("推荐缓存未保存，书单仍可使用。")) throw new Error("Missing cache write failure message");
    if (localStorage.getItem("page-between-reading-list") !== privateBefore || localStorage.getItem("page-between-recommendations-v1") !== publicBefore) throw new Error("Cache failure corrupted storage");
    return {cacheFailureVisible:true, bothOriginalsIntact:true};
  } finally { window.fetch = originalFetch; }
}
