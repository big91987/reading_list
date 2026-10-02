# Issue #82 设计验证记录

> 2026-10-02 · 隔离原型浏览器验证通过；真实产品 app/ 未修改，所有产品 AC 仍待研发验收。不是 QA/发布结论。

## 环境与方法

Runner 注册 `check` 在真实 Chromium 中载入本任务 prototype，原生 HTML/CSS/JS，无构建步骤。每次计划重置样本，使用独立原型键；计划与原始 browser.json/截图一并保留。动作 viewport/fill/click/key/visible/absent/reload，由浏览器实际执行，不是静态截图计划。

视口：计划中的 1280px/320px；screenshot.png 保存计划结束宽度，mobile.png 工具固定为 390px。不把 390px 自动截图当作 320px 实测截图。诊断提供完整内存清单、持久 JSON、当前筛选、机会、草稿、document.activeElement 与 scrollWidth 比较；visible 动作精确核对这些可见文本，辅助结构化断言，但不是最终产品测试机制。

故障开关仅在原型 Storage.prototype.setItem 针对独立键抛出 DOMException/QuotaExceededError，不是直接显示错误；failure 计划记录实际调用计数、失败前后完整 JSON/统计/机会，解除注入并真实点击重试和刷新。**这仅证明原型运行时异常路径，尚无产品写入失败的实测证据**，真实产品执行方案单列 fault-validation-plan.md。

## 运行与失败闭环

| 运行 | 计划 | 完成动作 | 结果与归因 |
|---|---|---|---|
| [design-1-1](browser/design-1-1/browser.json) | core 首跑 | 7 | Failed：精确文本查询不能匹配 pre 中的单行诊断；已检查截图。调整诊断为独立行元素，功能本身未报页面异常 |
| [design-1-2](browser/design-1-2/browser.json) | core 重跑 | 45/45 | Passed，errors=[]；已读/未读、序位、连续删除、空态、刷新和隐藏恢复 |
| [design-1-3](browser/design-1-3/browser.json) | conflicts 首跑 | 6 | Failed：检查计划把错误子句当作全文精确匹配；修正为完整用户提示，不改冲突语义 |
| [design-1-4](browser/design-1-4/browser.json) | conflicts 重跑 | 49/49 | Passed，errors=[]；320px 两类同名、隐藏大小写、改名重试、草稿与继续保存 |
| [design-1-5](browser/design-1-5/browser.json) | failure | 41/41 | Passed，errors=[]；桌面实际删除/撤销写失败与原状态核对、解除故障、重试/刷新、320px 失败提示 |
| [design-1-6](browser/design-1-6/browser.json) | keyboard 首跑 | 18 | Failed：注册工具不支持 Shift+Tab；改为完整向前 Tab，不修改共享检查器 |
| [design-1-7](browser/design-1-7/browser.json) | keyboard 二跑 | 32 | Failed：测试绕回页面少算一次 Tab，Enter 激活已读筛选；已检查截图，补足 Tab 并核对焦点，不改产品交互 |
| [design-1-8](browser/design-1-8/browser.json) | keyboard 三跑 | 60/60 | Passed，errors=[]；1280px 删除/冲突→320px 改名排冲突、Space 重试及最终焦点 |
| [design-1-9](browser/design-1-9/browser.json) | keyboard-filter | 37/37 | Passed，errors=[]；320px 仅键盘导航未读/已读、隐藏恢复、焦点回当前筛选 |
| [design-1-10](browser/design-1-10/browser.json) | states | 34/34 | Passed，errors=[]；校验/取消/标记/筛选保留机会，320px/1280px 长名操作与无横溢出 |
| [design-1-11](browser/design-1-11/browser.json) | empty | 13/13 | Passed，errors=[]；320px 空清单按钮、Space 恢复、焦点和无横溢出 |

最终 7 份计划、279 个动作全部通过，4 次失败记录保留；失败原因与修正只针对原型诊断结构/检查计划或工具能力，没有故意制造产品缺陷、也没有隐藏失败。

### 最终源文件快照复验

补齐与契约一致的“目标已不在当前清单时不创建删除机会”防守性守卫后，对最终原型源码重新执行所有七份计划；不是复用旧版本证据：

| 最终运行 | 计划 | 结果 |
|---|---|---|
| [design-1-12](browser/design-1-12/browser.json) | core | Passed，45/45，errors=[] |
| [design-1-13](browser/design-1-13/browser.json) | conflicts | Passed，49/49，errors=[] |
| [design-1-14](browser/design-1-14/browser.json) | failure | Passed，41/41，errors=[] |
| [design-1-15](browser/design-1-15/browser.json) | keyboard | Passed，60/60，errors=[] |
| [design-1-16](browser/design-1-16/browser.json) | keyboard-filter | Passed，37/37，errors=[] |
| [design-1-17](browser/design-1-17/browser.json) | states | Passed，34/34，errors=[] |
| [design-1-18](browser/design-1-18/browser.json) | empty | Passed，13/13，errors=[] |

最终复验仍为 279 动作，原型入口/脚本/样式的 SHA-256 绑定在 audit.json。18 次总运行不等于 18 份独立验收计划。最终截图链接见交互规范；最终截图也由设计 Agent 检查，不把历史失败截图作通过证据。

设计 Agent 已查看 design-1-2/screenshot.png、design-1-4/screenshot.png、design-1-5/screenshot.png、design-1-10/mobile.png、design-1-11/screenshot.png，以及首跑/键盘失败截图：暖色/纸色布局延续，撤销入口独立，320px 冲突与失败说明换行、空态入口可达；390px 长名截图用于补充视觉审查。真实 320px 的长名操作通过 states 计划，不用截图替代操作断言。

## 其他自查与边界

原型 JS `node --check` 通过；文档相对链接、BR/US/QR/AC 引用与路径、git diff 空白检查见设计快照 audit.json。G2 只读自查见设计索引，不自动批准。

尚未验证：真实产品实现及 14 项 AC、最终 app/ 上正式工具注入的存储失败/同页重试/刷新、旧产品 JSON 固定回归及既有辅助技术行为。必要内部守卫可单元检查，不算真实用户操作；不增加第二异常类型、内部深比较或隐藏 handler 激活的验收门槛。研发按批准 PRD、契约和精简故障计划补齐证据，QA 如实判定。暂无后端/GPU/账号能力，不对非目标声称正确性。

未修改 app/、共享 Harness、Workflow 或受保护配置；未操作 Git 分支/提交/推送/GitHub。用户已明确批准修订设计及交接研发，执行结果以工具回执为准；产品验收尚未完成。

## 正式工具路径补验（本轮整改）

[design-1-19](browser/design-1-19/browser.json)：注册 check，root 为本任务隔离 prototype，计划为 product-storage-failure-plan.json；69/69 动作 Passed，errors=[]。未使用原型自带故障 checkbox、计数或内部诊断断言；完全由正式工具 storage_write_failure 开启/关闭，配合三次 snapshot_storage/unchanged_storage、实际新增/标记/删除/撤销 UI、提示/书名/统计、同页重试与刷新/已读筛选核对。关闭故障后同页操作成功，证明正式工具路径在本次执行环境可用；没有调用 GitHub 核验 PR 状态。

该计划供研发直接对 app/ 执行，本轮只证明原型和正式工具路径，不是产品验收。原型源码与七份既有计划未变，原 279 动作证据继续有效；补验后共八份计划、348 个通过动作。历史演示故障计数保留作原型证据，不作为产品门槛。原首页、iframe 宿主、SecurityError 和内部深比较要求已按用户审查意见删除，不把过量要求继续列为“待验”。

已检查 design-1-19/screenshot.png：最终刷新后 B 为已读、C 为未读、统计两本且无撤销入口；此图仅补充结果，异常过程以原始动作及 unchanged_storage 断言为证据。
