# 读书清单项目现状

本仓库只开发读书清单产品；Harness 工具在上游 `he_skeleton` 迭代，业务仓库通过固定提交同步。

## 已有行为

- `app/index.html`、`app/app.js`、`app/styles.css` 为现有浏览器应用。
- 支持添加书名、标记已读、全部/已读/未读筛选及删除。
- 数据存于浏览器 localStorage，键为 `page-between-reading-list`；不存在服务端数据库或账号体系。
- 空书名被拒绝；不区分大小写的重复书名被拒绝。
- 当前代码没有书名检索功能。新需求必须在 Issue 中定义并保留既有行为。

## 约束与验证

保持当前产品形态和已存在的本地数据格式，除非任务明确要求并说明迁移方案。

`.harness/reading-core.json` 是 Owner 固定的既有用户主线回归：添加两本书、标记已读、刷新保留、状态筛选、删除。`.harness/full.json` 使用原有 `harness/browser.cjs` 执行这组真实浏览器动作。它不是所有新功能的完整验收；每个新任务还应补充对应 AC 和验证。

任务 PRD、设计和计划见 `../04-implementation/tasks/<issue>/`，实际验证范围见 `../05-validation/tasks/<issue>/`。完整 Workflow 独立于原 `/harness` 流程，见 `../harness-full.md`。
