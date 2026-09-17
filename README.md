# Harness 独立实验项目

这里验证 [he_skeleton](https://github.com/big91987/he_skeleton) 的自动研发机制，业务任务、代码、反馈和预览都留在这个仓库。

## 使用

1. 所有者用 Issues → New issue → 交给 Agent 做一个网页 发起任务。
2. 默认先只读澄清，回复 `/harness 你的回答` 后继续。模板选择“直接实施”可以跳过首轮确认。
3. 同一 Issue 查看执行报告、对应版本预览和截图，再用 `/harness 修改意见` 迭代。
4. 每个任务有独立分支和 Session。初期一次只发一个命令，等待结果后再发下一个；单 Runner 串行执行。
5. 查看改动并创建 PR，由人审查合并。没有自动批准或合并。

当前适配的是本机 Codex CLI；第一阶段只支持静态 HTML/CSS/JS 和 localStorage。这是验证链路的实验范围，不代表完整后端研发已经支持。预览是公开页面，只放实验数据。

## 脚手架版本

`harness-upstream.json` 记录所用上游提交和受管理文件。修复在上游完成，再运行上游 `scripts/sync_lab.py` 同步。同步不会覆盖 app/。不要在这里私改 Harness 文件。

本仓库的 Issue 才是实验入口。旧的本地待办网页和上游 Issue #2 不属于这里的交付记录。
