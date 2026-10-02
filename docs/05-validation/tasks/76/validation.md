# Issue 76 产品验证与研发交付

日期：2026-10-02。阶段：development，Ready for Review；已实现批准设计、可执行自动检查完成，人工验收与 Runner 正式复验待完成，非已合并/已上线。

## 实现与设计一致性

`app/index.html` 重做刊头、概览/新增侧栏、主书架；`app/styles.css` 使用批准色值、网格/断点、完整长名、常显44px管理入口；`app/app.js` 复用原事务式管理、存储键/JSON/顺序/扩展字段，增加状态文字、错误语义、空入口与可取消的有界入场。没有示例数据/故障开关/真实封面/搜索/账号/后端/外部请求。无布局、动效取舍或业务承诺偏差；Web Animations 替代原型 CSS 入场仅为生命周期细化，与批准时长/缓动一致。省略删除退出、编辑运动、假加载不变。

索引：[实施与任务包](../../../04-implementation/tasks/76/implement.md)、[LLD](../../../01-architecture/tasks/76/lld.md)、[批准设计](../../../04-implementation/tasks/76/design/README.md)、[原型证据](design-validation.md)。复用上游，不重开批准。

## 环境与证据等级

注册 `check` 在真实隔离 HTTP 产品源运行，浏览器报告 UA 为 HeadlessChrome/145.0.7632.6（macOS UA）；不是 Safari/Firefox/真机。最终 [26组报告](browser/development-1-18/download-1.json) 含 UA、协议、原生偏好观测、快照断言、四宽度/动效测量。真实 fill/click/reload/Tab/Enter/Space/Escape 与 fixture 内同步 DOM 事件分开记录；后者用于严格在动画运行中连续操作。没有后端或 GPU 测试。

## 最终浏览器结果

| 范围与可复现计划 | 最终结果 | 原始记录 |
|---|---|---|
| tests/browser/core.json；从受保护 .harness/reading-core.json 原样复制 | 16动作通过，原主线动作和断言不改 | [core](browser/development-1-20/browser.json) |
| [browser-plan.json](browser-plan.json)；1440完整流程及六本混合书架 | 53动作通过 | [feature](browser/development-1-21/browser.json) |
| [320](browser-flow-320.json)/[390](browser-flow-390.json)/[768](browser-flow-768.json) 完整新增、空状态、去重、筛选、读/未读、编辑错误/取消、删除、刷新 | 各38动作通过 | [320](browser/development-1-22/browser.json)、[390](browser/development-1-23/browser.json)、[768](browser/development-1-24/browser.json) |
| [键盘](browser-keyboard-plan.json)：初始定位后通过实际键盘完成全部管理旅程 | 33动作通过（fill 输入文字，不声称系统IME） | [keyboard](browser/development-1-25/browser.json) |
| [产品集成](browser-integration-plan.json)：真实 DOM/Storage 与词法内存快照 | 26/26组通过，页面错误0；4注册动作含报告下载 | [integration](browser/development-1-18/browser.json)、[report](browser/development-1-18/download-1.json) |
| [四类管理写失败截图流程](browser-failure-plan.json)：实际产品 Storage 写入被拒 | 13动作通过，无假成功 | [failure](browser/development-1-19/browser.json) |
| [visual320](browser-visual-320.json)/[390](browser-visual-390.json)/[768](browser-visual-768.json)/[1440](browser-visual-1440.json) | 各16动作通过，六本/完整长名，已检查截图 | [320](browser/development-1-12/browser.json)、[390](browser/development-1-13/browser.json)、[768](browser/development-1-14/browser.json)、[1440](browser/development-1-15/browser.json) |

视觉四计划在最后编辑 input.type/alert 语义修正前执行，混合浏览布局未变；最终产品四宽度完整编辑流程在18/22–24重测。最终恢复产品入口，无调试API、种子/测试脚本留在 app。

证据审计核验以上12份最终计划共297注册动作、26组集成、50张研发截图及168条相对链接；历史失败与重测另保留，不计入最终通过数。

## 快照、动效与尺寸断言

- 原格式混合/重复/100长度单位长名/额外字段加载不 setItem，原序列化字节不变；成功改名仅目标title变化；UTF-16 80/81和emoji边界、trim/内部空格/大小写/隐藏重名均验证。
- QuotaExceededError与SecurityError在真实 Storage.prototype.setItem 边界注入；新增、编辑、状态、删除失败全数组 saved/memory 不变，保留输入/草稿、恢复 checkbox、不播报成功；解除故障后重试并重新加载验证。原型模拟不能替代这组断言。
- 四宽度100本存量完整管理与重载，scrollWidth=320/390/768/1440，卡片列数1/1/2/3；长名编辑输入右边界283/353/717/1037.65625px，输入占满所在表单；可见主要入口高度≥44px。
- 100本只动画前12张；220ms、延迟≤72ms、合计≤292ms。受控暂停在110ms读实际 computed opacity=0.984553（介于.6和1），重绘后旧动画idle；新增仅一张，编辑/保存无入场。此为插值/取消证据，不是自然帧率或GPU承诺。
- 首批动画处于running时连续筛选、新增两书、双向状态和删除多条，同步DOM动作2.4ms内结束（原动画220ms），完整快照与焦点正确；320ms后无幽灵条目/迟到回写。这是严格合成时序测试，不冒充自然鼠标事件间隔。
- 缺失Element.animate/Document.getAnimations、animate抛错、matchMedia缺失均可管理/重载。受控media对象matches/change能取消在途并禁止新入场、恢复后重启。CSS系统reduce规则禁用transition/animation和hover/press位移，规范/源码检查通过。

## 格式、lint与共享门禁

用户指定 verify.py --fix 已执行，Prettier/ESLint 自动修复完成。最终 verify.py 两次执行，均在 shell 浏览器回归绑定127.0.0.1时遭 `listen EPERM`，**最终共享门禁未完整通过**；不是产品断言失败。此前git diff --check、Prettier、ESLint、node --check全部退出0，[日志目录](delivery-checks/) 保留0–4日志；[门禁状态](verification-status.json)明示该环境限制。没有修改受保护配置/上游工具或尝试提权。core与feature已用注册浏览器在最终源码重跑通过；Runner必须在允许端口绑定的运行环境重跑正式 verify.py 后才能发布草稿PR。

测试JS/CJS语法、测试/计划Prettier、JSON读取和 [证据审计](evidence-audit.json) 单独执行；没有Python业务变更，不触发产品Python质量命令。源码与实际测试源对应见 [fixture哈希](fixture-source-hashes.json)、[失败源哈希](failure-source-hashes.json)、[完整源码清单](source-manifest.json)。

## AC逐项结论

| AC | 证据与结论 |
|---|---|
| 01 | 上游原型与A-001已经Owner批准；产品区域/卡片/排版对照自查一致，最终视觉舒适度待Owner体验 |
| 02 | 四宽度公开动作＋长名/100本DOM尺寸通过；小视口不是真机 |
| 03 | 空/有数据新增、统计/刷新、动画中双新增快照通过 |
| 04 | 原#71编辑18组回归、原生键盘与组合事件保护通过；真实中文IME待验收 |
| 05 | 三筛选、双向状态、全局统计、移出/草稿协调/刷新通过 |
| 06 | 已读/未读/编辑目标及连续删除、最后空态、刷新、其他对象引用通过 |
| 07 | 空/空格/大小写/隐藏同名/自身排除、80/81、历史长名/未知字段通过 |
| 08 | 实际Storage故障四动作、失败前后完整快照、恢复重试、初开零写回通过 |
| 09 | 入场/筛选/新增实际浏览器插值、封顶/取消通过；取舍与批准设计一致；自然运动舒适度待人工 |
| 10 | 动画内连续操作与延后检查、最终唯一快照/无幽灵/有效焦点通过 |
| 11 | **Partial/待验收**：受控matches/change与CSS检查通过；原生系统偏好实际开启及运行时切换未执行，工具不支持该动作，不能用受控夹具冒充 |
| 12 | **Partial/待验收**：原生键盘全流程、名称/焦点/错误结构通过；真实读屏/IME未验收 |
| 13 | 0/1/混合/长名/100本、四宽度/限额/同步时序通过；真机触控及流畅度待体验，无容量/帧率承诺 |
| 14 | 三空态与真实成功/验证错误/写失败通过；保持同步加载，不加假骨架 |
| 15 | 复用已批准完整原型/HLD/契约/G2证据，不重新批准 |
| 16 | 产品真实浏览器、截图、报告、运行方式与局限已提供；Runner正式门禁/草稿PR待执行 |

## 失败历史与修复

保留全部历史，不把诊断计划的工具成功当断言通过：1-2/1-3的26组报告为25/26，尺寸断言误包含hidden空状态按钮；只跳过无布局框的hidden元素，所有可见入口仍≥44，1-4重测通过。1-5发现产品编辑输入缺少批准原型的目标书名accessible name，补齐后1-6通过。1-10因注册工具不支持Shift+Tab失败，改为原生Tab走空入口返回全部，保留完整键盘旅程，1-11与最终1-25通过。

检查1-16手机失败截图时发现动态编辑input未显式type=text，默认text并不匹配属性CSS，导致输入过窄；修复并增加“占满form宽度”回归，最终1-18/1-19及四宽度流程通过。超过80步的首次汇总计划在执行前被工具拒绝，按四宽度拆分，不删业务动作/断言。shell共享门禁端口限制保留为未通过项，不声称修复。

## 查看结果与人工后续

关键截图：[1440书架](browser/development-1-15/screenshot.png)、[320长名](browser/development-1-12/screenshot.png)、[390](browser/development-1-13/screenshot.png)、[768](browser/development-1-14/screenshot.png)、[最终产品书架](browser/development-1-21/screenshot.png)、[最终失败/编辑手机](browser/development-1-19/mobile.png)。已通过view_image检查桌面、320、768和失败手机；原PNG在共享工作区，UTF-8交接保存 [截图清单](development-screenshot-manifest.json) 中路径/大小/哈希，不声称工具上传了PNG字节。

人工待验收：同HTTP来源打开app/index.html，在系统设置实际开启reduce并运行全部管理，在动画期间切换偏好检查取消；真实中文IME候选Enter/Escape；读屏名称/alert/状态/焦点；真机触屏、软键盘、hover无依赖与视觉舒适度；Safari/Firefox兼容未声称通过。产品运行可由静态HTTP服务托管app/（例如 `python3 -m http.server 8766 --directory app`）；本阶段shell端口绑定受限，不声称已启动在线服务。没有file存储验收。

无需用户重新批准需求/设计或先补人工证据才能提交审查；用户已授权实现后交还Runner。交接以注册submit_handoff回执为准，Runner负责正式复验、任务分支发布与草稿PR，不合并。
