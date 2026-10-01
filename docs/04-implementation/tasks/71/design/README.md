# Issue #71 设计审查索引

> v1 · Accepted · 2026-10-02。上游 PRD与本设计包均获用户批准；Escape 补测通过，已授权直接交接研发，执行结果以注册工具返回为准。

## 先看这些

1. [原型运行说明](../prototype/README.md)／[原型入口](../prototype/index.html)：可在浏览器实际新增、改名、取消、筛选、删除和模拟失败重试。
2. [交互规范](interaction.md)：原位表单、手机布局、错误、成功、焦点与关键状态。
3. [HLD](../../../../01-architecture/tasks/71/hld.md)／[本地数据与操作契约](../../../../01-architecture/tasks/71/contracts.md)：责任、流程、兼容、失败门槛和编辑协调。
4. [架构决策台账](../../../../01-architecture/tasks/71/architecture-decisions.md)／[需求追溯](../../../../01-architecture/tasks/71/traceability.md)：A-001～003均为Accepted，已批准需求不重复。
5. [实际验证与截图](../../../../05-validation/tasks/71/design-validation.md)／[G2自查](g2-review.md)：七组最终浏览器通过，192个动作，失败记录与后续证据缺口完整保留。

## 本轮真实文件集合

### 新建设计与运行依赖

- `docs/01-architecture/tasks/71/hld.md`
- `docs/01-architecture/tasks/71/contracts.md`
- `docs/01-architecture/tasks/71/architecture-decisions.md`
- `docs/01-architecture/tasks/71/traceability.md`
- `docs/04-implementation/tasks/71/design/README.md`
- `docs/04-implementation/tasks/71/design/interaction.md`
- `docs/04-implementation/tasks/71/design/g2-review.md`
- `docs/04-implementation/tasks/71/prototype/README.md`
- `docs/04-implementation/tasks/71/prototype/index.html`
- `docs/04-implementation/tasks/71/prototype/styles.css`
- `docs/04-implementation/tasks/71/prototype/app.js`
- `docs/04-implementation/tasks/71/prototype/check-desktop.json`
- `docs/04-implementation/tasks/71/prototype/check-mobile.json`
- `docs/04-implementation/tasks/71/prototype/check-errors.json`
- `docs/04-implementation/tasks/71/prototype/check-keyboard.json`
- `docs/04-implementation/tasks/71/prototype/check-coordination.json`
- `docs/04-implementation/tasks/71/prototype/check-failure.json`
- `docs/04-implementation/tasks/71/prototype/check-escape.json`
- `docs/05-validation/tasks/71/design-validation.md`
- `docs/05-validation/tasks/71/screenshot-manifest.json`：16张原始PNG的实际路径、字节数和SHA-256，用于UTF-8交接快照引用。

### 新建真实浏览器证据

每行三个链接都是本次审查／后续 handoff 的真实文件；保留一次失败和重跑证据，不只提交摘要。

| 运行 | 结果文件 | 最终视口截图 | 工具补充手机截图 |
|---|---|---|---|
| design-1-1 | [browser.json](../../../../05-validation/tasks/71/browser/design-1-1/browser.json) | [screenshot.png](../../../../05-validation/tasks/71/browser/design-1-1/screenshot.png) | [mobile.png](../../../../05-validation/tasks/71/browser/design-1-1/mobile.png) |
| design-1-2 | [browser.json](../../../../05-validation/tasks/71/browser/design-1-2/browser.json) | [screenshot.png](../../../../05-validation/tasks/71/browser/design-1-2/screenshot.png) | [mobile.png](../../../../05-validation/tasks/71/browser/design-1-2/mobile.png) |
| design-1-3 失败保留 | [browser.json](../../../../05-validation/tasks/71/browser/design-1-3/browser.json) | [screenshot.png](../../../../05-validation/tasks/71/browser/design-1-3/screenshot.png) | [mobile.png](../../../../05-validation/tasks/71/browser/design-1-3/mobile.png) |
| design-1-4 重跑 | [browser.json](../../../../05-validation/tasks/71/browser/design-1-4/browser.json) | [screenshot.png](../../../../05-validation/tasks/71/browser/design-1-4/screenshot.png) | [mobile.png](../../../../05-validation/tasks/71/browser/design-1-4/mobile.png) |
| design-1-5 | [browser.json](../../../../05-validation/tasks/71/browser/design-1-5/browser.json) | [screenshot.png](../../../../05-validation/tasks/71/browser/design-1-5/screenshot.png) | [mobile.png](../../../../05-validation/tasks/71/browser/design-1-5/mobile.png) |
| design-1-6 | [browser.json](../../../../05-validation/tasks/71/browser/design-1-6/browser.json) | [screenshot.png](../../../../05-validation/tasks/71/browser/design-1-6/screenshot.png) | [mobile.png](../../../../05-validation/tasks/71/browser/design-1-6/mobile.png) |
| design-1-7 | [browser.json](../../../../05-validation/tasks/71/browser/design-1-7/browser.json) | [screenshot.png](../../../../05-validation/tasks/71/browser/design-1-7/screenshot.png) | [mobile.png](../../../../05-validation/tasks/71/browser/design-1-7/mobile.png) |

| design-1-8 Escape补测 | [browser.json](../../../../05-validation/tasks/71/browser/design-1-8/browser.json) | [screenshot.png](../../../../05-validation/tasks/71/browser/design-1-8/screenshot.png) | [mobile.png](../../../../05-validation/tasks/71/browser/design-1-8/mobile.png) |

### 更新与复用

更新 `docs/README.md` 和 `docs/04-implementation/tasks/71/README.md`，只添加设计审查入口与阶段进度。

复用且不修改 [PRD](../prd.md)、[需求决策](../requirements-decisions.md)、[G1自查](../g1-review.md)、项目现状、`app/index.html`／`app/app.js`／`app/styles.css` 与 `.harness/reading-core.json`。原型的 HTML／基础 CSS 来自现有产品，无第三方图片素材或外部字体依赖。没有修改产品代码或 Harness／工作流，没有新后台。

## 确认范围与交接

本次原型布局、HLD与契约的设计细化（A-001～003）已获用户明确批准；不重复需求或设计审批。真实产品实现和尚缺的验收证据由研发完成，见验证报告；没有裁剪约定设计交付物。

用户明确批准后已更新本索引、HLD／contracts、台账和 G2 的审批状态，保持需求原基线；本轮 Escape 补测是证据追加而非设计变更，按用户授权直接通过注册 `submit_handoff` 提交上游基线、设计与全部真实证据。工具返回成功才报告交接成功；不自行提交、推送、创建PR或调用GitHub。

工具传输范围：首次包含PNG的交接调用被拒绝，返回“handoff supports at most 5 MiB of UTF-8 documents”，未报告交接成功。按工具UTF-8文档约定，改交33份文本文件（含8份真实browser.json和截图校验索引）；16张原始PNG仍保留共享工作区，以上截图链接和校验索引供研发直接读取、核验，不宣称PNG已由工具快照。该传输调整不裁剪原型或证据，不改变已批准设计。
