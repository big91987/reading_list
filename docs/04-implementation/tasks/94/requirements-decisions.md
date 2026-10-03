# Issue #94 需求决策记录

状态：Complete。目标文档：`prd.md`。更新时间：2026-10-03。

## 来源与实查

- 用户原文：“给读书清单的‘全部、已读、未读’筛选按钮增加简短的悬停提示，让新用户知道每个按钮会显示哪些书。保留现有布局、筛选行为和存储数据。”
- Runner 原文：“Issue 已选择自主推进；这是工作方式授权，不代表用户已审查或批准具体产物。”普通可逆默认允许自主确定，阻断问题与最终合并/高风险部署仍保留人工决策。
- 2026-10-03 本地读取 `docs/README.md`、`docs/00-global/project.md` 及 `app/index.html`、`app/styles.css`、`app/app.js`：按钮实际顺序为全部/未读/已读，无提示属性；点击更新当前范围；筛选按 `read` 区分；本地存储键为 `page-between-reading-list`。任务 94 原目录不存在，没有可重复审批的既有任务决定。工作分支实查为 `codex/issue-94-platform`，未执行分支或提交操作。
- 全局现状文档包含既往任务未合并及旧 workflow 描述；本轮流程以 Runner 的 Agent Platform 自主策略为准，功能基线以当前工作区代码为准，不推定既往任务审批或发布状态。

## 检查点

| 字段 | 值 |
|---|---|
| last_completed_round | 无问答轮次；需求来源明确，自主默认记录于本轮 |
| active_round | none |
| active_question_ids | none |
| unanswered_ids | none |
| next_id | D-004 |
| resume_note | 需求已就绪；按 Runner 策略交接 design，不追加形式审批 |

## 决策

### D-001 / semantic_key: filter-tooltip.scope

- question/options：未向用户另提问题；采用原始需求边界。
- recommendation/conclusion：只覆盖现有三个阅读状态入口，不改变布局、行为或数据。
- user_answer：上述原始需求；未产生新的问答回复。
- status：Accepted（直接来源于用户需求，不是对新增产物的审批）。
- prerequisites：none；descendants：D-002、D-003；supersedes：none。
- source：本轮用户 Issue #94 原始需求；artifact_mapping：PRD 1～7。

### D-002 / semantic_key: filter-tooltip.copy

- question/options：未向用户提问；文案为低风险可逆默认。
- recommendation：全部“显示所有书籍”，未读“只显示未读书籍”，已读“只显示已读书籍”。
- user_answer：无逐字批准；Runner 授权自主选择普通展示细节。
- conclusion：固定短中文解释，无动态数量或用户数据；设计明确呈现机制，需求不预定实现。
- status：Accepted（自主决策，非用户产物审批）。
- prerequisites：D-001；descendants：none；supersedes：none。
- source：当前 `getVisibleBooks()` 筛选语义和 Runner 自主策略；artifact_mapping：R-01、R-02、AC-01～03。
- 影响：文案可逆且不改变业务规则；提示真实性需后续交互验证。

### D-003 / semantic_key: filter-tooltip.input-compatibility

- question/options：未向用户提问；采用保持既有交互的默认边界。
- recommendation/conclusion：保留全部/未读/已读顺序；不扩展长按或强制键盘焦点提示，保持键盘和触屏直接筛选、原按钮名称和选中语义。
- user_answer：用户要求保留现有布局和筛选行为；未额外批准新增跨端帮助流程。
- status：Accepted（用户约束加自主可逆默认）。
- prerequisites：D-001；descendants：none；supersedes：none。
- source：当前按钮标记、样式、点击监听和 Runner 自主策略；artifact_mapping：R-03、R-04、AC-04～07。
- 影响：无悬停环境不承诺提示可见，但仍能直接使用原筛选；未来扩大交互范围需重新评估。

无 Asked、Conflict、Blocked、Frozen 或隐含未记录假设。决策未替代产品测试；完成需求持久化与一致性检查后才能交接，结果见 G1。
