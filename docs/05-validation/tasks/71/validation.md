# Issue #71 研发验证报告

## 结论与边界

产品代码已实现批准方案，无需求/架构偏差；本阶段自动功能验证通过。**不是全部人工验收通过，也不是已经提交、发布 PR 或合并**。

- M01/M02 自动退出条件通过；M03 Ready for Review（非完整验收通过）。AC-01～11、13 有产品自动证据；AC-12 的真实键盘、DOM/ARIA 语义及组合事件门控通过，操作系统中文输入法候选和真实屏幕阅读器尚无人工实测，仍标记 Partial/待人工验收。用户已明确授权以保留该缺口的方式交接待审查草稿PR，不以人工待验项阻止本轮流水线交接。
- 用户指定共享 fix 命令成功，最终 verify 的 diff/Prettier/ESLint/Node 语法步骤均通过；其浏览器服务器被 CLI 沙箱拒绝监听（`listen EPERM: operation not permitted 127.0.0.1`），因此**不声称完整 verify 成功**。相同 Owner 固定 reading-core 和功能计划通过注册浏览器工具；Runner 在其获授权环境完成完整共享复验。
- 无后台/GPU/云同步，静态浏览器证据不用于证明这些非目标能力。未修改 `.github/`、`harness/`、`harness-project.json`、`harness-upstream.json` 或共享检查器，未操作 Git 分支/提交/推送/GitHub/PR。

## 环境与可复现入口

基线：已批准 PRD v1、A-001～003 Accepted、批准原型/HLD/contracts；Runner 任务分支只读核对为 `codex/issue-71-platform`。原生 HTML/CSS/JS 无构建依赖，产品从空清单或旧本地键启动，无预置演示数据。

注册浏览器工具在 Runner 的真实 Chromium 环境执行；每次调用独立本地源/清单，不把前一计划的书当下一计划夹具。检查路径如下：

1. `check(root="app", plan="docs/05-validation/tasks/71/browser-plan.json")`：62 动作，桌面/320px 产品旅程。
2. `check(root="app", plan="docs/05-validation/tasks/71/browser-keyboard-plan.json")`：29 动作，Tab/Enter/Escape；输入由工具 fill，焦点/提交/取消由真实键盘驱动，不把 fill 称为系统输入法。
3. `check(root="app", plan=".harness/reading-core.json")`：16 动作，固定新增→标记→刷新→筛选→删除。未更改计划或 Owner 配置。
4. 集成夹具：先 `node docs/05-validation/tasks/71/tests/stage-fixture.cjs prepare`，再注册 `check(root="app", plan="docs/05-validation/tasks/71/browser-integration-plan.json")`，最后不论检查结果都运行 `node docs/05-validation/tasks/71/tests/stage-fixture.cjs restore`。

夹具只临时将 `app/index.html` 作为测试入口，原产品 HTML 备份为同根下 product-under-test-71.html，由 iframe 加载**原始产品 app.js/styles.css 和未修改的产品 HTML**；没有复制另一套改名实现。浏览器内直接预置旧 localStorage、对 iframe 的真实 `Storage.prototype.setItem` 注入 QuotaExceededError/SecurityError、读取完整存储和实际词法内存状态做深比较。iframe 的组合事件是合成事件，不等于系统 IME。恢复已完成，最终 app/ 仅有三个产品静态文件；没有测试入口或故障开关交付到产品。

[最终测试源码哈希](fixture-source-hashes.json)绑定格式化后的三份产品文件。修改代码后必须重新跑测试、重新生成哈希，不可复用陈旧证据。

## 真实浏览器结果

| 运行 | 内容 | 结果与归因 |
|---|---|---|
| [development-1-1](browser/development-1-1/browser.json) | 首次集成夹具 | Failed：17/18；测试误把 80 长度草稿当超限，合法保存后找不到 edit-controls。截图已检查；这是夹具预期错误，未改产品规则 |
| [development-1-2](browser/development-1-2/browser.json) | 修正夹具超限输入为 84 后重跑 | Passed：18/18；[原始下载测试报告](browser/development-1-2/download-1.json)，errors=[] |
| [development-1-3](browser/development-1-3/browser.json) | 格式化后的产品正式旅程 | Passed：62/62；errors=[]；最终截图为320px长名称编辑，已查看 |
| [development-1-4](browser/development-1-4/browser.json) | 格式化后的产品真实键盘 | Passed：29/29；errors=[]；1280px编辑与可见焦点截图已查看 |
| [development-1-5](browser/development-1-5/browser.json) | 产品最终源码集成复验与实测数据 | Passed：18/18、4工具动作；[原始下载报告](browser/development-1-5/download-1.json)；errors=[] |
| [development-1-6](browser/development-1-6/browser.json) | 固定 reading-core | Passed：16/16；errors=[] |
| [development-1-7](browser/development-1-7/browser.json) | 测试源码格式化后再跑最终夹具 | Passed：18/18、4工具动作；[最终原始下载报告](browser/development-1-7/download-1.json)；errors=[]；源码哈希同时绑定产品与测试 |

四种最终计划合计111工具动作（62+29+4+16）；18组浏览器内集成断言另计，不与工具动作混算。保留历史失败及重复成功报告，不从失败中挑选通过截图来宣称首次通过。

## AC 追溯与实际结果

下表测试编号按最终 [download-1.json](browser/development-1-7/download-1.json) 的 records 数组顺序（1-based）。

| AC | 证据与检查点 | 结论 |
|---|---|---|
| AC-01 | 测试1：已读/未读预填、聚焦选中、保存退出/新名反馈，只改目标；正式计划也覆盖两状态 | Passed |
| AC-02 | 测试2：空值/空白保留草稿，存储和内存全快照不变，输入聚焦、错误后修正成功；产品计划错误修正 | Passed |
| AC-03 | 测试3：未读筛选下与隐藏已读 Dune 冲突；整个数组校验，失败不写入 | Passed |
| AC-04 | 测试3/4：自身原名、trim、大小写，80/81 UTF16及40/41 emoji、无 maxlength 截断、内部空格和HTML样式文本保持普通文本 | Passed |
| AC-05 | 测试1/5：三筛选逐一保存，整JSON比较 read/顺序/扩展字段/其他记录不变，当前筛选不变 | Passed |
| AC-06 | 测试1/6/18：旧键实际加载、重复/100长度历史名/未知字段不迁移、不批量清理，页面重新加载仍完整；固定主线覆盖继续管理 | Passed |
| AC-07 | 测试7/14：取消、校验错误后Escape、失败后Escape、页面离开重访草稿不恢复、不误报成功；产品计划有 reload | Passed |
| AC-08 | 测试8：换书/换筛选/同筛选只保留一条草稿，预填自身原名，无确认弹窗；正式产品计划覆盖 | Passed |
| AC-09 | 测试9/10/14：改名后删除、编辑目标删除、旧脱离DOM表单不复活、其他删除保留草稿及引用；真实刷新与空状态 | Passed |
| AC-10 | 测试10～12/14/18：新增校验/写失败保留草稿，成功清草稿切全部；标记重绑且离开筛选终止编辑；原reading-core通过 | Passed |
| AC-11 | 测试17与正式320/1280截图：显示/超限错误/编辑实测宽度；两个视口 scrollWidth 分别320/1280，输入右边285/1016.75，保存/取消按钮高度44；保持批准风格，不依赖hover | Passed |
| AC-12 | 测试7/15/16：ARIA/label/描述关联、原生控件和焦点、组合 start/end/isComposing/229/Enter/Escape保护；产品真实Tab/Enter/Escape通过。**系统IME候选操作和真实屏幕阅读器未实测** | Partial（自动证据通过，人工缺口） |
| AC-13 | 测试13/14：真实Storage边界两种异常；持久JSON和内存深比较不变，草稿/错误焦点/取消保留，恢复后重试/重新加载，其他命令不泄漏失败草稿 | Passed |

## 格式、lint 和工程自查

用户提供的共享命令执行记录（从当前工作区运行）：

```text
<runner-python> <platform>/examples/github/verify.py --config <runner-config> --issue 71 --fix
exit 0（Prettier写入、ESLint自动修复）

<runner-python> <platform>/examples/github/verify.py --config <runner-config> --issue 71
exit 1（浏览器listen EPERM；不是产品断言失败）
```

| 检查 | 真实结果 | 原始日志 |
|---|---|---|
| git diff --check | 0 | [check-0.log](delivery-checks/check-0.log)（成功无输出） |
| 共享 Prettier --check app/ | 0 | [check-1.log](delivery-checks/check-1.log) |
| 共享 ESLint app/ | 0 | [check-2.log](delivery-checks/check-2.log)（成功无输出） |
| Node --check app/app.js | 0 | [check-3.log](delivery-checks/check-3.log)（成功无输出） |
| 共享 CLI 浏览器 existing | EPERM | [check-4.log](delivery-checks/check-4.log)；feature CLI步骤未执行，不伪造日志 |

测试源码 Node 语法检查通过。产品为 JS，无 TS 类型检查配置；没有改产品 Python，因此 Python Ruff 检查不适用。公共说明及测试源码使用已有 Owner Prettier 配置，不引入新的 formatter。

`node docs/05-validation/tasks/71/tests/audit-evidence.cjs` 复核产品与测试哈希、四份最终计划逐动作一致、18组报告、13项AC映射和全部本地链接，并生成 [审计结果](evidence-audit.json) 与研发截图清单；产品测试临时文件必须已恢复。测试源码/夹具的共享Prettier检查通过。审计过程中发现实施计划的一条LLD相对链接多了一层上级目录，已修复并重跑；不影响产品代码或批准设计。

Trellis 自查：重新运行 packages、读取新增 frontend index/book-state 和 guides；按批准 PRD/LLD/契约核对交互→校验→候选→Storage→内存→DOM完整链路；非目标记录保留、引用重绑、异常不泄漏已由真实断言覆盖；无debug日志/新增依赖/产品测试开关/共享规则修改。render 与旧加载/新增主线复用，未另建状态框架；样式全文件排版来自 Owner 必需 fix 命令，不是视觉改版。原型及其审批文档未改行为；本阶段自查不是独立模型评审，也不代表 Runner 已复验。

## 文件与截图交付

- 新建：实施计划与任务包 implement.md、LLD、frontend code-specs、三份验收计划、测试夹具/准备恢复/证据审计脚本、源码哈希、本报告及 development 浏览器结果/下载报告、截图清单和审计结果。
- 更新：app/app.js、index.html、styles.css；任务README、项目文档索引、项目现状、guides索引。
- 复用且不改审批：PRD/需求决策/G1、批准原型/HLD/contracts/架构决策/追溯/G2、设计证据、固定reading-core与Owner质量命令。
- 新截图见 [研发截图清单](development-screenshot-manifest.json)：原始PNG保留在共享工作区，清单提供实际大小/SHA256。UTF-8 handoff只快照文本，不声称PNG已快照。已查看本阶段失败、320px长名编辑、1280px键盘编辑和最终集成截图，并与批准桌面/手机原型截图对照。

## 剩余项、风险和Runner交接

无需重新确认已批准需求或设计，无已知产品功能失败。用户已明确本轮交付目标是**待审查草稿PR与完整流水线验证**，不是产品完整验收或合并；授权现在调用submit_handoff，交给GitHub Runner执行正式完整共享verify（包括沙箱未能启动的CLI浏览器步骤），成功后提交任务分支、创建草稿PR；不直接合并。工具接受交接、Runner复验成功、提交和PR创建是不同结果，只按实际回执报告。

### 本轮用户交接授权原文

“本轮目标是交付待审查的草稿 PR，并验证完整流水线，不是宣布产品完整验收或合并。请保留 AC-12 的真实输入法和读屏器人工证据缺口，状态仍为 Partial/待人工验收，不改变验收标准，不声称通过。其余实现与自动验证已完成，现在请调用 submit_handoff 交给 GitHub Runner 做正式复验、提交任务分支并创建草稿 PR；不要因这两项明确保留的人工验收项反复自查或等待重复确认。交接成功后简短告诉我实际结果。”

该授权调整本轮交接门槛，不变更PRD/AC，不构成AC-12人工通过证据，不将T03/M03/G4标记完整完成；保留既有所有通过与失败证据，不重复执行已完成的自查或要求再次确认。

AC-12人工检查未闭合，须在具备桌面中文输入法和屏幕阅读器的环境补充真实证据后才能声称完整验收/接受M03/G4：

1. 使用真实中文IME编辑已读书，Enter确认候选时仍在编辑且未显示保存成功；候选Escape不得取消编辑；结束组合后明确保存完整中文名，刷新保留read；记录OS、浏览器、IME及实际结果。
2. 使用屏幕阅读器经修改入口进入输入，确认名称/帮助可读；空名、重名、保存失败收到关联错误；成功/取消反馈可读，焦点回有效入口；记录工具与版本、操作、结果。

这些是完整产品验收的后续证据项，不是本轮已授权草稿PR交接的阻塞项。自动工具不能操作OS输入法或运行真实读屏器；后续由用户或授权人工验证者在**产品而非原型**完成上述步骤并记录系统/浏览器/IME/读屏工具及实际结果。不要求现在补截图或再次确认，不将设计阶段原型的人工报告冒充产品实测。后续收到人工结果再记录证据，若发现缺陷继续修复；完整验收/合并前不得忽略缺口。清理本地数据、多标签页冲突及云同步仍是已批准非目标。
