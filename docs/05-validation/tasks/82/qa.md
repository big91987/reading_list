# Issue #82 独立 QA 验证报告

2026-10-02 · QA / Verifier · 原始 Issue：https://github.com/big91987/reading_list/issues/82

## 结论与推进状态

**按已确认 PRD/契约，本次独立 QA 验收通过，无产品或环境阻塞。** 独立浏览器检查16/16通过、615个动作通过，9项单元及质量检查通过，未发现需退回的产品缺陷；Runner现存完整门禁回执6条命令全部exit 0已独立核实。已验证真实 `app/`，不是原型，也不是引用开发自测的通过结论。AC-13的必需键盘路径、可访问文本、状态通知及焦点规则已有证据支持；实际屏幕阅读器朗读和系统IME专项兼容性仍未验证，不作这些专项通过声明。2026-10-02复核门槛依据后，撤回前轮将QA-L01/L02扩展为强制人工交付门槛的判断；QA-L03已关闭。详细依据见下节。

本轮不调用返工交接（无产品缺陷依据）。2026-10-02用户已审查独立QA报告、真实浏览器结果及Runner复验记录，确认按批准范围通过，并明确授权创建草稿PR、要求通过 `submit_handoff(target_stage="report")` 交接。将按该授权提交，交接结果以工具回执为准，不提前声称PR已创建。保留系统IME/读屏器专项未测说明；代码审查由独立Agent另行出意见，后续人工判断，不合并。未修改产品、既有测试、上游决定、受保护Harness；未调用GitHub，未自行创建/切换分支、提交、推送或创建PR。

## 门槛依据复核（2026-10-02）

1. **PRD明确必须项：** [prd.md §6 AC-13](../../../04-implementation/tasks/82/prd.md)要求“仅用键盘完成删除、撤销、切换筛选、冲突书改名并重试”，Tab到达、Enter/Space激活、可见且有效的焦点，以及“删除、恢复及错误反馈具有可访问文本和状态通知”。R08/R09的真实键盘控制旅程及截图覆盖前者；R02/R03/R04的实际成功/错误文本，加上源码中这些真实元素的status/polite、alert定义和更新路径，覆盖可访问文本及状态通知实现。该证据不是实际读屏器播报证明，报告不作这种推断。
2. **QR-02及交互契约的承接：** [PRD §5 QR-02](../../../04-implementation/tasks/82/prd.md)的可访问名称、可见焦点及可感知反馈由[interaction.md“键盘、焦点和草稿”](../../../04-implementation/tasks/82/design/interaction.md)具体化为原生按钮、成功status/polite、错误alert和明确焦点目标。实现满足这些具体规则；不将“能被辅助技术感知”解释为所有读屏器/浏览器组合的专项兼容性认证。
3. **IME的具体必须项不等于系统专项门槛：** [contracts.md §4](../../../01-architecture/tasks/82/contracts.md)确有“研发需验证中文组合门控不回归”，同时明确“不承诺重建后保留光标选区/系统输入法候选”。本轮只核对门控实现和编辑回归，不声称已执行系统IME专项实测。已只读比较 `git show HEAD:app/app.js` 与当前源码：完整 `createEditor` 函数未改变，compositionstart/end、isComposing/composing/229和submit组合守卫均保持；R02/R07/R08/R09验证编辑继续保存/取消、草稿及焦点。源码相同是无门控改动的证据，不等于真实组合输入通过，也不将契约扩展为必须指定系统输入法人工验收后才能交付。
4. **Trellis是专项声明的证据约束：** [.trellis/spec/frontend/book-state.md §6](../../../../.trellis/spec/frontend/book-state.md)原文“System IME and screen-reader claims require their own human evidence, not fill or screenshots.”约束的是作出这些专项声明时需要自己的人工证据，并未要求未作该声明的本次交付必须先完成两类系统专项测试。interaction.md第31行同样要求不把fill/DOM属性冒充系统实测，并记录未测范围，不能单凭这句新增强制门槛。
5. **判定与限制：** AC-13在上述批准范围内通过；QA-L01/L02保留为非阻塞的未测范围，不标成专项测试通过。若未来提出具体读屏器/系统IME兼容性声明，应另附相应真实证据；本轮不擅自扩展范围，也不请求重新批准PRD。既有Runner通过回执已核实，无剩余产品/环境阻塞。草稿PR仍必须由用户另行明确授权。

## 基线、方法与环境

- 已读取执行器提供的 AGENTS.md、项目文档索引、项目背景、本任务批准 PRD、交互规范、HLD、contracts、LLD、traceability、实施文档和 frontend/guides 规范；开发 validation.md 只作为输入，不作为本报告的实测证据。
- 当前 `.harness/full.json` 未提供独立 qa Skill；其 review 入口是 `full_harness/skills/trellis-check/SKILL.md`。已按该入口执行改动核对、规范与契约审查、质量检查和逐项报告。本轮 QA 的禁止修改实现规则优先于 Skill 的“修复”步骤；不自创替代 QA Skill，也不声称专门 QA Skill 已存在。
- 使用注册 `mcp__registered_browser_qa.check`，`root="app"`；每次均取得本轮 `browser/qa-1-N/` 的真实日志和截图。复用上游计划不复用其执行结果；另写 4 份独立计划补查完整序位、最近删除、草稿错误和 80 长度连续英文长名。
- 主视口实际设为 1280px / 320px。工具另存 `mobile.png`；该自动手机截图不代替计划显式 320px 的操作证据。下文 320px 截图均指对应计划的 `screenshot.png`。这是浏览器窄屏验证，不冒称物理手机/触屏真机测试。
- 原始日志只包含 performed/errors/failure 等工具实际提供内容；不补造 DOM 快照、内部状态、异常计数、视频、网络或屏幕阅读器日志。16 份日志均 `passed=true`、`errors=[]`、`failure=null`。
- 无账号、登录页、服务端认证或授权功能：依据批准的本地静态产品范围、入口源码和实际打开/刷新旅程，登录成功、错误凭据、退出及未登录访问权限边界均 **不适用**；直接进入本地书单符合设计。未创建账号或写入任何凭据。不验证不存在的后端/GPU能力。

## 逐项验收

| AC | 结果 | 本轮独立证据及可观察结果 |
|---|---|---|
| 01 | 通过 | R02、R04、R05、R14：已读/未读删除后准确提示；恢复书名、阅读统计；reload 保留恢复结果、无撤销入口。 |
| 02 | 通过 | R02、R06：连续删除 C/A 只恢复 A；C 不复活；入口消耗，继续按 Enter/Space 不增加重复书；reload 共 2 本。 |
| 03 | 通过 | R13/R14：唯一书删除后空态与撤销同时存在，真实点击恢复后空态消失；R16 长名空态也可撤销。 |
| 04 | 通过 | R02：新增、改名、标记、筛选、进入/取消编辑、空名与同名校验后保留最后机会；reload 后机会失效、已删除书仍不存在。源码无倒计时/过期逻辑；不把短时执行声称为无限时长实测。 |
| 05 | 通过 | R05：在已读筛选删除/撤销 B，仅 B 可见，A/C 仍隐藏；切全部后恢复完整序位。R02/R03/R10：切换至不匹配筛选后恢复，提示不可见，不自动切筛选。 |
| 06 | 通过 | R03/R10：删已读《活着》再新增同名未读书，撤销拒绝；snapshot/unchanged 证明存储未变；新书改名后重试，保留新书且原已读书恢复。R11/R12 保存两种视口冲突现场。 |
| 07 | 通过 | R03/R10：删 Dune，将现存书改为 dune 并切已读（冲突书隐藏），撤销拒绝且存储不变；改名后重试，保留修改结果及筛选，原 Dune 恢复。 |
| 08 | 通过 | R04/R15：保有 A 的机会时 setItem 注入失败，删除 B 不生效、旧 A 机会及统计保留、存储不变；解除故障可撤销 A。再次失败后成功重试删除 B，只产生 B 的机会，A 不复活。 |
| 09 | 通过 | R04/R15：真实撤销入口在写入故障下拒绝恢复，现存书/统计不变，无成功提示，存储 unchanged；同页解除后重试恢复一次并 reload 核对。R13/R14 保存失败空态现场。 |
| 10 | 通过（UI + 独立单元边界） | R05 截图/reload 实际结果 A/B/C/D，B 保持已读；R06 截图/reload 实际结果 A/B，C 未复活。越界 min(index,length) 按批准契约仅为内部守卫，用独立 Node 单元验证，不构造虚假用户旅程。 |
| 11 | 通过 | R02：恢复保留他书未保存草稿及新增输入，继续保存/新增有效；被删书只恢复最后保存版。R07：空草稿校验错误在失败和成功恢复后仍保留，可继续校验/取消；标记其他书再恢复仍能保存原草稿。 |
| 12 | 通过（浏览器视口范围） | R03/R10 長名、R11/R12 冲突、R13/R14 失败/空态、R08/R09 键盘焦点，分别实操桌面与320px；R16 实操80长度无空格英文长名删除/恢复。逐图检查，文字换行、按钮可达，截图没有新增横向溢出，视觉沿用纸色/赭红。无声称任意书名/浏览器/真机都已覆盖。 |
| 13 | **通过（批准的键盘/文本/状态通知范围）** | R08/R09 无 click 动作，以 Tab/Enter/Space/Escape 完成新增、删除、撤销、取消、冲突改名、重试和筛选；文本输入用 fill，不冒称真实 IME。后续键盘动作及焦点框证明删除→撤销、恢复→修改/编辑的关键焦点链。真实反馈文本与源码的status/polite、alert、名称及focus-visible相互核对。实际屏幕阅读器通知/朗读未验证，不作专项兼容性通过声明，也不额外设置人工门槛。 |
| 14 | 通过（兼容边界列明） | R01 原样 Owner core 独立执行；R02/R07 编辑保存/取消/校验、新增空/同名、标记、筛选、统计、空态和 reload 回归。旧 JSON 扩展字段/重复/长名沿用加载和无回写由本轮独立重跑单元验证，非真实浏览器旧数据导入旅程。 |

## 浏览器运行索引（均为本轮独立通过）

所有路径相对本报告。每个结果目录均保存 `browser.json`、`screenshot.png`、`mobile.png`，可核验完整 action 顺序。截图像素、文件字节及 SHA-256 见 [qa-evidence.json](qa-evidence.json)。

| ID | 计划 | 动作数 | 结果日志 | 关键截图 |
|---|---|---:|---|---|
| R01 | `tests/browser/core.json`（复用、未改） | 16 | [日志](browser/qa-1-1/browser.json) | [核心回归](browser/qa-1-1/screenshot.png) |
| R02 | `browser-plan.json`（复用、未改） | 75 | [日志](browser/qa-1-2/browser.json) | [恢复/刷新终态](browser/qa-1-2/screenshot.png) |
| R03 | `conflicts-plan.json`（复用、未改） | 47 | [日志](browser/qa-1-3/browser.json) | [320px 混合长名](browser/qa-1-3/screenshot.png) |
| R04 | `product-storage-failure-plan.json`（复用、未改） | 69 | [日志](browser/qa-1-4/browser.json) | [桌面失败后重试终态](browser/qa-1-4/screenshot.png) |
| R05 | `qa-order-plan.json`（本轮新建） | 26 | [日志](browser/qa-1-5/browser.json) | [1280px A/B/C/D 顺序](browser/qa-1-5/screenshot.png) |
| R06 | `qa-latest-plan.json`（本轮新建） | 22 | [日志](browser/qa-1-6/browser.json) | [320px A/B 顺序、C 未恢复](browser/qa-1-6/screenshot.png) |
| R07 | `qa-draft-errors-plan.json`（本轮新建） | 35 | [日志](browser/qa-1-7/browser.json) | [草稿继续保存终态](browser/qa-1-7/screenshot.png) |
| R08 | `desktop-keyboard-plan.json`（复用、未改） | 69 | [日志](browser/qa-1-8/browser.json) | [1280px 撤销焦点](browser/qa-1-8/screenshot.png) |
| R09 | `keyboard-plan.json`（复用、未改） | 69 | [日志](browser/qa-1-9/browser.json) | [320px 撤销焦点](browser/qa-1-9/screenshot.png) |
| R10 | `desktop-plan.json`（复用、未改） | 47 | [日志](browser/qa-1-10/browser.json) | [1280px 混合长名](browser/qa-1-10/screenshot.png) |
| R11 | `desktop-conflict-state-plan.json`（复用、未改） | 11 | [日志](browser/qa-1-11/browser.json) | [1280px 同名冲突](browser/qa-1-11/screenshot.png) |
| R12 | `conflict-state-plan.json`（复用、未改） | 11 | [日志](browser/qa-1-12/browser.json) | [320px 同名冲突](browser/qa-1-12/screenshot.png) |
| R13 | `desktop-failure-plan.json`（复用、未改） | 17 | [日志](browser/qa-1-13/browser.json) | [1280px 失败与空态](browser/qa-1-13/screenshot.png) |
| R14 | `empty-plan.json`（复用、未改） | 17 | [日志](browser/qa-1-14/browser.json) | [320px 失败与空态](browser/qa-1-14/screenshot.png) |
| R15 | `narrow-storage-failure-plan.json`（复用、未改） | 69 | [日志](browser/qa-1-15/browser.json) | [320px 故障解除/刷新终态](browser/qa-1-15/screenshot.png) |
| R16 | `qa-long-title-plan.json`（本轮新建） | 15 | [日志](browser/qa-1-16/browser.json) | [320px 80长度连续英文、空态](browser/qa-1-16/screenshot.png) |

## 关键复现与检查步骤

前提：通过注册 check 打开真实 app，隔离的测试清单。每份计划是独立旅程，勿把多个计划串进有历史数据的页面后期望相同计数。

1. **完整位置与筛选（R05）：** 新增 A/B/C→标 B 已读→已读筛选删除/撤销 B（A/C 不应出现）→全部筛选删 B→新增 D→撤销→刷新。截图确认 A/B/C/D、B 已读、4/1 统计，无撤销入口。
2. **单一最近机会（R06）：** 新增 A/B/C→删 C→删 A→Enter 撤销 A→入口消失→继续 Space/Escape→刷新。结果 A/B 两本且 C 不存在，没有重复 A。
3. **两种同名冲突（R03/R10）：** 删已读《活着》→新增未读同名→快照→撤销拒绝、存储 unchanged→新书改名→重试恢复。再删 Dune→将另一书改成 dune→切已读隐藏冲突项→快照→撤销仍拒绝→改名→切已读→重试恢复并提示不可见。匹配筛选及刷新核对三本、保留他书改名。
4. **真实写失败（R04/R15）：** 删 A 成功建立机会→snapshot_storage→storage_write_failure(true)→点删除 B，实际保存被拦截，失败提示、B 和旧 A 机会/统计保留，unchanged_storage 通过→关闭故障并撤销 A→刷新。随后删 B→注入失败并撤销 B→未恢复、存储不变→同页关闭故障重试→刷新。失败状态截图另见 R13/R14，不把终态截图当失败现场。
5. **草稿与错误保留（R07）：** 删 A→编辑 B 输入空格并校验→注入失败→撤销 A→两个错误都保留、存储不变→关闭失败重试→原编辑错误仍在，Enter 继续校验、Escape 可取消。再删 A→编辑 B 输入草稿→标 B 已读→撤销 A→Enter 保存原草稿→刷新核对。证明 undo 不隐式保存或丢弃草稿。
6. **键盘与长名（R08/R09/R16）：** 依日志 Tab 进入删除，Enter 删除、Space 撤销、Enter 打开恢复书编辑；冲突后 Tab 至改名输入、Enter 保存再回撤销。长名用80长度连续英文，在320px Space恢复、1280px Enter恢复，再删并回320px核对完整文本/入口和空态。中文 fill 仅代表赋值，不代表系统组合输入。

以上实际结果均符合预期，没有产品失败复现；未发现需求遗漏、设计缺陷或实现错误，因此没有臆造退回理由。

## 独立质量检查与静态审查

完整原始输出：[qa-checks.log](qa-checks.log)。以下均为本轮亲自执行，exit 0；未运行任何自动修复参数。

- `git diff --check`。
- Owner 配置的 Prettier `--check` 与 ESLint（同开发门禁工具和配置，仅检查 app）。
- `node --check app/app.js`。
- `node --test tests/undo.test.cjs`：9/9通过。DOM/Storage 使用 VM 替身，明确是单元证据，不是浏览器/辅助技术实测。覆盖越界、未知字段、旧 JSON 加载、缺失目标、失败原子性、草稿引用及仅最近机会。

静态审查核对：删除/恢复均先构造候选并成功持久化再提交 books/undo；全清单大小写冲突在写前拒绝；保留对象字段与现存引用；完整数组 index，钳制位置；无持久 undo/历史栈/倒计时；提示 textContent；独立 status/alert 区域与按钮名称。单层本地 DOM→候选→Storage→books→undo→UI，不适用后端/API/跨三层验证。没有 Python 产品修改、TypeScript 编译或另设构建步骤。

### Runner 现存回执独立核对（2026-10-02补充）

用户只提供证据位置，不表示 QA 通过确认或授权创建 PR。本轮读取并核对 [runner-checks/checks.json](runner-checks/checks.json)、6份 `check-0.log` 至 `check-5.log`、两个真实浏览器结果及截图，并对照现存正式 `examples/github/verify.py` 的命令生成和成功后保存回执逻辑。没有重新执行整条 verify，也不将 Runner 的执行冒称 QA 新执行。

- 6条命令依次为 diff检查、Prettier、ESLint、JS语法、Owner core浏览器和本次feature浏览器；全部 `exit_code=0`，与正式脚本当前产品对应的命令集合一致。
- [existing/browser.json](runner-checks/existing/browser.json)：`passed=true`，16个动作，`errors=[]`、`failure=null`，performed与现存 `tests/browser/core.json` 完全一致。
- [feature/browser.json](runner-checks/feature/browser.json)：`passed=true`，75个动作，`errors=[]`、`failure=null`，performed与现存 `browser-plan.json` 完全一致。
- 两组截图为真实PNG；已查看 [核心终态](runner-checks/existing/screenshot.png) 和 [功能终态](runner-checks/feature/screenshot.png)，与日志终态一致。另有各自 `mobile.png`；不将390px自动截图称为320px实操。
- Prettier日志明确报告格式通过，其余5份命令日志为空；与成功命令无stdout的行为相容，不能从空日志另推导未提供的过程细节。通过回执由checks.json和独立browser.json支撑。
- 当前 app JS/HTML/CSS 的SHA-256均与前轮独立QA受测指纹一致；没有把新改实现和旧结果混用。Runner回执未含受测源码指纹，本轮不另声称已获得Runner运行时源码哈希证明。
- 结论：**Runner完整Development checks通过回执已核实，QA-L03关闭**。历史沙箱EPERM日志仍保留为当时失败记录，不再当作当前Runner环境阻塞。此91个Runner动作不加入独立QA的615动作统计。

## 未测范围、关闭记录与责任

| ID | 分类与影响 | 当前事实 | 补证路径 |
|---|---|---|---|
| QA-L01 | **非阻塞未测范围：实际读屏器朗读/专项兼容性** | AC-13的键盘、可访问文本、状态通知与焦点要求通过；当前工具不提供操作系统读屏器/朗读输出，未实际验证朗读，未作专项通过声明。前轮将其作为强制门槛的判断已撤回，依据见门槛复核。 | 不要求本次交付额外完成专项人工实测；若以后声明具体读屏器兼容性，需真实记录浏览器、读屏器/版本、步骤及实际播报/焦点结果。 |
| QA-L02 | **非阻塞未测范围：系统IME专项兼容性** | fill/Enter不能代表系统组合候选；contracts的组合门控非回归要求通过门控代码未变与编辑键盘/草稿回归核对，未把源码审查说成系统实测。未声明任何具体系统输入法组合通过。前轮强制人工门槛已撤回。 | 不新增本次交付门槛；若以后声明具体系统IME兼容性，需在真实输入法记录选字Enter、组合Escape、正常保存/取消及输入法/浏览器信息。 |
| QA-L03 | **已关闭：Runner完整门禁回执已核实**；不是产品缺陷 | [checks.json](runner-checks/checks.json)6条命令全部exit 0，core/feature日志16/75动作通过且与现存计划完全匹配；截图及日志已独立核对，见上节。历史[EPERM日志](verify-attempt.log)仅代表当时沙箱失败，不是当前Runner阻塞。 | 无需再次要求用户/Runner补同一门禁证据；保留原始成功和失败记录，不将Runner门禁通过扩写为系统IME/朗读专项通过。 |

QA-L01/L02是非阻塞的专项未测范围，不据此错误退回 requirements/design/development，也不标成专项通过；QA-L03已关闭。物理触屏真机、任意浏览器兼容、多标签同步等不在本轮已确认承诺中，不自行增加门槛。按批准范围，本次独立QA判定通过；门槛复核消息本身不是PR授权，其后用户已明确授权创建草稿PR并要求report交接，见下方授权记录。所有交接artifacts必须包含本qa.md；不扩写通过范围，不合并。

## 本轮文件集合

- 新建：本 `qa.md`、`qa-checks.log`、`qa-evidence.json`、4份 `qa-*-plan.json`、16组 `browser/qa-1-1` 至 `qa-1-16` 的真实日志/截图。
- 复用未修改：12份已有浏览器计划（含Owner core）、既有单元测试、批准产品/设计文档、app三文件及Trellis规范。
- 未更新：既有开发 validation.md、既有测试、任务进度索引和产品实现，以免QA记录覆盖上游事实。
- manifest 保存真实路径、字节、SHA-256、截图实际像素与本轮动作数；产品三文件指纹标识本轮受测实现，不包含凭据或本地Session历史。
- 本次补充更新：仅 `qa.md` 与 `qa-evidence.json`；复用未修改13个Runner现存文件（checks.json、6份命令日志、2份browser.json、4张截图），在manifest独立标识为现存回执核对证据，不混入QA新执行记录。
- 门槛复核更新：仅 `qa.md` 与 `qa-evidence.json`；复核PRD/契约/Trellis具体条款，并只读比较既有编辑函数及组合守卫；撤回QA-L01/L02强制门槛，保留真实未测范围。未新增任何人工通过证据，未改上游决定或产品实现。

## 用户验收与草稿PR授权（2026-10-02）

用户明确表示已审查独立QA报告、真实浏览器结果和Runner复验记录，确认按批准范围通过；要求保留系统IME、读屏器专项未测说明，不扩大通过声明。用户现已确认创建草稿PR，指定调用 `submit_handoff`、`target_stage=report`。本记录不补造任何专项测试结果。

授权边界：只推进报告交接及Runner创建草稿PR；代码审查继续作为单独流程，由独立Agent出意见并由人工后续判断。QA不自行启动/冒称完成该代码审查，不操作Git发布，不合并。工具尚未返回前仅记录用户授权与拟提交范围；是否接受交接、是否已创建PR，以真实工具/Runner回执为准。
