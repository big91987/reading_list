# Issue #74 产品验证与研发交付

日期：2026-10-01（本轮研发记录，保留上游原日期）；执行：development Agent。基线HEAD `bff9bb10eafb548783c8cb7b8adb0cfb9b6f0a8c`，当前任务分支 `codex/issue-74-platform`。检查对象是当前正式app三个文件，不把上游原型通过算作产品通过。

**结论：产品实现及可执行注册浏览器/静态检查通过，Ready for Review；Runner正式环境独立门禁待执行。** 用户已授权迁移核心计划并交付草稿审查，当前无产品/验证定位阻塞。普通沙箱verify的端口权限失败如实保留，不等同MCP浏览器失败；不声称正式门禁通过、完整人工验收、草稿PR已创建或合并。

## 实际实现与检查范围

保留全部/未读/已读顺序，增加按钮内filter-count span。render从完整有效books派生三数并与摘要同轮更新；不替换按钮，不添加可访问标签覆盖数字。成功持久化后生效、失败保持原值，书名编辑不改数。原localStorage键、JSON、错误处理、加载规则均未修改；无搜索/后端/计数存储/依赖。CSS仅增加等宽数字、44px最小高度、nowrap及整按钮换行。

## AC追踪

| AC | 方法/结果 | 证据 |
|---|---|---|
| 01 | 3/2/1、全部选中、摘要一致、DOM名称含数字；通过 | development-1-19、13；集成17全量断言 |
| 02 | 三筛选列表、选中态正确且全量计数不变；重复render无写入且按钮身份/焦点保留；通过 | 19、17 |
| 03 | 新增D为4/3/1，删已读A为3/3/0，删未读B为2/2/0；通过 | 19、17 |
| 04 | 分类下双向标记条目移出列表，全部不变且分类即时更新；通过 | 19、17 |
| 05 | 成功新增、双向标记、两类删除均逐步刷新重新恢复；通过 | 19、17 |
| 06 | 空集合、仅已读、仅未读、零分类按钮可选及原空态文案；通过 | 2、17、16 |
| 07 | 空白/大小写重复新增不写入；QuotaExceededError及SecurityError分别注入实际Storage.setItem，新增/删除/状态均保留内存和原JSON，恢复重试仅生效一次；通过 | 17下载报告8个故障/重试用例（含编辑），失败提示精确断言 |
| 08 | 保存/取消/无效编辑数量不变；原规则、数据扩展字段、对象目标、长度/去重/错误/草稿与焦点回归；通过 | 2、17；71集成6（18/18）；71用户旅程8与键盘11 |
| 09 | 自动部分通过：桌面/窄屏名称、数字、点击、真实Tab/Enter/Space、44px高度；视口320/375/430/431/640/641/650/651/1280及四位数无溢出；真实触摸/读屏待人工 | 10、13、16；17下载报告9种视口实测 |
| 10 | 原键/JSON/旧数据未知字段/历史重复长标题/损坏JSON/非数组/部分无效记录恢复不覆写，完整有效集合统计；既有主线迁至产品自有tests/browser/core.json，保留原16业务动作及断言，只同步3按钮名；注册浏览器通过，旧计划失败留作历史 | 17；正式核心18；历史副本7及旧定位失败3 |

结果数字顺序在本报告使用all/unread/read，和DOM原顺序一致。AC-09为Partial/待人工，其他功能断言通过；AC-10核心计划已通过注册check，Runner正式环境复验另行执行，历史旧计划失败不删除。

## 注册真实浏览器证据

所有run目录位于本目录 `browser/`，均含browser.json、screenshot.png、mobile.png；其中mobile.png由执行器额外设置390px截取，不误称320px。320px证据是16的screenshot.png及17的测量。最终10份有效计划共273动作、无浏览器错误；内部集成额外28项计数+18项71回归，不用内部case数冒充浏览器动作数。

| 当前计划 | 最终run | 动作/结果 |
|---|---|---|
| browser-plan.json | development-1-19 | 72/通过（计数与逐动作刷新） |
| browser-states-plan.json | development-1-2 | 54/通过（空态/编辑/手机） |
| browser-integration-plan.json | development-1-17 | 3/通过，download-1.json为28/28完整结果与9视口bounds |
| browser-integration-71-plan.json | development-1-6 | 4/通过，download-1.json为18/18完整结果 |
| tests/browser/core.json | development-1-18 | 16/通过，Owner原动作与断言，只更新三个期望按钮名 |
| browser-regression-71-plan.json | development-1-8 | 63/通过，71原旅程只同步含计数按钮名称 |
| browser-keyboard-plan.json | development-1-10 | 19/通过（真实Tab/Enter/Space选择分类） |
| browser-keyboard-71-plan.json | development-1-11 | 28/通过（原71键盘编辑流程） |
| browser-sample-plan.json | development-1-13 | 6/通过（正式产品样例截图） |
| browser-large-plan.json | development-1-16 | 8/通过（320px四位数与可选零分类截图） |

动作数由最终审计脚本逐份重新求和，不将历史复跑累加。截图13桌面和16的320px已视觉检查；纸色/字体/下划线沿用，数字可见、无裁切。17测得320px 2000/1000/1000三按钮高度44、左右界35～285、第三按钮整行换到top718.703125；375px及其余视口单行正常。16选择未读0展示原空态；旧14千行全页截图过长仅保留历史，不依赖缩略图判定可读性。

## 失败、修复与门禁阻塞（保留真实历史）

1. 初次新增计划121动作超过工具80动作上限，被拒绝无run目录；拆为72及54动作两个独立可重放计划，1/2通过。
2. 原Owner `.harness/reading-core.json` 在3仅执行6动作后，精确定位旧名称“已读”超时；新契约可访问名称为“已读 1”。任务副本仅替换已读1/未读1/全部2三个定位，7的16动作通过，无断言放宽。原Owner文件保持与HEAD完全一致。
3. 曾尝试同步原Owner计划上述三定位，注册工具拒绝“Protected execution files changed”，无run目录；立即撤销，未改共享执行器或受保护工作流。这一历史阻塞已由用户本轮明确授权的修复解决：接入示例verify.py已优先采用tests/browser/core.json（不存在才回退旧计划，空计划失败），研发核实代码并迁移，18的16个原动作/断言通过。受保护旧文件不改，不隐藏数字、不绕过门禁；任务副本保留历史，新的产品核心文件才是正式入口。
4. 初次集成4使用click而非download，未保存报告；5改download取得结果。后续加强精确错误/空态断言并增加截图控制后重跑12/15；最终格式化修复后又重跑17，以17及fixture-source-hashes.json绑定的源为准。4/5/12/15均为历史通过，不冒充当前源报告。
5. 键盘9在已完成Tab/Enter/Space后因工具不支持Shift+Tab失败；删去该无支持动作，用刷新检查结束，10通过。不声称验证反向Tab。
6. 用户指定共享verify --fix成功（产品Prettier/ESLint）。最终verify依次完成diff/Prettier/ESLint/node语法，但进入existing浏览器时被沙箱拒绝监听127.0.0.1，错误 `listen EPERM: operation not permitted 127.0.0.1`；exit=1，日志delivery-checks/check-0.log～check-4.log。未更改沙箱、未申请升级权限、未绕过真实浏览器；实际浏览器证据全部来自注册check。本轮迁移后重跑verify，仍exit1/端口EPERM，错误命令明确选中新的tests/browser/core.json；注册check的18/19真实通过。因此普通沙箱错误不代表MCP失败，Runner将在正式环境独立复验；不伪造其通过。
7. 补充测试夹具格式检查发现browser-tests.js格式问题，quality-evidence-before-format.json保留exit1；使用既有Prettier修复、重新运行集成17并更新源哈希，最终quality-evidence.json八项全部exit0。产品源码未因此改变。

## 静态质量与复现

- 配置共享命令（工作区执行）：`/Users/zhaojiuzhou/work/agent_platform/.data/runner-venv/bin/python /Users/zhaojiuzhou/work/agent_platform/examples/github/verify.py --config /Users/zhaojiuzhou/work/agent_platform/.data/github-runner.json --issue 74 --fix`；exit0。
- 同一命令去掉`--fix`为正式门禁；exit1如上，不能记为通过。
- 单独Owner配置Prettier check（app和74测试JS/CJS/HTML/计划）、ESLint（app）、node --check（app与测试）、git diff --check均exit0；结果见quality-evidence.json。未改Python产品，不适用Python质量入口；原生静态JS没有独立type-check或build。
- 准备74夹具：`node docs/05-validation/tasks/74/tests/stage-fixture.cjs prepare`；它备份产品HTML为app/product-under-test-74.html并临时替换根入口、复制测试脚本，JS/CSS仍为原产品。对app根执行注册check及本目录integration/sample/large计划；完成后始终执行同脚本`restore`，恢复HTML并移除所有临时文件。71同理复用 `docs/05-validation/tasks/71/tests/stage-fixture.cjs`，结果源哈希记录在fixture-71-source-hashes.json；不修改71测试源及历史证据。
- 普通flow/state/core/键盘/regression计划应在产品根已恢复时执行，每次独立隔离浏览器。audit：`node docs/05-validation/tasks/74/tests/audit-evidence.cjs`验证源哈希、夹具清理、计划/动作匹配、下载case全部通过及保护文件未变。
- 手动产品预览由Owner或Runner按既有静态app入口执行，无新增产品运行依赖。回退撤销app三个文件计数变更即可，旧JSON无需迁移。

## 交付与剩余责任

新增：LLD、implement、validation、74集成夹具/staging/audit、计划、hash/检查/浏览器证据。更新：app三个文件、frontend/book-state规范、任务及项目索引。复用：批准PRD/原型/HLD/contracts/台账、Owner原计划和71原集成/键盘（保持原文件）；完整文件清单见development-artifacts.md。未改.github/、harness/、harness-project.json、harness-upstream.json；原Owner回归计划已恢复，授权新增tests/browser/core.json为正式产品回归入口，原16动作和断言只改三个按钮定位。没有GitHub/分支/提交/推送/PR操作。

待人工：物理手机触摸、屏幕阅读器真实朗读、系统IME及跨浏览器人工兼容性。Storage错误在真实浏览器API边界注入，不等于实际耗尽设备配额或操作系统策略实测。产品无后端/GPU，不声称验证此类能力。这些人工缺口不阻止草稿审查，用户已授权；此前受保护定位问题已经迁移解决；Runner正式门禁仍须独立执行，不能按“人工待验收”豁免。

当前实现与注册验证可供审查，研发交付Ready for Review；Runner按新的核心计划在正式环境独立复验，再提交任务分支并创建草稿PR，不合并主线。需求/设计无新问题，不需重复确认；交接执行结果以注册submit_handoff回执为准。

## 本阶段交付自查

已执行Trellis/交付Skill自查：比对已批准PRD、原型、HLD、contracts与LLD；计数口径、保存边界、原顺序/焦点/语义及最小样式一致，没有设计偏差；新增源码只读投影，不引入跨层API或重复统计状态。全部AC有产品证据及人工缺口标注；核心计划审计与原计划逐动作对比，保证业务动作/断言未削弱；质量与源哈希审计通过，禁改目录和历史Owner计划未变。自查结论Ready with Non-blocking Gaps；无额外评审模型，不替代Runner独立检查或Owner最终体验验收。公共恢复入口为任务索引→implement→本报告及development-artifacts，无需聊天记录即可复验。
