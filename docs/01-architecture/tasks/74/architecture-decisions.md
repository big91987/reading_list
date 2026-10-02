# Issue #74 设计决策台账

状态：Complete · 目标：HLD、契约、交互原型 · 用户已批准完整设计并授权交接研发。

| 检查点 | 值 |
|---|---|
| 当前架构层级 | 逻辑与实现映射（3～5），未进入研发 LLD |
| 最近完成轮次 | AR-001，A-001 已接受；上游 D-005 保持已批准 |
| 活动轮次 | none |
| 活动问题 ID／未回答 ID | none |
| 下一个 ID | A-002 |
| 恢复说明 | A-001 已明确批准；无需再次审批。交接执行结果以注册 submit_handoff 回执为准 |

## 继承决策与证据

D-001～005 Accepted，来源是 requirements-decisions.md，不重新审批。已批准全量计数、原順序与原功能、成功保存后生效、不新增搜索/后端/存储结构。HLD 目标边界全部映射到这些既有决定。

Fact F-01：实际 app/index.html、app/app.js、app/styles.css 具备现有增删、双向阅读切换、编辑、先保存后替换 books 及摘要 render；产品三文件未修改。真实 CSS 主断点为 650px、窄屏为 430px。代码证据不等于产品运行验证。

Validation V-01：注册 check 的计划、结果和截图见 design-validation.md；模拟存储失败与四位数只是原型证据，未来产品及人工触摸／读屏不声称完成。

依赖图：D-001～005 → F-01（事实核对）→ 原型/HLD/契约；V-01 提供原型证据 → A-001 展示与设计包审查 → 研发交接。A-001 不改变上游需求。

## A-001

| 字段 | 值 |
|---|---|
| architecture_layer | 展示与现有逻辑映射 |
| semantic_key | design.filter-count-inline-package-approval |
| decision_type | Decision |
| question | 是否确认本次设计：沿用现有样式与顺序，在按钮名称后直接显示精确数量，并按所附原型、HLD、契约及验证边界进入研发？ |
| options | A：确认这份设计并进入研发；B：先调整设计，指出要改的展示或方案（暂不交接） |
| recommendation | A；名称后直接显示数字，比增加胶囊徽标更贴近原有简洁文字与红色底线，不新增交互或事实源 |
| architecture_impact | 三按钮内增加派生展示；保持现有保存后 render 的事务边界，无存储迁移 |
| user_answer | A，确认本次完整设计并进入研发。我已审查设计索引、HLD、contracts，并实际操作原型验证筛选、新增、状态切换、刷新、保存失败和手机四位数布局。采用现有顺序、名称后精确数字、render 从完整书单派生、原存储不变的方案。请记录这次设计批准并调用 submit_handoff 交给研发。研发按批准范围实现，交付可审查草稿 PR；真实触摸与读屏等未取得的人工证据如实保留，不能伪称已通过，也不阻止形成待审草稿。 |
| conclusion | 用户批准完整设计及所引用原型/HLD/契约/验证边界，授权立即通过注册工具交接研发；保持原顺序、名称后精确数字、render全量派生、原存储。真实触摸/读屏等缺失人工证据必须标明未取得，不伪称通过，不阻止形成待审草稿PR；不将草稿PR等同最终验收或合并 |
| status | Accepted |
| prerequisites | D-001～005 |
| descendants | 产品 LLD、实现、正式验证 |
| evidence | 2026-10-02 现有代码事实、实际原型 check 与截图；非产品验收 |
| source_coverage | traceability.md 全部来源均 Included/Merged/External/OutOfScope，无 Gap |
| validation | 原型计划通过、截图可审查；正式 AC、实际触摸与读屏由研发负责 |
| artifact_mapping | design/README.md 的完整审查文件集合、interaction.md、prototype/、hld.md、contracts.md |
| supersedes | none |

### 展示方案比较

已接受直接“名称 空格 数字”，不单独强调数字；未采用的另一方案是在名称旁增加胶囊徽标，会改变按钮视觉密度、需要独立背景及间距。两者都能表达精确数量，采用前者因为本需求要求沿用风格，用户已随完整设计包明确批准。持久化计数不是可选展示方案，已被上游约束排除。

### AR-001 写入核对

首次展示前已核对唯一 Asked 为 A-001。此次用户明确选择 A，回答无歧义映射至 A-001，设计索引、HLD、contracts及实际操作原型均在批准范围。保存后核对：A-001 Accepted、状态 Complete、活动轮次/未回答为 none、next=A-002，D-001～005 不变，无 Conflict/Frozen。仅同步批准状态与后续证据边界，不更改运行原型或技术方案；使用注册 submit_handoff，交接成功与否以工具回执为准。
