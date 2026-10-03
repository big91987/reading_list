# Issue #94 设计交付索引

2026-10-03。设计原型检查及G2 HLD自查就绪，按Runner自主策略交接研发，无须形式审批；不表示用户已逐项批准，也不表示产品已实现/发布。

## 本轮新建

- [交互规范](interaction.md)
- [可运行原型与运行说明](../prototype/README.md)：index.html、styles.css、app.js、demo.js为完整本地运行依赖。
- 原型验证计划：[提示](../prototype/check-hover.json)、[关键状态](../prototype/check-states.json)、[键盘/存储](../prototype/check-keyboard.json)、[既有核心主线](../prototype/check-core.json)、[改名/撤销](../prototype/check-edit-undo.json)。
- [HLD](../../../../01-architecture/tasks/94/hld.md)、[数据/API/页面契约](../../../../01-architecture/tasks/94/contracts.md)。
- [决策台账与方案比较](../../../../01-architecture/tasks/94/architecture-decisions.md)、[需求追溯](../../../../01-architecture/tasks/94/traceability.md)。
- [真实验证证据与限制](../../../../05-validation/tasks/94/design-validation.md)：6次执行（首次FAIL保留，5组最终PASS），每次browser.json与桌面/移动宽度截图。
- [G2自查](g2-review.md)。
- [交付快照 SHA-256 清单](snapshot-sha256.txt)：索引、上游输入、原型依赖、方案文档、成功与失败证据的完整内容摘要；不是Git提交。

## 更新与复用

更新本任务README.md与docs/README.md入口，仅同步阶段状态。复用PRD、requirements-decisions、G1及app/开始时快照；复用#71/#82数据和操作契约与Owner核心回归计划，不改变上游业务规则。

无裁剪约定交付物。无API/数据变更仍显式交付contracts；没有难逆转选择，不新增独立ADR，理由在台账。未改产品app/、未更新尚未验证的release声明、未提交/发布。

## 下游必须承接

development仅移植三条提示、CSS及极小Escape/离开事件，不复制原型数据键、demo脚本或页尾工具。按PRD全部AC进行真实产品验证，补纯hover停留/浮层移入/选中矩阵、真实触屏、产品布局对照和真实存储写入观察；跨引擎与朗读如实记录。产出LLD/实施计划与产品validation，并按项目release contract声明实际兼容基线。最终合并与高风险部署仍需人工授权。
