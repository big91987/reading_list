# Issue #74 设计审查索引

状态：用户已批准完整设计 A-001 并明确授权立即交接研发，G2 HLD READY；交接执行以注册工具回执为准。需求D-001～005已批准，无需重复审批需求或设计。

## 方案摘要

沿用现有“全部 / 未读 / 已读”，名称后直接跟精确数字，如“全部 3 / 未读 2 / 已读 1”。保持原纸色、字体、选中底线；数字来自完整成功恢复/保存的书单。不新增搜索、后端或存储字段。320px四位数允许整按钮换行，不隐藏或近似数字。

## 审查顺序与完整产物

1. [交互规范](interaction.md)：展示、关键行为、手机布局、可访问性、原型与产品边界。
2. [可运行原型说明](../prototype/README.md)和[入口](../prototype/index.html)：运行依赖与操作说明；app.js、styles.css、layout.js及8份check计划是完整运行/检查依赖。
3. [HLD](../../../../01-architecture/tasks/74/hld.md)：责任、事实源、流程、部署、失败恢复、质量、演进与研发输入。
4. [数据与界面契约](../../../../01-architecture/tasks/74/contracts.md)：原存储键/结构、派生不变量、成功失败语义、DOM兼容。
5. [设计决策](../../../../01-architecture/tasks/74/architecture-decisions.md)与[追溯](../../../../01-architecture/tasks/74/traceability.md)：继承已批准边界、已接受设计A-001、全来源覆盖及后续验证责任。
6. [真实验证报告](../../../../05-validation/tasks/74/design-validation.md)、[源文件快照](../../../../05-validation/tasks/74/design-snapshot.json)、[G2自查](g2-review.md)：222动作通过、迭代失败/修正、截图审查与验证边界。
7. [审查文件清单](artifacts.md)：完整真实文件集合，包括全部浏览器结果/截图、运行依赖及复用上游。

## 推荐查看的截图

- [1280px样例](../../../../05-validation/tasks/74/browser/design-1-9/screenshot.png)
- [320px样例](../../../../05-validation/tasks/74/browser/design-1-11/screenshot.png)
- [320px四位数／样例／零状态](../../../../05-validation/tasks/74/browser/design-1-16/screenshot.png)
- [390px四位数同排](../../../../05-validation/tasks/74/browser/design-1-13/mobile.png)
- [320px键盘焦点与已读筛选](../../../../05-validation/tasks/74/browser/design-1-12/screenshot.png)
- [保存失败不改数](../../../../05-validation/tasks/74/browser/design-1-14/screenshot.png)、[空书单已读0可选](../../../../05-validation/tasks/74/browser/design-1-15/screenshot.png)

## 本轮新建、更新、复用

新建：本任务prototype/完整运行文件及计划；design/索引、交互、自查、清单；architecture/tasks/74的HLD、契约、决策、追溯；validation/tasks/74的验证报告、源快照和真实浏览器证据。

更新：任务74/README.md与docs/README.md仅补设计入口/当前状态。复用：已批准PRD、需求台账、G1，当前app三文件（未修改），既有Issue #71资料（历史状态不覆盖当前代码）。无裁剪约定产物，不新增第二需求事实源。

## 本轮设计批准（A-001）

是否确认本次设计：沿用现有样式与顺序，在按钮名称后直接显示精确数量，并按所附原型、HLD、契约及验证边界进入研发？

- A：确认这份设计并进入研发。
- B：先调整设计，指出要改的展示或方案（暂不交接）。

用户已明确选择 A，确认完整设计并授权调用submit_handoff交给研发；原回答及批准范围保存在设计决策台账，不再次询问。用户已审查上述设计索引、HLD、contracts并表示实际操作原型；研发按批准方案实现并交付可审查草稿PR。真实触摸与读屏等未取得人工证据如实保留，不伪称已通过，不阻止形成待审草稿；草稿不等于最终验收或合并。工具结果才证明实际交接完成。
