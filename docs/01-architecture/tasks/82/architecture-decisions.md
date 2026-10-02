# Issue #82 架构决策与恢复台账

> Complete · Accepted · 2026-10-02。用户已批准修订设计和交接研发；执行结果以注册工具回执为准。

| 检查点 | 值 |
|---|---|
| 当前架构层级 | 5（同页实现映射），G2 HLD READY 自查 |
| 最近完成轮次 | R-001：用户批准修订设计包及进入研发 |
| 活动轮次 | none |
| 活动问题 / 未回答 ID | none |
| next_id | A-005 |
| 恢复说明 | A-002 已获明确批准，不重复确认需求或设计。使用正式工具交接研发；产品验收仅按 PRD 与精简故障方案，内部守卫单独表述。 |

## 决策依赖图

```text
需求 D-001/002/003（已批准）→ A-001（继承边界）
                    ↓
当前代码事实＋来源覆盖＋原型验证 A-003 → A-002（整包设计批准）
                                              ↓
                                        研发 LLD/计划/实现
```

### A-001：既有本地产品和单份撤销边界

- architecture_layer：0～4；semantic_key：undo82.confirmed-scope；decision_type：Fact；status：Accepted（仅继承需求，不是 Agent 替 Owner 新批准）。
- question/options/recommendation：本轮不重问；来源为 D-001～D-003 原始回答。
- user_answer：见需求台账；用户已经明确批准“仅最近成功删除、刷新失效、不计时、冲突 A、完整序位及真实失败验证”。
- conclusion：无后端/账号/历史栈，恢复原 title/read，序位取完整清单，冲突和失败保留机会，不改变动作时筛选；正常动作不清机会。
- prerequisites：D-001～D-003；descendants：A-002；supersedes：none。
- evidence：批准 PRD 与需求台账，2026-10-02；静态 app/ 本地存储实现。
- source_coverage：HLD §2 全覆盖目标/US/BR/QR/AC/外部依赖与非目标，无 Gap。
- architecture_impact/artifact_mapping：HLD §1～4、contracts §1～4；约束后续交互/状态实现。
- validation：产品 14 项 AC，由研发执行，不重复请求业务审批。

### A-002：本次设计包的交互和实现映射

- architecture_layer：3～5；semantic_key：undo82.design-package；decision_type：Decision；status：Accepted。
- question：请审查原型、HLD、契约与验证记录，是否批准这份设计，并授权通过交接工具进入研发？
- options：A 批准整包设计并授权交接研发；B 提出需要修改的设计点，保留在设计阶段。
- recommendation：A；常驻撤销栏独立于普通反馈，复用既有 persist 和内存单记录，保持现存对象引用/草稿，明确焦点去向。理由是最小变更可承接已批准规则，七份原型浏览器计划通过。成立条件：产品阶段补齐真实 AC，不把原型当产品通过。
- user_answer：“已审查修订后的设计包、故障验证计划和 G2 整改记录，也已在原型网页验证同名冲突、改名后恢复、写入失败后同页重试。批准当前修订版设计及已明确的焦点、草稿保留规则，授权进入研发，请通过交接工具继续。真实产品验收保持 PRD 范围，使用正式 check 的存储故障动作；内部守卫测试与用户旅程分开表述，不增加首页替换或额外审批。”
- conclusion：修订整包、焦点和草稿规则 Accepted，明确授权交接研发；产品验证沿用 PRD，正式 check 故障动作，不新增宿主、额外门槛或审批。
- prerequisites：A-001、A-003 验证证据；descendants：研发 LLD/计划；supersedes：none。
- architecture_impact：不改变运行形态/数据格式，新增独立反馈和内存机会；设计批准后研发据此细化。
- source_coverage：HLD §2；traceability 全部 14 AC 有承接，非目标显式排除。
- evidence：原型实际浏览器 7 计划/279 动作，截图和失败归因见 design-validation.md；没有产品验收证据。
- validation：用户审查视觉、状态、焦点/草稿提案和契约；批准后真实产品故障测试仍必须执行。
- artifact_mapping：design/README.md 索引中的本次审查集合；hld §5、contracts、interaction、prototype。

### A-003：原型交互与故障技术验证

- architecture_layer：5；semantic_key：undo82.prototype-validation；decision_type：Validation；status：Complete（证据完成状态，不是架构批准）。
- question/options：无用户问题；事实调查由设计自行执行。
- recommendation/conclusion：在隔离键和原型运行时 actual setItem 抛错，真实点击删除/撤销、观察状态/持久 JSON、解除注入重试/刷新；界面机制可行。
- user_answer：不适用；prerequisites：批准 PRD；descendants：A-002；supersedes：none。
- evidence：最终快照复验 design-1-12～18 browser.json 和截图，errors=[]；历史 design-1-1～11 全部保留；原型 JS 语法检查通过。
- source_coverage：AC-01～14 的设计承接与原型证据/局限见 traceability。
- architecture_impact/artifact_mapping：HLD §4～6，fault-validation-plan 和设计验证报告。
- validation/退出条件：原型技术验证完成；真实产品未修改，必须由研发在最终 app/ 源码上重做，真实屏幕阅读器/IME 不以 fill 代替。

## 方案和 ADR 适用性

方案比较见 HLD §5。没有新供应商、公开接口、难逆数据格式或部署选择；本轮把可逆的交互/实现方案保留在台账，不另建没有实际价值的 ADR 文件。未裁剪原型/HLD/契约/追溯/记录/索引和验证产物。无业务开放问题；修订整包已获批准，研发产品验收为 NEXT STAGE。

## A-004：用户授权精简正式故障验证路径

- decision_type：Decision；semantic_key：undo82.validation-scope-correction；status：Accepted；来源为用户本轮明确修订要求，不重问。
- user_answer：“请以这一正式工具路径精简故障验证方案，不复制产品实现、不临时替换首页，也不要额外增加验收门槛。必要的内部守卫可以独立单元检查，不能写成真实用户操作。整理好设计包后给我审查，再进入研发。”
- conclusion：用 storage_write_failure、snapshot_storage/unchanged_storage、真实 UI 与同页关闭重试/刷新承接原 AC；撤销 iframe/首页替换、第二异常和内部深比较等额外门槛。原型交互不改；该轮整改后再次提交审查，现 A-002 已获最终批准。
- prerequisites：批准 PRD 与用户当前审查；descendants：A-002 修订整包；artifact_mapping：fault-validation-plan、product-storage-failure-plan、contracts、HLD、traceability、G2/索引和设计验证。
- evidence/validation：注册工具在原型执行 design-1-19，69/69 Passed；尚未在 app/ 执行。产品 AC 不扩展，内部单元检查与用户旅程明确区分。

## R-001 批准记录

本轮回复无歧义映射到 A-002（Accepted）；A-004 的精简规则保留。无未回答项；已将 HLD、契约、交互及索引状态同步，产品代码和原型源码未变。交接使用注册 submit_handoff，成功或失败以工具回执为准。
