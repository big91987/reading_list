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

- [Issue #76：书籍清单页 UI 与动效改版](04-implementation/tasks/76/README.md)：A方向、PRD/G1及设计v1/A-001已批准；[研发计划](04-implementation/tasks/76/implement.md)与[产品验证](05-validation/tasks/76/validation.md)已完成实现/自动检查，26组集成、四宽度流程、核心/键盘回归通过，Ready for Review。真实系统偏好/IME/读屏/真机留待人工验收；共享复验shell端口绑定受限，Runner重跑正式门禁再发布草稿PR。交接以注册工具回执为准，不声称已发布/合并。
- [Issue #71：修改已有书籍的书名](04-implementation/tasks/71/README.md)：需求与设计已获批准；[实施计划](04-implementation/tasks/71/implement.md)与[产品验证](05-validation/tasks/71/validation.md)已形成，产品实现和自动功能证据通过；用户授权立即交接待审查草稿PR/流水线验证，Runner执行正式复验与发布任务分支/草稿PR，AC-12仍Partial/待人工验收，不声称完整验收或合并，执行结果以工具回执为准。

See [full workflow](harness-full.md).


## 阶段产物入口

遵循 [AGENTS.md](../AGENTS.md) 中的阶段产物与 Skill 约定。任务 PRD/AC 与可预览原型在 `04-implementation/tasks/<issue>/`；HLD、LLD、数据/API 契约与决策记录在 `01-architecture/tasks/<issue>/`；`04-implementation/tasks/<issue>/design/README.md` 索引完整设计集合；验证证据在 `05-validation/tasks/<issue>/`。已有材料保持原路径并在任务索引中引用，旧的单一 design.md 不表示完整交付。
