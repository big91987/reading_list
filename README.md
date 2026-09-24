# 读书清单

这个仓库只开发一个产品：中文读书清单。目标是新增书籍、标记已读、筛选、删除及刷新保留。

产品任务：[Issue #1](https://github.com/big91987/reading_list/issues/1)。需求、澄清、反馈、代码分支和预览都通过对应 Issue 关联。后续 Issue 应是这个产品的功能、缺陷或改进，不在这里开发其他示例产品。

## 研发机制

本项目使用 [he_skeleton](https://github.com/big91987/he_skeleton) 的完整研发工作流 `.github/workflows/harness-full.yml`，配置与使用说明见 [完整研发流程](docs/harness-full.md)。公共机制问题回到上游修复，再同步已提交版本；不覆盖本项目业务代码。

拥有 write、maintain 或 admin 权限的成员新建 Issue 后自动启动；外部用户的 Issue 等待授权成员介入。后续直接在 Issue 评论中提问、补充需求或确认阶段产物，无需命令和 ID。流程按需求、设计、研发推进，等待人工反馈时结束本轮 Job 并保存状态。

当前产品使用静态 HTML/CSS/JS 和 localStorage，尚未包含真实后端。

脚手架受管理文件不在业务任务中修改，不自动批准或合并 PR。
