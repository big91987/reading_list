# 本机部署验证记录

日期：2026-10-03。范围：5533 独立预览部署，不涉及产品功能和数据库迁移实现。

- 初次自动发布：[PR #91](https://github.com/big91987/reading_list/pull/91) 合入 main 后，[Run 37107898730](https://github.com/big91987/reading_list/actions/runs/37107898730) 的 prepare/deploy 成功，服务版本为 `b49e7b602eb244d4304bd1e3fd476372e4365e86`。
- 手动触发审批：[Run 37108028373](https://github.com/big91987/reading_list/actions/runs/37108028373) 使用 review=true，实际进入 waiting；pending deployments 显示 Owner 为 required reviewer，5533 保持原版本。验证后取消该演练，未批准任何数据变更。
- 浏览器基础检查：通过实际页面新增“部署保留验证 · 人类简史”，标记已读，刷新后仍为 1 本/已读 1 本。没有注入 localStorage。
- 部署自动化测试：版本切换保留数据目录、健康失败回退、声明/迁移审批、过期计划拒绝、发布文件被改拒绝、无效 JS 和缺少迁移方案拒绝。
- 独立评审发现的两个审批缺口已有回归：待审批版本路径必须返回 404；后续普通声明不能绕过尚未部署的迁移基线。成功发布的旧资产仍可访问以支持已打开页面。
- 产品既有 Node 测试 9 项通过；Python 质量与 YAML 语法检查通过。

本记录只列已取得的证据。后续版本部署后的浏览器保留情况以实际发布 Run 和现场检查为准。当前没有数据库，未声称测试数据库迁移或跨浏览器共享数据。
