# Issue 76 产品检查复现

产品无新增测试入口或调试 API。此目录在注册浏览器隔离上下文运行真实 app HTML/JS/CSS；临时入口结束后必须恢复。复用并扩展 #71 的18组事务/编辑断言，共26组。JSON 报告内 legacy71ac 表示原测试来源，不代替本轮 AC 追溯；详见 [验证](../validation.md)。

1. 正式产品：注册 check，root `app`、plan `tests/browser/core.json` 和 `docs/05-validation/tasks/76/browser-plan.json`；再运行同目录 flow-320/390/768、keyboard、visual 四计划。
2. 集成夹具：从仓库根执行 `node docs/05-validation/tasks/76/tests/stage-fixture.cjs prepare`；注册 check(root=`app`, plan=`docs/05-validation/tasks/76/browser-integration-plan.json`)。即使检查失败，也执行同脚本 `restore`；确认 app 无临时测试文件。
3. 失败截图：同脚本 `prepare-fault`，注册 check(root=`app`, plan=`docs/05-validation/tasks/76/browser-failure-plan.json`)，最后 `restore`。此入口初始化隔离测试记录并让真实 Storage.setItem 抛 QuotaExceededError；没有原型 failWrites 开关。完整失败前后快照/恢复重试由集成夹具断言。
4. 集成下载 `product-integration-76.json` 含记录、四宽度测量、时序/插值与 UA；注册工具将下载落到对应 browser/development-*/download-1.json。
5. `node docs/05-validation/tasks/76/tests/audit-evidence.cjs` 核验最终产品/测试哈希、core 字节一致、最终计划逐动作匹配、无临时入口、相对文档链接和截图清单。Runner 再执行用户提供的 verify.py 最终命令。

所有书名和故障只在测试夹具出现，不能复制到正式产品。测试 origin 为注册工具隔离的 HTTP 源；不声称 file 源跨浏览器存储或部署后数据已验收。没有构建依赖、新后端或容量承诺。
