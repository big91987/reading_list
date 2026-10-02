# Issue #82 设计审查索引

> Accepted / Ready for Development · 2026-10-02。用户已批准修订设计、焦点/草稿规则及正式故障方案，授权交接研发；执行结果以工具回执为准。无业务范围变更。

## 审查入口

| 产物 | 内容和状态 |
|---|---|
| [可运行原型](../prototype/index.html) / [运行说明](../prototype/README.md) | 独立键，沿用现有视觉；完整交互与原型写入异常工具，后者不进入产品 |
| [交互规范](interaction.md) | 常驻栏、关键状态、窄屏、键盘、焦点及草稿提案 |
| [HLD](../../../../01-architecture/tasks/82/hld.md) | 上下文、来源覆盖、责任/事实源、流程/部署/故障、质量、方案与演进 |
| [数据和操作契约](../../../../01-architecture/tasks/82/contracts.md) | 旧 JSON、单记录、同步提交、同名守卫、错误、一次消费和视图/草稿不变量 |
| [架构决策台账](../../../../01-architecture/tasks/82/architecture-decisions.md) | 继承已批准规则；A-002 整包 Accepted，A-003 仅技术证据 |
| [追溯](../../../../01-architecture/tasks/82/traceability.md) | 全部 14 AC 设计承接、原型证据和研发责任 |
| [设计验证](../../../../05-validation/tasks/82/design-validation.md) | 7 计划/279 动作实际通过、4 次失败保留、关键截图和真实性边界 |
| [真实产品故障验证计划](../../../../05-validation/tasks/82/fault-validation-plan.md) / [可执行计划](../../../../05-validation/tasks/82/product-storage-failure-plan.json) | 正式 storage_write_failure、snapshot_storage/unchanged_storage、真实 UI、同页关闭重试/刷新；无需宿主或内部深比较，待在 app/ 执行 |
| [G2 自查](g2-review.md) | 仅 HLD Gate、来源与跨文档一致性；整改闭环、用户已批准，G2 HLD READY |
| [文件快照与检查](audit.json) | 本次审查文件实际路径、SHA-256、链接/编号/语法与空白检查 |

## 本轮真实文件集合

新建：本 design/ 下 README.md、interaction.md、g2-review.md、audit.json；architecture/tasks/82 下 hld.md、contracts.md、architecture-decisions.md、traceability.md；prototype 下 index.html、app.js、styles.css、README.md 和七份 check JSON（core、conflicts、failure、keyboard、keyboard-filter、states、empty）；validation/tasks/82 下 design-validation.md、fault-validation-plan.md，以及 browser/design-1-1～design-1-18 每目录的 browser.json、screenshot.png、mobile.png。

更新：任务 82 README.md、docs/README.md 仅新增设计索引入口。复用（不改）：任务 82 prd.md、decision-ledger.md、g1-review.md；产品现状、任务 71 设计/契约/测试机制和 app/ 的已保存行为/样式。没有改业务代码、受保护配置或共享工具；没有另建第二份 PRD，也没有裁剪约定设计产物。

精确路径与哈希见 audit.json，全部 evidence 包括失败记录都在审查集合内。确认交接时沿用这些真实文件集合，不仅传摘要。

本轮用户审查后更新：fault-validation-plan、contracts、HLD、traceability、架构台账、G2 复审、设计验证、运行说明与索引/audit；新增 product-storage-failure-plan.json 和 browser/design-1-19 下 browser.json、screenshot.png、mobile.png。原型实现及交互规范不改，沿用用户已实际操作认可的方向；上游 PRD 和 app/ 均未改。

正式工具路径已在隔离原型通过 69 动作（design-1-19），连同原七份计划共 348 个通过动作；没有把该原型执行称作真实产品 AC-08/09 通过。撤销/存储内部状态保持规则不变，删除的是过量验证机制和门槛。

## 已确认设计与研发输入

沿用已批准业务规则，推荐：筛选下方常驻撤销栏且独立于其他反馈；复用现有持久化、只存内存单记录；保留其他书的编辑草稿/对象引用；成功删除聚焦撤销、成功恢复优先回编辑草稿，否则回恢复书修改入口或当前筛选；失败保持机会和原数据并可重试。

用户已审查并批准修订设计包、故障方案、G2 整改及焦点/草稿规则，并实际验证原型冲突、改名后恢复和失败后同页重试。授权通过注册工具进入研发，不重复审批。原型通过不等于真实产品通过；研发按 PRD 原范围执行全部 AC，故障使用正式 check 的 storage_write_failure/snapshot_storage/unchanged_storage 与真实 UI/同页重试/刷新，内部守卫单独单元表述，不增加首页替换、第二异常、内部深比较或额外审批。产品 PR 保持草稿，人工决定合并。
