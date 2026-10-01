# Issue #71：修改已有书籍的书名

需求与设计基线均已批准（D-001～003、补充默认行为、A-001～003），不重复审批。研发已实现原条目修改书名；18组真实浏览器集成测试、桌面/手机62动作、键盘29动作和固定主线16动作通过。AC-12系统IME/真实读屏人工证据仍Partial/待人工验收；用户已明确授权以待审查草稿PR为本轮目标立即交接Runner正式复验、提交任务分支和创建草稿PR。T03 In Review/M03 Ready for Review，未宣布完整验收、发布或合并；交接与PR结果按工具实际返回报告。

## 本轮审查文件

- [PRD、User Story 与 AC](prd.md)：唯一需求结果契约。
- [产品决策及澄清记录](requirements-decisions.md)：已确认事项、默认提案、用户答复与恢复检查点。
- [G1 自查](g1-review.md)：完整性、追溯、缺口与审批状态。
- [设计审查索引](design/README.md)：完整原型、运行依赖、HLD、契约、决策、追溯、G2 自查及真实浏览器结果／截图集合。
- [实施计划、里程碑和任务包](implement.md)：唯一研发公共状态，T01/T02 Done、T03 In Review；用户已授权草稿PR交接，M03/G4未完全接受。
- [LLD](../../../01-architecture/tasks/71/lld.md)：DOM、焦点、草稿、候选写入与目标重绑的实现细化。
- [产品验证与交接限制](../../../05-validation/tasks/71/validation.md)：全部AC追溯、真实证据、失败归因、复现步骤及人工缺口。

## 复用的项目依据

- [项目文档索引](../../../README.md) 与 [现有产品基线](../../../00-global/project.md)。
- 仓库 `app/index.html`、`app/app.js`、`app/styles.css`：现有功能、数据和视觉风格来源；没有既有编辑原型可复用。
- 仓库 `.harness/reading-core.json`：既有用户主线回归依据，不代替本任务 AC。

## 阶段产物路径

- 设计索引：`docs/04-implementation/tasks/71/design/README.md`。
- 可运行交互原型、运行依赖和证据：`docs/04-implementation/tasks/71/prototype/`。
- HLD、契约及架构记录：`docs/01-architecture/tasks/71/`。
- 设计验证：`docs/05-validation/tasks/71/design-validation.md` 及浏览器证据。
- 研发计划与任务拆解：本任务 `implement.md`；LLD 与契约细化：上述架构任务目录 `lld.md`。
- 研发验证：`docs/05-validation/tasks/71/validation.md`、指定 `browser-plan.json`、附加键盘/集成计划、原始浏览器结果和截图哈希清单。

用户已确认需求，通过注册的交接工具推进设计，不重复审批需求；设计须另经用户审查。开发完成后 Runner 发布任务分支和草稿 PR，不直接合并。
