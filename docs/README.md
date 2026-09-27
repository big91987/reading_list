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

See [full workflow](harness-full.md).


## 阶段产物入口

遵循 [AGENTS.md](../AGENTS.md) 中的阶段产物与 Skill 约定。任务 PRD/AC 与可预览原型在 `04-implementation/tasks/<issue>/`；HLD、LLD、数据/API 契约与决策记录在 `01-architecture/tasks/<issue>/`；`04-implementation/tasks/<issue>/design/README.md` 索引完整设计集合；验证证据在 `05-validation/tasks/<issue>/`。已有材料保持原路径并在任务索引中引用，旧的单一 design.md 不表示完整交付。
