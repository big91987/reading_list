# Project document index

Start with [project context](00-global/project.md). Record confirmed current behavior and unresolved decisions separately. Inspect code before assuming that a planned feature exists.

| Location | Shared content |
|---|---|
| `00-global/` | Project purpose, vocabulary, product boundaries and decisions |
| `01-architecture/` | Accepted architecture and shared API/data contracts |
| `02-research/` | Research evidence, not automatically accepted direction |
| `03-backlog/` | Future work outside the active commitment |
| `04-implementation/tasks/<issue>/` | Task PRD/AC, design and execution plan |
| `05-validation/tasks/<issue>/` | Verification scope, evidence and limitations |

Task paths are configured in `.harness/full.json`. Existing projects can point it to their existing indexes and stage documents; do not create a second competing source of truth.

## 当前任务

- [Issue #97：页面版本号显示](04-implementation/tasks/97/README.md)：development本轮6份产品计划159动作、Node16/Python8与8项verify通过，原生200%/160 CSS px版本完整及AX验证、零写/恢复通过，兼容声明更新。见[当前产品验证](05-validation/tasks/97/validation.md)；Ready for independent QA，按自主策略自动交接以工具回执为准，不声称QA通过/语音实测/发布或合并。
- [Issue #94：筛选按钮增加简短悬停提示](04-implementation/tasks/94/README.md)：产品已实现，宿主机8项gate（13项Node、8项Python）通过，本轮正式MCP16份计划851动作通过；[实施计划](04-implementation/tasks/94/implement.md)、[LLD](01-architecture/tasks/94/lld.md)、[验证报告](05-validation/tasks/94/validation.md)记录纯hover矩阵/浮层/Escape、独立Chromium触屏模拟、几何与零新增写。旧EPERM已解除、历史失败保留；Ready for independent QA，自动交接以工具回执为准，不宣称QA通过/物理手机/跨引擎认证或发布。
- [Issue #82：撤销最近一次删除](04-implementation/tasks/82/README.md)：批准设计已实现于app；[实施计划](04-implementation/tasks/82/implement.md)、[产品验证](05-validation/tasks/82/validation.md)记录12份最终计划/517动作、9项单元和格式/lint证据。窄屏长名溢出已修复；共享verify整条命令受沙箱监听EPERM限制，注册check相同计划通过。人工IME/朗读及Runner完整复验待补；用户已检查产品并授权独立QA，交接结果以工具回执为准，仅QA验收，未发布/合并，不预设QA结论。
- [Issue #71：修改已有书籍的书名](04-implementation/tasks/71/README.md)：需求与设计已获批准；[实施计划](04-implementation/tasks/71/implement.md)与[产品验证](05-validation/tasks/71/validation.md)已形成，产品实现和自动功能证据通过；用户授权立即交接待审查草稿PR/流水线验证，Runner执行正式复验与发布任务分支/草稿PR，AC-12仍Partial/待人工验收，不声称完整验收或合并，执行结果以工具回执为准。

See [full workflow](harness-full.md).


## 阶段产物入口

遵循 [AGENTS.md](../AGENTS.md) 中的阶段产物与 Skill 约定。任务 PRD/AC 与可预览原型在 `04-implementation/tasks/<issue>/`；HLD、LLD、数据/API 契约与决策记录在 `01-architecture/tasks/<issue>/`；`04-implementation/tasks/<issue>/design/README.md` 索引完整设计集合；验证证据在 `05-validation/tasks/<issue>/`。已有材料保持原路径并在任务索引中引用，旧的单一 design.md 不表示完整交付。
