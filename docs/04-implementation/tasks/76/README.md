# Issue #76：书籍清单页 UI 与动效改版

需求阶段已获用户批准：A「现代编辑式书房」、PRD v1 与补充默认验收边界均已确认；用户授权进入设计，注册工具交接结果以执行回执为准。

## 本次审查文件

- [PRD v1](prd.md)：页面范围、目标、业务规则、FR／QR、User Story、AC 和设计输入。
- [需求决策与澄清记录](requirements-decisions.md)：原始边界、源码事实、方向选择及需求基线批准记录。
- [G1 自查](g1-review.md)：完整性与一致性结论、缺口、约束和批准状态。
- 本索引：审查材料集合及下游预期路径。

## 复用材料

- [项目现状](../../../00-global/project.md)；行为以当前 `app/index.html`、`app/app.js`、`app/styles.css` 为事实基线。
- [Issue #71 PRD](../71/prd.md) 与 [已接受规则](../71/requirements-decisions.md)：复用编辑、校验、草稿和失败语义；本轮视觉方向取代 #71 旧风格延续要求。
- [Issue #71 原型说明](../71/prototype/README.md) 与 [设计索引](../71/design/README.md)：仅为已有编辑交互参考，不能代替 #76 的新原型和设计确认。
- [Issue #71 验证记录](../../../05-validation/tasks/71/validation.md)：历史证据与限制，不表示本轮验证通过。

## 设计阶段产物（已获用户批准，授权交接研发）

- 设计：[完整设计索引](design/README.md)；[可运行原型](prototype/README.md)、视觉与交互／动效取舍、状态及截图证据。
- 架构与契约：[HLD](../../../01-architecture/tasks/76/hld.md)、[契约](../../../01-architecture/tasks/76/contracts.md)、决策台账和16AC追溯；不由需求摘要代替。
- [设计验证](../../../05-validation/tasks/76/design-validation.md)：九份注册浏览器计划最终通过、192个动作；[G2自查](design/g2-review.md)材料完整且G2 HLD READY，A-001已接受（用户「ok 继续推进吧」）。系统偏好、真实IME及产品旧数据／失败断言仍属研发验收。
- 开发：任务实施计划、拆解、LLD 与契约细化；`docs/05-validation/tasks/76/validation.md` 索引实际浏览器及功能证据。

用户已批准需求及设计v1，并授权通过注册工具交接研发；设计批准原文「ok 继续推进吧」与范围见A-001。交接执行结果以工具回执为准。Runner 最终发布任务分支及草稿 PR，不直接合并。

## 研发交付（Ready for Review）

- [实施计划与公共任务包](implement.md)：M1/M2/M3与T1/T2/T3状态、依赖、范围、自查和人工缺口。
- [LLD](../../../01-architecture/tasks/76/lld.md)：DOM、事务/焦点、动画取消/API降级；批准契约保持不变。
- [产品验证](../../../05-validation/tasks/76/validation.md)：最终26组集成、四宽度公开流程、核心/键盘回归、失败/动画测量与截图索引。
- [复现入口](../../../05-validation/tasks/76/tests/README.md)、[研发实际文件集合](../../../05-validation/tasks/76/development-artifacts.txt)：新建/更新/复用及证据由审计清单定位。
- app/实现已完成；人工系统偏好切换/IME/读屏/真机尚待验收；共享复验shell端口绑定受限，不能声称完整门禁通过。Runner正式复验/草稿PR与注册交接以工具回执为准，不直接合并，不重复审批上游决定。
