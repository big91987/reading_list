# 读书清单项目现状

本仓库只开发读书清单产品；Harness 工具在上游 `he_skeleton` 迭代，业务仓库通过固定提交同步。

## 已有行为

- `app/index.html`、`app/app.js`、`app/styles.css` 为现有浏览器应用。
- 支持添加书名、标记已读、全部/已读/未读筛选及删除。
- Issue #71 在原条目增加修改书名、保存/取消、全清单去重与存储失败重试；保留read、顺序和旧本地JSON格式。实际验收范围与人工缺口见 [任务验证](../05-validation/tasks/71/validation.md)，尚未合并主线。
- 数据存于浏览器 localStorage，键为 `page-between-reading-list`；不存在服务端数据库或账号体系。
- 空书名被拒绝；不区分大小写的重复书名被拒绝。
- 当前代码没有书名检索功能。新需求必须在 Issue 中定义并保留既有行为。
- Issue #76 当前工作区已实现批准的现代编辑式书房：侧栏概览/新增、响应式卡片网格、完整书名和常显操作，及有界可取消入场/筛选/新增反馈。存储与管理规则保持不变；[产品验证](../05-validation/tasks/76/validation.md)记录自动通过证据及人工缺口，尚未由Runner发布或合并。

## 约束与验证

保持当前产品形态和已存在的本地数据格式，除非任务明确要求并说明迁移方案。

`.harness/reading-core.json` 是 Owner 固定的既有用户主线回归：添加两本书、标记已读、刷新保留、状态筛选、删除。产品可维护定位副本 `tests/browser/core.json`，本次与原计划字节一致；不修改受保护配置。它不是所有新功能的完整验收；每个新任务还应补充对应 AC 和验证。

任务 PRD、设计和计划见 `../04-implementation/tasks/<issue>/`，实际验证范围见 `../05-validation/tasks/<issue>/`。当前使用Agent Platform分阶段会话与注册交接，Runner负责复验及草稿PR；旧工作流不启用，见AGENTS.md。
