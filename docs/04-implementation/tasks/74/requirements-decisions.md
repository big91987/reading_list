# Issue #74 需求决策台账

> Status: Complete
> Target artifacts: docs/04-implementation/tasks/74/prd.md、g1-review.md
> Updated: 2026-10-02

## Checkpoint

| Field | Value |
|---|---|
| last_completed_round | R-002 |
| active_round | none |
| active_question_ids | none |
| unanswered_ids | none |
| next_id | D-006 |
| resume_note | 用户已批准整套 PRD，确认不新增搜索、保持原顺序和原功能、仅增加全量计数，明确授权工具交接设计；不重复审批 |

## 原始明确决定

以下规则由用户本轮明确提供，question/options/recommendation 均为“不适用：直接需求”，prerequisites/descendants/supersedes 均为 none，status 均为 Accepted，source 均为 2026-10-02 本轮 Issue #74 原始需求。

| ID | semantic_key | user_answer（原文） | conclusion | artifact_mapping |
|---|---|---|---|---|
| D-001 | counts.full-list | 数量以完整本地书单为准，不受当前搜索词影响 | 三个按钮按全量有效书单计数，不受视图条件影响 | PRD R-01、02，AC-01、02 |
| D-002 | counts.transitions-reload | 新增、删除和切换已读状态后立即更新，刷新后仍与已保存书单一致。空书单显示 0 | 保存成功即时更新，刷新一致，空集合均为 0 | PRD R-03～06、08，AC-03～07、10 |
| D-003 | compatibility.boundary | 现有搜索和筛选行为保持一致。沿用现有界面风格，桌面和手机都可正常使用，不增加后端或新的存储结构 | 保留实际基线行为、风格和本地格式；搜索前提差异另由 D-004 处理 | PRD R-07、08，AC-08～10 |

## D-004

| Field | Value |
|---|---|
| semantic_key | scope.search-baseline-and-prd-approval |
| question | 当前代码没有搜索功能。是否按这份 PRD，仅增加三个筛选数量、不新增搜索，并进入设计阶段？ |
| options | A：确认 PRD，不新增搜索，进入设计；B：本轮也需要新增搜索，先补充需求，暂不进入设计。若 PRD 其他内容需调整，也可直接指出。 |
| recommendation | A；与本次计数目标及当前产品基线一致，避免把“保留现有行为”扩大为新功能。B 会扩大交互、范围和验收。 |
| user_answer | 确认本次不新增搜索，以当前主线实际已有功能为基线，只增加三个筛选按钮的全量书单计数。你按这个边界整理 PRD 给我看即可。 |
| conclusion | 范围确认：不新增搜索，以当前主线实际已有功能为基线，仅新增全量计数。用户要求先审查整理后的 PRD，没有批准整套 PRD 或授权进入设计；审批部分拆为 D-005，不因原问题合并了范围和授权就推定授权 |
| status | Accepted |
| prerequisites | D-001、D-002、D-003 |
| descendants | D-005；设计阶段范围与需求交接 |
| supersedes | none |
| source | 2026-10-02 app/index.html、app/app.js 与原始需求对照 |
| artifact_mapping | PRD §1、§2、§8；G1 状态 |

## R-001

- ordered_question_ids：D-004。
- response_received：用户确认不新增搜索、以主线实际已有功能为基线，只增加全量计数，要求整理 PRD 给其审查。
- answer-to-ID mapping：D-004 范围部分 Accepted；整套 PRD 审批与设计授权尚未回答，拆为 D-005。
- resolved_ids：D-004；unanswered_ids：none（未决审批转 R-002）。
- write-verification：本轮落盘后回读核对 D-004/D-005、轮次与 checkpoint；执行输出保留结果。

## D-005

| Field | Value |
|---|---|
| semantic_key | approval.revised-prd-design-handoff |
| question | 请审查修订后的 PRD：是否确认该需求基线并进入设计阶段？ |
| options | A：确认 PRD，进入设计；B：先修改 PRD，暂不进入设计（请指出需调整内容）。 |
| recommendation | A；已按确认边界限定为全量计数并覆盖兼容与失败场景，但是否批准由用户决定。 |
| user_answer | 我已看过 PRD，确认这份需求基线，选 A：不新增搜索，保持现有按钮顺序和原功能，只增加全量计数。请进入设计，通过交接工具交给下一阶段；无需再次让我确认同一份需求。 |
| conclusion | 用户批准完整 PRD 并授权立即工具交接设计；不新增搜索，保持现有“全部 / 未读 / 已读”顺序及实际主线原功能，仅新增全量计数；Ready for Architecture，不重复审批 |
| status | Accepted |
| prerequisites | D-001、D-002、D-003、D-004 |
| descendants | 设计交接 |
| supersedes | none（从 D-004 分离未获批准的审批，不替换范围决定） |
| source | 2026-10-02 本轮用户明确选择 A、批准 PRD 并授权交接 |
| artifact_mapping | PRD 状态与 §8；G1 状态；任务及项目索引 |

## R-002

- ordered_question_ids：D-005。
- response_received：用户已看过 PRD、确认需求基线并选择 A，明确保持顺序/原功能、不新增搜索、只增加全量计数，要求工具交接设计且不再重复确认。
- answer-to-ID mapping：D-005 Accepted；resolved_ids：D-005。
- unanswered_ids：none。
- write-verification：交接前回读核对 D-001～005 均 Accepted、无 Asked/Conflict/Frozen、active_round 为 none、next_id 为 D-006；执行输出保留校验结果。
