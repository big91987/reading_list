# Issue #76 设计包索引 v1

> 2026-10-02 · 设计材料完成并已做原型检查／G2自查；具体设计 **Accepted（A-001）**：用户「ok 继续推进吧」批准本包并授权交接研发；不表示产品实施或验收，交接结果以注册工具回执为准。上游A方向与需求基线已批准，不重复询问。

## 先看与体验

1. [下载后直接打开的单文件原型](../prototype/preview.html)；[可运行原型与运行说明](../prototype/README.md)，源入口 [index.html](../prototype/index.html)。本机HTTP服务受沙箱限制未启动，不能提供已在线的URL，不是公开部署。
2. [正常桌面截图](../../../../05-validation/tasks/76/browser/design-1-13/screenshot.png)、[正常手机截图](../../../../05-validation/tasks/76/browser/design-1-13/mobile.png)、[手机编辑](../../../../05-validation/tasks/76/browser/design-1-10/mobile.png)、[手机保存失败](../../../../05-validation/tasks/76/browser/design-1-16/mobile.png)。
3. [视觉／交互与动效取舍](interaction.md)：桌面侧栏＋网格、手机紧凑单栏、完整书名、克制入场／筛选／反馈；省略删除退出动画，不人为加载。

## 完整产物（没有裁剪）

| 事实／文件 | 权威入口 | 本轮处理 |
|---|---|---|
| 具体视觉、交互、响应式、状态、动效取舍 | [interaction.md](interaction.md) | 新建；A-001已批准 |
| 原型说明、三运行文件与单文件导出 | [README](../prototype/README.md)、[HTML](../prototype/index.html)、[CSS](../prototype/styles.css)、[JS](../prototype/app.js)、[preview](../prototype/preview.html) | 新建；导出不成为第二事实源，隔离存储、无外部依赖 |
| HLD所有必要视图、逻辑／部署／故障／技术取舍 | [hld.md](../../../../01-architecture/tasks/76/hld.md) | 新建；承接既有边界，具体设计已批准 |
| 数据、命令、草稿、错误、并发和可访问性契约 | [contracts.md](../../../../01-architecture/tasks/76/contracts.md) | 新建；无新增HTTP API/JSON字段 |
| 决策及依赖图、恢复检查点 | [decisions.md](../../../../01-architecture/tasks/76/decisions.md) | 新建；A-001已接受，无未答项 |
| 16AC来源与研发验证追溯 | [traceability.md](../../../../01-architecture/tasks/76/traceability.md) | 新建；Covered不等于产品通过 |
| G2材料自查和用户批准门槛 | [g2-review.md](g2-review.md) | 新建；技术完整，用户批准门槛已满足 |
| 真实验证、失败历史、截图与限制 | [design-validation.md](../../../../05-validation/tasks/76/design-validation.md) | 新建；九计划192动作，原型证据 |
| 审查真实文件清单 | [artifacts.txt](artifacts.txt) | 新建；列出本包实际文件，供后续交接快照选择 |
| 公共／任务索引 | [docs/README](../../../../README.md)、[任务README](../README.md) | 更新入口，不改已批准产品决策 |

## 九份浏览器计划与证据

计划均位于prototype/；每个结果目录包括真实browser.json、screenshot.png、mobile.png，详见验证报告。

- [desktop](../prototype/check-desktop.json) → [结果9](../../../../05-validation/tasks/76/browser/design-1-9/browser.json)
- [mobile](../prototype/check-mobile.json) → [结果10](../../../../05-validation/tasks/76/browser/design-1-10/browser.json)
- [states](../prototype/check-states.json) → [结果11](../../../../05-validation/tasks/76/browser/design-1-11/browser.json)
- [density](../prototype/check-density.json) → [结果12](../../../../05-validation/tasks/76/browser/design-1-12/browser.json)
- [visual](../prototype/check-visual.json) → [结果13](../../../../05-validation/tasks/76/browser/design-1-13/browser.json)
- [keyboard](../prototype/check-keyboard.json) → [结果14](../../../../05-validation/tasks/76/browser/design-1-14/browser.json)
- [empty](../prototype/check-empty.json) → [结果15](../../../../05-validation/tasks/76/browser/design-1-15/browser.json)
- [failure](../prototype/check-failure.json) → [结果16](../../../../05-validation/tasks/76/browser/design-1-16/browser.json)
- [motion](../prototype/check-motion.json) → [结果17](../../../../05-validation/tasks/76/browser/design-1-17/browser.json)

browser/design-1-1～8保留中间通过及两次失败整改过程，不作为最终成功证据。全量真实文件名列于artifacts.txt；原型说明列运行依赖，验证报告列截图与证据边界，不拿文字线框或#71旧原型替代本次原型。

## 复用且不重复批准

- [本任务PRD](../prd.md)、[需求决策](../requirements-decisions.md)、[G1](../g1-review.md)：上游已批准，保持内容不变。
- [项目现状](../../../../00-global/project.md)、当前app/三文件：业务事实来源，产品代码未改。
- [#71契约](../../../../01-architecture/tasks/71/contracts.md)、[#71 PRD](../../71/prd.md)、[#71决策](../../71/requirements-decisions.md)、[#71验证](../../../../05-validation/tasks/71/validation.md)：复用规则／历史边界，不把历史证据当本轮产品通过。
- 本阶段方法：Owner的platform-architecture-v2-cn及已启用reviewing-design-and-plans-cn，必读HLD视图／来源追溯／决策／输出参考已读取；没有额外原型Skill配置，沿用批准PRD与既有原型交互规则。本轮未裁剪约定交付物。

## 用户批准与研发责任

**用户「ok 继续推进吧」已批准设计v1并授权交接研发（A-001 Accepted）。** 原始问题、答复映射和批准范围见决策台账，无须再次批准A方向或本设计。

尚未进行产品实施、真实产品旧数据／存储断言、系统偏好实际切换、真机／读屏／IME或GPU与精确事件时序验收；均已列出研发责任，不声称全部AC通过。本次批准已收到，立即通过已注册submit_handoff交接。工具执行审批不代替此设计批准；失败必须报告，不宣称下一阶段已开始。
