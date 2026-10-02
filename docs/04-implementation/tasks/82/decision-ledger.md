# Issue #82 需求决策台账

> Status: Complete
> Target artifacts: `docs/04-implementation/tasks/82/prd.md`、`docs/04-implementation/tasks/82/g1-review.md`
> Updated: 2026-10-02（Asia/Shanghai）

## Checkpoint

| Field | Value |
|---|---|
| last_completed_round | R-002（整体批准） |
| active_round | none |
| active_question_ids | none |
| unanswered_ids | none |
| next_id | D-004 |
| resume_note | 用户已批准整份基线、BR-09 和设计交接；存储失败真实验证要求已明确落盘但尚未执行。通过注册工具交接，不重复审批，执行结果以工具回执为准。 |

## 证据基线

- 原始来源：用户本轮提供的 Issue #82，https://github.com/big91987/reading_list/issues/82；未调用 GitHub。
- 已读项目入口：用户提供的适用 AGENTS.md、`docs/README.md`、`docs/00-global/project.md`、`.harness/full.json`；未发现任务 82 的既有文件或已确认台账。
- 当前产品静态事实：`app/app.js` 使用浏览器本地存储；新增和编辑书名按不区分大小写的全清单规则拒绝重名；删除只有反馈，没有恢复入口；仅持久化成功才更新当前清单；成功新增会切回全部筛选。`app/index.html` 已有状态反馈区域。
- 复用依据：`docs/04-implementation/tasks/71/prd.md` 的书名编辑、草稿退出、去重、失败恢复与兼容性规则。项目文档中旧工作流描述不覆盖本轮 Agent Platform 指令。
- 本轮仅阅读和需求澄清，未运行产品、原型或浏览器验收；静态事实不代表动态验证通过。

## D-001 原始需求方向和范围

| Field | Value |
|---|---|
| semantic_key | undo-latest-delete.scope |
| question | 无新增提问；直接承接用户明确需求。 |
| options | 不适用 |
| recommendation | 不适用 |
| user_answer | “连续删除多本时，只允许撤销最近一次删除。刷新页面后不保留撤销机会。默认不做倒计时，下一次成功删除替换上一次撤销记录；其他正常操作不应静默清掉撤销机会。” |
| conclusion | 删除后明确显示书名并提供单次撤销；恢复原书名、已读状态及合理原位置；撤销不切换当前筛选；仅最新成功删除可撤销，无倒计时，刷新失效；保留既有能力及视觉风格；不新增账号、后端或复杂历史栈。设计阶段提供可运行小型交互原型和必要设计，开发阶段实现并真实验收，不模拟 QA。 |
| status | Accepted |
| prerequisites | none |
| descendants | D-002 |
| supersedes | none |
| source | 2026-10-02 用户提供的 Issue #82 原始需求；方向由用户已明确。 |
| artifact_mapping | prd.md 第 1～7 节；g1-review.md 的目标、范围和设计约束 |

## D-002 撤销时同名冲突

| Field | Value |
|---|---|
| semantic_key | undo-latest-delete.duplicate-conflict |
| question | 删后新增或改名导致同名时，撤销应如何处理？ |
| options | A（推荐）：拒绝本次恢复，提示先修改冲突书名；保留撤销机会，处理冲突后可再次撤销，不修改任何现存书籍。B：撤销时额外提供“换一个书名再恢复”的流程，不覆盖现存书籍，但恢复书名不再等于原书名。 |
| recommendation | A。保持既有禁止同名和恢复原书名规则，不扩展为第二套改名流程；失败仍可重试。 |
| user_answer | “选 A。冲突时保留撤销机会，提示先改名，不修改现存书籍。其他按 Issue 已明确的规则形成简洁 PRD，给我审查。” |
| conclusion | 同名冲突时拒绝本次恢复，提示先改名；保留最近一次删除的撤销机会，处理冲突后可再次尝试，不修改或覆盖现存书籍。 |
| status | Accepted |
| prerequisites | D-001；现有全清单去重事实已核对 |
| descendants | none allocated |
| supersedes | none |
| source | 2026-10-02 用户明确选择 A；原始需求要求覆盖删后新增或改名的同名冲突；现有代码禁止同名。 |
| artifact_mapping | prd.md BR-06、US-03、AC-06/07；g1-review.md 的冲突规则与澄清结果 |

## Round R-001

- ordered question IDs: D-002
- response received: 用户选择 A，要求形成简洁 PRD 供审查。
- answer-to-ID mapping: “选 A” → D-002。
- resolved IDs: D-002（Accepted）
- unanswered IDs: none
- write-verification result: 提问前已回读；回答写入后再次核对 Checkpoint 和决策状态。D-001、D-002 均 Accepted，无 Asked、Conflict 或 Frozen，next_id 为 D-003；整体基线尚待审查批准。

## D-003 整体基线批准、恢复位置及真实验证

| Field | Value |
|---|---|
| semantic_key | undo-latest-delete.baseline-approval |
| question | 请审查，并确认是否批准这份 PRD、进入设计阶段。 |
| options | 批准整体基线并进入设计，或提出修改；恢复位置默认已随 PRD 呈现。 |
| recommendation | 按 PRD 整体审查后进入设计，不逐条重开已确认规则。 |
| user_answer | “已审查 PRD、G1 自查和决策记录，批准这份需求基线，包括 BR-09 按完整清单原序位恢复、越界放末尾的默认规则。进入设计，请通过交接工具执行。存储失败属于需要真实验证的异常路径；明确记录验证方式，不能把截图或静态阅读写成已实测通过。” |
| conclusion | 整体需求基线及 BR-09 已批准，授权通过工具交接设计；存储失败须触发实际产品写入失败并真实操作、断言、重试及刷新核对，截图/静态阅读不替代实测。当前未执行功能验证。 |
| status | Accepted |
| prerequisites | D-001、D-002；用户已审查 PRD、G1 和台账 |
| descendants | none allocated |
| supersedes | none |
| source | 2026-10-02 用户本轮明确批准及验证要求 |
| artifact_mapping | prd.md 状态、BR-09、第 6 节验证方式、第 7 节；g1-review.md、README.md 与项目索引 |

## Round R-002（整体批准）

- ordered question IDs: D-003（关联上一轮整体审查请求；非新增澄清）
- response received: 用户批准整份需求基线、BR-09 并授权设计交接，强调存储失败真实验证。
- answer-to-ID mapping: 本轮明确批准 → D-003。
- resolved IDs: D-003（Accepted）
- unanswered IDs: none
- write-verification result: 回读检查三项 Accepted、无待答 ID，next_id 为 D-004，PRD/G1 状态一致为 Ready for Architecture；验证方式已写入，未声称实测通过。
