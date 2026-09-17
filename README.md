# 读书清单

这个仓库只开发一个产品：中文读书清单。目标是新增书籍、标记已读、筛选、删除及刷新保留。

产品任务：[Issue #1](https://github.com/big91987/reading_list/issues/1)。需求、澄清、反馈、代码分支和预览都通过对应 Issue 关联。后续 Issue 应是这个产品的功能、缺陷或改进，不在这里开发其他示例产品。

## 研发机制

本项目接入 [he_skeleton](https://github.com/big91987/he_skeleton)，版本记录在 harness-upstream.json。公共机制问题回到上游修复，通过 scripts/sync_project.py 同步；不覆盖本项目业务代码。

所有者在任务下评论 `/harness 你的要求` 可启动本机 Codex。当前实现阶段使用静态 HTML/CSS/JS 和 localStorage，尚未包含真实后端。等待反馈时 Job 结束，Session 保留。每轮预览有固定地址。

脚手架受管理文件不在业务任务中修改，不自动批准或合并 PR。
