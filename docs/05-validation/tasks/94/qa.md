# Issue #94 独立 QA 报告

日期：2026-10-03。结论：**PASS，可交 report**。本轮未发现需退回的产品缺陷或环境阻塞；无需用户回答。结论仅针对本任务接受的范围，不代表合并、部署或全平台兼容认证。

## 1. 输入、方法与独立性

- 验收依据：[PRD / R-01～04 / AC-01～07](../../../04-implementation/tasks/94/prd.md)、[交互设计](../../../04-implementation/tasks/94/design/interaction.md)、[HLD](../../../01-architecture/tasks/94/hld.md)、[页面及数据契约](../../../01-architecture/tasks/94/contracts.md)、[LLD](../../../01-architecture/tasks/94/lld.md)、[实施计划](../../../04-implementation/tasks/94/implement.md)。不以研发的 validation.md 代替本次验证。
- 遵循已注入 AGENTS.md、项目文档索引与 frontend 的 book-state/filter-tooltips 规范。当前 `.harness/full.json` 未配置独立 qa Skill；采用其 review 配置的 `trellis-check` 执行变更、规范、检查、范围及数据边界核对，并执行 Runner 明确要求的 QA 浏览器与报告步骤。不修改产品或既有测试以使检查通过。
- 独立调用注册 `check` 对实际 `app` 执行 **16 份计划、846 个动作，全部 PASS**。复用上游计划属于复用测试步骤；`browser/qa-1-*` 是 QA 本轮新执行的原始结果，不是研发回执。补充本轮独立编写的 [320px 悬停截图计划](qa-narrow-hover-plan.json)。
- 注册 `verify` 本轮返回 “Product checks passed”，核对其 8 项命令退出码均为 0，冻结在 [qa-host-checks/checks.json](qa-host-checks/checks.json)。含 Prettier、ESLint、JS 语法、核心/新功能浏览器、13 项 Node 测试、8 项 local_deploy Python 测试及 diff 检查。QA 另独立运行同一组 Node 测试，13/13 PASS：[日志](qa-unit-tests.log)。本产品为无 TypeScript 的静态 JS，不存在本轮适用的类型检查命令；未修改 Python 产品代码。
- [qa-evidence.json](qa-evidence.json) 将每个计划与 performed 动作逐条比对，并记录每个原始回执、桌面/手机宽度截图的 SHA-256、设备属性、动作数和产品文件摘要。当前 QA 无浏览器失败；历史研发失败仍保留，不改写旧结论。

## 2. 逐项验收

| 条款 | 结果 | 本轮独立证据与边界 |
|---|---|---|
| AC-01 / R-01、02 | PASS | QA 1～3 真正 hover，不点击，停留 1 秒：三条固定文案可见且只显示当前入口；移入浮层停留 2 秒继续可读；Escape 连按隐藏，离开/重入恢复，离开隐藏。不是只检查 span 属性。 |
| AC-02 / R-01、03 | PASS | QA 1～3 覆盖全部/已读/未读选中范围 × 三入口共 9 组合；每次 hover 后 aria-pressed、中文书籍可见性、过滤条/列表/面板几何及存储不变。 |
| AC-03 / R-02 | PASS | QA 5～7 覆盖空清单、“还没有读完的书”、“没有未读的书”，每种状态均悬停三入口；固定解释不带数量/书名，原空状态及选中范围保持。 |
| AC-04 / R-03 | PASS | QA 9、10 检查 320/390/1440px 的三按钮及过滤条/列表/面板 hover 前后几何；QA 16 留存并实际查看 320px 解释截图，QA 8 查看桌面截图，QA 4 查看触屏截图，未见解释裁切、常态重排或新增横向溢出。标签/顺序/选中下划线保留。基线源码审计证明既有 CSS 布局规则逐字不变、HTML 仅增三个 span（忽略空白）。未宣称两个代码版本并行测量坐标或 scrollWidth 数值检查。 |
| AC-05 / R-03 | PASS | QA 11、12 混合清单实际点击：全部两本、已读仅已读、未读仅未读；QA 4 每次 tap 后断言 aria-pressed；QA 1～3 单纯 hover 无筛选改变。 |
| AC-06 / R-03 | PASS（Chromium 桌面与触屏模拟） | QA 11 真实 Tab/Enter/Space 到三按钮并激活，按原名称定位；QA 8 悬停不抢编辑输入焦点，Escape 同时保留原取消逻辑；QA 4 独立 hasTouch=true/isMobile=true、390px 上下文各入口仅一次 tap 即筛选，三浮层均隐藏。没有把缩放截图视为触屏测试。 |
| AC-07 / R-04 | PASS | QA 1～4、9、10、16 对实际产品存储做原值及调用观察；QA 1～4 包含跨 reload 断言，hover/仅筛选无新增写。QA 12～15 实际添加、标已读、改名、删除/撤销及刷新回归通过。QA 15 注入存储写失败，失败删除与失败撤销保留旧数据/撤销机会，解除故障重试成功。旧 JSON 扩展字段/未知字段兼容由本轮 Node 测试及业务源码逐字基线审计支持，不声称浏览器注入过扩展字段夹具。 |

**存储统计解释：**原始回执 `storageWrites` 是整份计划的调用尝试总数，设置夹具、增删改可以合法写入；“无新增写”是 snapshot_storage 之后的 unchanged_storage_writes 断言，包括跨刷新，而不是整份计划写次数为 0。空清单 QA 5 的整份计划才确实为 0。

## 3. 执行记录与复现步骤

每行结果均 PASS；按所列计划对 root=`app` 调用已注册 `check` 即可重跑。原始 JSON 包含按顺序执行的全部步骤、错误数组、设备和存储调用统计；每个目录另有 screenshot.png/mobile.png。完整路径与摘要见 qa-evidence.json。

| QA 回执 | 计划 | 核验路径 |
|---|---|---|
| [1](browser/qa-1-1/browser.json) | [browser-plan](browser-plan.json) | 添加一已读一未读 → 选全部 → 三入口纯 hover → 浮层 → Escape/重入 → 刷新 |
| [2](browser/qa-1-2/browser.json) | [hover-read](browser-hover-read.json) | 混合清单选已读 → 三入口纯 hover，保留原列表 |
| [3](browser/qa-1-3/browser.json) | [hover-unread](browser-hover-unread.json) | 混合清单选未读 → 三入口纯 hover，保留原列表 |
| [4](browser/qa-1-4/browser.json) | [touch](browser-touch.json) | 独立触屏上下文 → 混合清单 → 已读/未读/全部各一次 tap → 刷新 |
| [5](browser/qa-1-5/browser.json) | [hover-empty](browser-hover-empty.json) | 空清单 → 三入口 hover → 离开，空态保持 |
| [6](browser/qa-1-6/browser.json) | [hover-read-empty](browser-hover-read-empty.json) | 仅未读书 → 选已读无结果 → 三入口 hover |
| [7](browser/qa-1-7/browser.json) | [hover-unread-empty](browser-hover-unread-empty.json) | 仅已读书 → 选未读无结果 → 三入口 hover |
| [8](browser/qa-1-8/browser.json) | [hover-editor](browser-hover-editor.json) | 编辑草稿并保持输入焦点 → hover → Escape → 原名保留 → 重入 |
| [9](browser/qa-1-9/browser.json) | [layout](browser-layout.json) | 320/390px：面板、列表与筛选条 hover 前后边界保持 |
| [10](browser/qa-1-10/browser.json) | [button-geometry](browser-button-geometry.json) | 1440/320/390px：三个按钮 hover 前后边界保持 |
| [11](browser/qa-1-11/browser.json) | [click-keyboard](browser-click-keyboard.json) | 点击、写故障下筛选、刷新、Tab/Enter/Space、320px 点击 |
| [12](browser/qa-1-12/browser.json) | [Owner 核心](../../../../tests/browser/core.json) | 添加、标已读、刷新、筛选、删除 |
| [13](browser/qa-1-13/browser.json) | [#71 键盘](../71/browser-keyboard-plan.json) | 空白改名拒绝、键盘保存、取消、Escape |
| [14](browser/qa-1-14/browser.json) | [#82 主线](../82/browser-plan.json) | 删除恢复、状态/筛选、连续删除、编辑草稿、输入校验、刷新失效 |
| [15](browser/qa-1-15/browser.json) | [存储失败](../82/product-storage-failure-plan.json) | 失败删除/撤销 → 原值保持 → 解故障 → 重试 → 刷新与筛选 |
| [16](browser/qa-1-16/browser.json) | [QA 窄屏补验](qa-narrow-hover-plan.json) | 320px：三入口 hover → 移入已读浮层 2 秒 → 几何/存储保持 → 留存截图 |

## 4. 截图与日志

已用本地图片查看工具实际打开以下三张，不以工具返回文件路径代替视觉检查：

- [桌面 1440px：全部解释可见，编辑取消后原书名和焦点保留](browser/qa-1-8/screenshot.png)。
- [窄屏 320px：已读解释可见、浮层未被裁切、原选中全部和列表保留](browser/qa-1-16/screenshot.png)。这是精细指针窄屏，不是触屏。
- [390px 触屏模拟：三入口无浮层，混合清单和原布局保留](browser/qa-1-4/mobile.png)。触屏证明来自 QA 4 的 device/tap 断言，不来自 PNG。
- [独立基线审计](qa-baseline-audit.json)：基线 `82ec5a7653d57939df276058b7cbf465bfe8c90c`；剥离提示监听后业务 JS 逐字一致，去除新增提示 CSS 后布局规则逐字一致，HTML 忽略空白仅增 span，Owner 核心计划未降低断言。
- [13 项 Node 测试](qa-unit-tests.log)、[宿主机命令回执](qa-host-checks/checks.json)、[格式检查](qa-host-checks/check-1.log)、[ESLint](qa-host-checks/check-2.log)、[Node](qa-host-checks/check-6.log)、[8 项 Python](qa-host-checks/check-7.log)。Python 日志中的 404 是该部署测试的隔离/路径边界场景，整组测试为 OK，不是当前产品请求失败。

## 5. 登录、权限与未测范围

- 登录成功/错误凭据/退出/未登录边界：**不适用**。核对项目现状、HLD、页面和实际浏览器产品，当前无账号、登录入口或后端鉴权；本地浏览器 localStorage 是数据边界。未虚构账号、凭据或通过证据。
- 本轮以注册 Chromium 执行。物理手机、Firefox/Safari、系统 IME、屏幕阅读器朗读、可访问性认证未测；PRD 未承诺这些专项，不新增阻塞门槛，也不写为通过。
- 未验证当前线上/本地部署版本；基线是仓库中的明确提交，非线上观察。`deploy/release.json` 的 none 与不迁移/不清空/原业务源码不变及本轮回归相符，但声明不等于发布授权。
- 本轮不做新的后端/GPU/性能压测或安全专项结论；产品无新增后端/GPU依赖。本轮没有用户待答事项。

## 6. 放行与自主决策

R-01～04、AC-01～07 与接受设计契约全部在上述边界内通过；无已证实缺陷，因此不退回上游。QA 仅新增验证计划、报告与证据，没有改产品代码、既有测试、Git 分支/提交/推送，也没有直接调用 GitHub。

自主依据：Runner 本轮明确选择自主推进，必需 QA 条件全部通过后自动 `submit_handoff(target_stage=report)`；复用已审查的计划独立重跑并补窄屏截图，是可逆验证选择，不扩大产品范围，不伪造用户逐项批准。以工具回执为实际交接依据，交接后不再编辑共享文件。由交付流程处理 PR，最终合并及高风险部署仍需人工授权。
