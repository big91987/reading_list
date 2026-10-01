# Issue #74 LLD

基线：A-001、[HLD](hld.md)、[contracts](contracts.md)和批准的交互原型；不改变已批准决定。

## 最小变更边界

当前缺口是三个按钮没有数量，行为责任位于 `app/app.js` 的 `render()`。修改 `app/index.html` 为既有按钮各增加一个 `.filter-count`；`render()` 复用摘要的 `readCount`，计算 `{all: books.length, unread: books.length-readCount, read: readCount}` 并逐个更新 span.textContent；`app/styles.css` 增加等宽数字、44px最小高度、不拆按钮文字及容器换行。按钮本身不替换，监听、焦点、aria-pressed和空态保持原代码。

不调整 loadBooks/persist/命令处理器，不新增搜索、测试入口、依赖、存储字段、后台或迁移；不移植原型演示控制。无本地重构。render 的计数输入是完整有效 books 而非 visibleBooks；同一次同步渲染更新按钮与摘要，不缓存、不手动增减。

## 执行与兼容

- `render(): void`：无额外写入，重复渲染结果相同；all=read+unread。
- `persist(candidate): boolean`：沿用先写入后替换；失败不触发新集合渲染，因此按钮数不变。
- `loadBooks(): Book[]`：沿用JSON解析和title/read有效性过滤；只按有效集合计数，不修复原始存储。
- DOM顺序 all/unread/read；初始0随加载render更新；可访问名称含可见数字，无额外live-region。
- 320px四位数在必要时整按钮换行，数值精确、不截断。所有断点继承原有规则。

## 验证细化

真实产品动作验证新增、双向状态、两类删除后逐步刷新；零分类和筛选不改全量计数。浏览器集成夹具加载原产品HTML/JS/CSS，注入旧/坏/部分无效数据和Storage.setItem异常，比较内存/持久化/DOM快照，检查恢复后只计一次及编辑兼容。夹具只临时挂在允许的app根，结束恢复并校验源哈希，不成为产品入口。真实键盘计划及视口测量覆盖按钮名称、focus、aria-pressed、高度/越界/换行；物理触摸和读屏明确待人工验收。

回退只撤销三个产品文件的计数展示变更；原JSON无迁移，旧代码仍可读取。

验证维护：历史Owner `.harness/reading-core.json` 精确匹配旧名称，同步曾被工具保护拒绝，已撤销。用户本轮明确告知接入示例已修复产品回归计划归属，并授权迁移到 `tests/browser/core.json`：保留原16个业务动作和断言，仅将三个定位改为已读1/未读1/全部2（各名称与数字间一个空格）。本地核实新版verify.py优先选择该非空产品计划，仅不存在才回退旧计划。旧文件及受保护配置保持不变，任务副本仅保留历史证据。真实注册check对新核心计划和功能计划已通过（18/19）；普通沙箱端口限制不等同MCP失败，也不替代Runner正式环境独立复验。
