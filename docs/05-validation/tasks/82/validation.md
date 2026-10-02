# Issue #82 产品研发验证

2026-10-02 · development · **用户已明确授权独立QA交接，工具回执前不宣称已交接**。这是产品 `app/` 的实施/自测，不是原型通过记录，不是独立QA结论，也不代表PR发布或合并。

## 可运行成果与范围

- 入口：`app/index.html`，浏览器可直接打开；在允许本机监听的环境可运行 `python3 -m http.server 8080 --directory app` 后打开 localhost:8080。沿用既有浏览器本地存储，无安装/构建/后端依赖。
- 产品变更：`app/app.js` 的 deleteBook/undoLatestDelete/renderUndo；`app/index.html` 的筛选下常驻撤销栏；`app/styles.css` 的换行、窄屏按钮及反馈换行。无原型代码复制、测试宿主或调试API。
- 仅最近成功删除可撤销，无倒计时，刷新失效；恢复最后保存的title/read/完整序位和未知字段；正常操作保留机会；同名冲突与存储失败可修复后重试；保留筛选及其他书的编辑草稿/错误/新增输入。
- 批准基线：PRD、HLD、contracts、interaction及原型均复用。研发细化见 `docs/01-architecture/tasks/82/lld.md`；计划/任务状态见 `docs/04-implementation/tasks/82/implement.md`。没有业务规则或交互契约偏差。

## 真实产品浏览器结果

注册工具 `check(root="app", plan=下表项目相对路径)`，每次独立浏览器上下文。下表为12份**最终有效计划**，共517动作通过，所有返回errors为空。每个结果目录有原始browser.json、screenshot.png及自动mobile.png；mobile.png是工具附带390px截图，不能当成320px操作证据。320/1280px证据用计划显式viewport后的screenshot.png。

| 计划 | 结果目录（本目录下） | 动作 | 结果/重点 |
|---|---|---:|---|
| `tests/browser/core.json` | `browser/development-1-9/` | 16 | Passed；Owner主线原样复制，全部原业务动作与断言保留 |
| `docs/05-validation/tasks/82/browser-plan.json` | `browser/development-1-3/` | 75 | Passed；连续删除/新增后恢复/筛选/正常操作/编辑草稿/恢复焦点/刷新 |
| `docs/05-validation/tasks/82/product-storage-failure-plan.json` | `browser/development-1-2/` | 69 | Passed；1280px实际删除失败/撤销失败、存储未变、同页解除后重试与刷新 |
| `docs/05-validation/tasks/82/conflicts-plan.json` | `browser/development-1-8/` | 47 | Passed；320px新增与改名冲突/隐藏大小写冲突/重试/长名 |
| `docs/05-validation/tasks/82/keyboard-plan.json` | `browser/development-1-6/` | 69 | Passed；320px无鼠标click，用fill输入/焦点定位和真实Tab/Enter/Space/Escape操作 |
| `docs/05-validation/tasks/82/empty-plan.json` | `browser/development-1-7/` | 17 | Passed；唯一书桌面恢复，320px空态实际写失败 |
| `docs/05-validation/tasks/82/desktop-plan.json` | `browser/development-1-10/` | 47 | Passed；1280px冲突/隐藏恢复/长名 |
| `docs/05-validation/tasks/82/conflict-state-plan.json` | `browser/development-1-11/` | 11 | Passed；320px冲突状态存储未变/截图 |
| `docs/05-validation/tasks/82/desktop-conflict-state-plan.json` | `browser/development-1-12/` | 11 | Passed；1280px冲突状态存储未变/截图 |
| `docs/05-validation/tasks/82/desktop-failure-plan.json` | `browser/development-1-13/` | 17 | Passed；1280px空态恢复及真实失败提示/截图 |
| `docs/05-validation/tasks/82/desktop-keyboard-plan.json` | `browser/development-1-14/` | 69 | Passed；1280px键盘完整旅程，最终撤销焦点可见 |
| `docs/05-validation/tasks/82/narrow-storage-failure-plan.json` | `browser/development-1-15/` | 69 | Passed；320px实际故障→同页解除→重试→刷新全部旅程 |

工具仅支持有限JSON动作，原122动作计划超出80动作限制，拆成独立75/47动作计划；首次绝对app根目录不匹配Owner注册，改用相对app后成功，未改Owner配置。`development-1-5`的37动作后失败是工具拒绝Shift+Tab，不是产品错误；改为支持的Tab加输入框焦点定位，`development-1-6`复验通过。`development-1-1`为早期多加一次reload的核心尝试；最终core已恢复为与Owner文件逐字一致，使用development-1-9。

## 故障与整改证据

- storage_write_failure(true)令真实产品的localStorage.setItem抛错；snapshot_storage/unchanged_storage断言持久数据不变。真实按钮操作后书/统计/机会/错误可见，关闭故障后在**同一页面**重试，刷新检查已读状态与没有重复恢复。1280/320px均完成69动作；没有伪造提示、替换首页、iframe、内部深比较或额外异常门槛。
- 截图检查发现 `development-1-4` 虽动作通过，但长名新增反馈让320px页面全页PNG宽度变成341px。这是实际产品布局缺陷，**不把动作通过当作视觉验收通过**。在.form-message增加overflow-wrap:anywhere，修复正文反馈min-content撑宽，`development-1-8`全页PNG宽度320px；1280px长名也检查通过。保留原始图和日志供QA核验。
- 已通过view_image人工检查产品截图：development-1-4（失败布局）、1-8（修复后320px长名）、1-10（1280px长名）、1-11（320px冲突）、1-7（320px空态/失败）、1-14（1280px键盘焦点）。图和原始像素尺寸见development-artifacts.json。不以截图推断存储成功，故障结果来自实际断言。

## AC逐项追溯（研发自测）

| AC | 结果 | 证据与边界 |
|---|---|---|
| 01 | Automated Passed | browser-plan删除/撤销反馈；故障计划已读B恢复；unit精确title/read/index |
| 02 | Automated Passed | browser-plan删C再删A仅恢复A；无机会/连续handler调用单元不重复写入 |
| 03 | Automated Passed | empty-plan及keyboard唯一书空态入口与恢复 |
| 04 | Automated Passed | browser-plan覆盖新增、改名、阅读、筛选、编辑取消/校验、刷新；源码无计时器 |
| 05 | Automated Passed | browser-plan已读删除后未读隐藏恢复、再筛选查见；冲突计划已读视图隐藏恢复；unit断言filter不变 |
| 06 | Automated Passed | conflicts/desktop-plan新增同名、存储快照不变、先改现存书再成功恢复双方 |
| 07 | Automated Passed | conflicts/desktop-plan改成小写dune并隐藏于已读之外，拒绝、改名重试保留双方 |
| 08 | Automated Passed | product-storage/narrow-storage：删B失败保留A，恢复A；另一次失败后重删B成功替换A |
| 09 | Automated Passed | product-storage/narrow-storage：失败前后书/统计/Storage未变，机会保留，关闭后重试及reload |
| 10 | Automated Passed | browser-plan实际删B加D恢复、删C再删A只恢复A；unit精确数组A/B/C/D和A/B；越界末尾仅内部守卫单元，不冒充可达UI旅程 |
| 11 | Automated Passed | browser-plan恢复后Enter保存他书未保存草稿，新增输入继续提交；删除自身草稿后恢复已保存书；unit错误/对象引用保留 |
| 12 | Automated + visual Passed | 320/1280实际旅程、长名/空态/冲突/失败截图；原341px溢出已修复复验，无以390px代称320px |
| 13 | Automated Passed / Human evidence pending | 320/1280键盘计划；删除后Space可撤销、恢复后Enter可编辑、草稿恢复后Enter可保存，证明关键焦点链；DOM保留status/alert/aria名称与focus-visible。系统IME和屏幕阅读器实际朗读未验证，不声称通过 |
| 14 | Automated Passed with stated legacy boundary | Owner core、新增空/同名、编辑保存/取消/校验、阅读/筛选/统计/空态/reload旅程；旧JSON扩展字段/重复/长名/加载无回写为独立unit证据，不称旧数据导入浏览器旅程 |

## 单元及共享质量检查

- `node --test tests/undo.test.cjs`：9/9通过，原始输出unit-tests.log。读取实际app源码进入隔离Node VM，DOM/Storage是单元替身。覆盖序位/越界、未知字段、现存引用、失效目标、无机会、大小写/隐藏冲突、失败保留、最后保存版本与刷新初始化。这些结果独立于真实浏览器，不作为用户旅程证明。
- 用户指定共享 `verify.py --config <runner-config> --issue 82 --fix`：成功，Prettier修复app JS/HTML；ESLint --fix无剩余错误。
- 用户指定最终 `verify.py --config <runner-config> --issue 82`：**未整体通过**。git diff --check、Prettier --check、ESLint、node --check app/app.js均exit 0，原始日志delivery-checks/check-0.log至check-3.log。check-4.log：shell浏览器启动本机HTTP监听时报 `listen EPERM: operation not permitted 127.0.0.1`，整条命令exit 1；未到该命令的feature浏览器步，不生成伪造checks.json。再次尝试及规范化输出见verify-attempt.log。
- 不改受保护Harness、不在shell另启Chromium、不申请禁止的提权。正式注册check可在许可环境执行；同一core/feature计划已真实Passed。**Runner完整质量门禁仍需在允许端口的执行环境复验，不能以正式check替代其回执**。
- 无产品Python、无独立TypeScript/type checker或构建步骤。没有声称后端/GPU正确性。

## Trellis / delivery自查

已按trellis-before-dev读取索引、具体book-state、共享指南、PRD/原型/设计契约，边界在implement.md；按trellis-check审查diff、候选写入顺序（DOM→candidate→Storage→books→undo→UI）、现存引用/编辑对象、复用persist和focusControl、文本安全、筛选/错误/焦点与无计时器。无需新增模块/依赖，未触碰受保护路径。持久接口不变；经验及可执行签名更新 .trellis/spec/frontend/book-state.md，项目现状和索引同步。交付清单覆盖14AC、依赖/任务Owner/证据/下一步；独立QA仍未执行。T1/T2/T3 In Review，不标为Done或Accepted。

## 本轮产物清单

机器可核验完整路径/字节/hash/像素及最终结果索引：`development-artifacts.json`，**不替代**上游design/audit.json。

- 更新：app/app.js、app/index.html、app/styles.css、.trellis/spec/frontend/book-state.md、docs/00-global/project.md、docs/README.md、docs/04-implementation/tasks/82/README.md。
- 新建：docs/04-implementation/tasks/82/implement.md、docs/01-architecture/tasks/82/lld.md、tests/undo.test.cjs、tests/browser/core.json、本目录validation.md、development-artifacts.json、unit-tests.log、verify-attempt.log、delivery-checks原始日志，以及上表新增计划和15组development浏览器结果/截图。product-storage-failure-plan.json是上游复用，未修改。
- 复用未改：批准PRD/决策、HLD/contracts/架构台账/追溯、design索引/interaction/G2/audit、原型源码/运行依赖/设计证据与fault计划。需求/设计文件来自上游共享工作区，即使Git尚未跟踪，也不将其冒称本阶段新建。

## 未解决事项与下一步

当前无已知未修复产品缺陷；共享verify整条命令的EPERM环境失败、系统IME/实际屏幕阅读器证据未完成，已明确记录，不等于产品全部验收通过。保持原型及批准基线，不需要重审产品决定。2026-10-02用户明确确认通过submit_handoff交给独立QA；授权仅QA验收，不创建PR、不合并。工具回执是交接是否成功的依据。未操作Git分支/提交/推送或GitHub。

## 用户产品检查与授权记录（2026-10-02）

用户报告已在真实产品网页手动检查连续删除、筛选后撤销、保留他书编辑草稿，以及同名冲突后改名重试，认为与当前需求一致；已阅读validation.md，包括环境和人工证据缺口。此为用户反馈，不冒称Agent亲自观察或独立QA结论，也不补成系统IME/屏幕阅读器证据。用户明确要求通过工具继续，**仅授权独立QA验收，不创建PR、不合并**。QA需依据真实实测自行判定，通过/返工及返回阶段不预设；完整verify环境复验和其他人工缺口随包保留。

原始Issue：https://github.com/big91987/reading_list/issues/82
