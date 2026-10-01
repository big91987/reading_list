# Issue #71 需求决策与澄清记录

> Status: Complete
> Target artifacts: `docs/04-implementation/tasks/71/prd.md`, `docs/04-implementation/tasks/71/g1-review.md`
> Updated: 2026-10-01

## 已确认的任务边界

来源：本次用户原始需求及工作区说明。支持已有条目修改书名、保存和取消；保持已读状态、刷新持久化、全部／已读／未读筛选及删除兼容；延续视觉风格并支持桌面和手机。不涉及账号、云端同步、标签、评分。需求与设计分别由用户审查确认；Runner 负责最终任务分支与草稿 PR 发布，不直接合入主线。无需再次确认这些边界。

## 已查证的现状

- `docs/00-global/project.md` 与 `app/app.js`：现有产品为浏览器本地清单，使用 localStorage；无账号或后端。
- `app/app.js`：新增书名去除首尾空白，拒绝空名，重复比较不区分大小写；支持阅读状态、筛选和删除，没有编辑功能。
- `app/index.html`：新增书名输入限制为 80；`app/styles.css`：已有纸色、暖色强调及响应式风格。
- 本任务尚无既有 PRD、设计、原型或验证证据。本次检查仅为文档与源码阅读，不声称已完成运行验证。
- `docs/00-global/project.md` 的旧工作流描述与当前会话说明不一致；本任务遵循当前 Agent Platform 与 Runner 分工，不更改工作流。

## Checkpoint

| Field | Value |
|---|---|
| last_completed_round | R-001 |
| active_round | none |
| active_question_ids | none |
| unanswered_ids | none |
| next_id | D-004 |
| resume_note | D-001～D-003 及完整 PRD（包含补充默认行为）均已获确认；无未回答问题、冲突或冻结项，用户批准进入设计，立即通过注册工具交接，不重复审批。 |

## D-001

| Field | Value |
|---|---|
| semantic_key | rename.empty-title |
| question | 修改时如何处理空书名？ |
| options | A：去除首尾空白后为空则拒绝保存，保留输入与原书名，提示用户修正。B：将空输入视为取消编辑，不显示错误。 |
| recommendation | A；与新增校验一致，避免用户把失败误认为保存成功。 |
| user_answer | 三项都按推荐的 A。空名和与其他书重名都拒绝，排除自身；只保留一个编辑条目，切换或取消不自动保存。请整理 PRD 给我审查。 |
| conclusion | 采用 A：新书名去除首尾空白后为空则拒绝保存，保留输入与原书名，并提示修正。 |
| status | Accepted |
| prerequisites | 已确认的修改书名任务范围 |
| descendants | none |
| supersedes | none |
| source | 用户要求澄清空名规则；现有新增行为见 app/app.js；2026-10-01 |
| artifact_mapping | prd.md 业务规则、异常流程、AC |

## D-002

| Field | Value |
|---|---|
| semantic_key | rename.duplicate-title |
| question | 修改时如何处理与其他书籍同名？ |
| options | A：去除新书名首尾空白后，不区分大小写检查整个清单中的其他书籍；同名拒绝保存，排除正在编辑的书籍自身。B：修改允许与其他书籍同名，新增仍沿用原规则。 |
| recommendation | A；与新增规则一致，隐藏在其他筛选中的书籍也参与检查；保存原名或只调整大小写不会被误判为重复。 |
| user_answer | 三项都按推荐的 A。空名和与其他书重名都拒绝，排除自身；只保留一个编辑条目，切换或取消不自动保存。请整理 PRD 给我审查。 |
| conclusion | 采用 A：针对整个清单中的其他书籍，不区分大小写检查重复，排除自身；隐藏条目参与检查；原名保存和仅调整大小写允许。 |
| status | Accepted |
| prerequisites | 已确认的修改书名任务范围 |
| descendants | none |
| supersedes | none |
| source | 用户要求澄清重复规则；现有新增行为见 app/app.js；2026-10-01 |
| artifact_mapping | prd.md 业务规则、异常流程、AC |

## D-003

| Field | Value |
|---|---|
| semantic_key | rename.unsaved-exit |
| question | 编辑未保存时离开条目，如何处理草稿？ |
| options | A：只保留一个编辑中的条目；切换筛选或编辑另一条时放弃未保存修改，不自动保存；取消或刷新同样保留最后保存的书名。B：离开有改动的编辑条目前，提示选择放弃或继续编辑；刷新不承诺保留草稿。 |
| recommendation | A；交互简单，显式保存才改变书名；避免为轻量修正增加反复确认。 |
| user_answer | 三项都按推荐的 A。空名和与其他书重名都拒绝，排除自身；只保留一个编辑条目，切换或取消不自动保存。请整理 PRD 给我审查。 |
| conclusion | 采用 A：同时仅一个编辑条目；切换筛选、编辑另一条、取消或刷新均不自动保存草稿，书名保持最后成功保存值。 |
| status | Accepted |
| prerequisites | 已确认的修改书名任务范围 |
| descendants | none |
| supersedes | none |
| source | 用户要求澄清交互细节；2026-10-01 |
| artifact_mapping | prd.md 正常流程、退出流程、AC；设计阶段交互输入 |

## 经 PRD 整体批准的补充默认行为

这些低风险需求默认值已经随 PRD 整体审查获用户明确接受，不再作为未确认假设。最终完整行为以 PRD 的 BR-05～BR-09 和 AC 为准。

- 编辑入口位于现有书籍条目；就地修改，预填原名，提供显式保存／取消；键盘与触屏均可操作。具体布局、文案和焦点细节交设计。
- 沿用新增书名的 80 长度限制；不引入额外字符限制，不折叠内部空格，不引入繁简转换或模糊重名判断。
- 修改仅影响目标书名；阅读状态、条目位置、总数、已读数和其他条目不变，保存后保留当前筛选。
- 保存失败不得显示成功，不让失败的新名替换最后成功保存的名称；保留草稿并支持重试或取消。
- 删除仍可使用；删除编辑中条目时不保存草稿且不复活条目。标记状态等既有动作不得隐式保存书名草稿；编辑期间的动作协调由设计明确。
- 不增加多标签页冲突解决、撤销历史或跨设备能力；不削减本轮约定的原型、HLD、契约及验证产物。

## Round R-001

- ordered question IDs: D-001, D-002, D-003
- response received: 本轮用户原文“三项都按推荐的 A。空名和与其他书重名都拒绝，排除自身；只保留一个编辑条目，切换或取消不自动保存。请整理 PRD 给我审查。”
- answer-to-ID mapping: D-001=A, D-002=A, D-003=A
- resolved IDs: D-001, D-002, D-003
- unanswered IDs: none
- write-verification result: R-001 已读回核验；三个 ID 均为 Accepted，next_id=D-004，active_round=none，无冲突、替代或冻结项。当时 PRD 整体审批尚未完成，现已通过下述整体审批收口。

## PRD 整体审批与最终检查点

- 用户原文：“已审查 PRD 和 G1 自查。PRD 通过，接受其中补充默认行为，进入设计。请直接调用已注册的 submit_handoff 交接，不再要求重复确认。”
- 结论：完整 PRD v1、User Story、AC 和所有补充默认行为获批准；G1 更新为 Ready for Architecture，requirements 澄清状态为 Complete。
- 答复映射：本次针对整份 PRD 的明确批准，包含 BR-05～BR-09、长度沿用、原位编辑、桌面／手机视口及可访问性验收；没有新增或推翻任何 D 项。
- 恢复状态：已确认决策 3 项，未回答／冲突／冻结项 0，active_round=none，next_id=D-004。无需新问题或重复审批。
- 交接授权：用户明确批准通过注册工具进入设计；实际交接结果以 submit_handoff 返回为准，不由文档声明成功。
