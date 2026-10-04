# Issue #97 本轮 design 返工核验与Owner输入

历史截图存储说明：本报告旧PNG已按原字节SHA256[无损归档](browser-archive/README.md)，browser.json原样保留；旧图片链接使用归档脚本按需恢复。当前development复验结论见[产品验证](validation.md)，本设计报告不替代研发或QA放行。

## 当前恢复结论：G2 HLD READY

用户明确要求恢复并继续本任务，提供平台修复提交 `eab78c2`、已部署bundled runtime及平台68项GitHub适配测试通过的说明。后两项属于用户提供的上游证据，本Agent没有自行调用GitHub、推送或重跑平台测试。已只读核对共享工具分支删除多余observations参数、保留observations输出，并通过当前注册check/verify独立确认实际行为，不只依赖修复说明。

本轮读取工具源码SHA256为 `4030be2539d902ea9e9ccd354c88c7f580075966ea07a4ffb85a13ee03f6ff51`；它标识只读源码快照，不冒充上游提交证明。用户提供的design-1-14/15/16回执均已核对；随后本Agent再次执行以下真实检查，全部原计划/脚本/AC保留：

| 本轮复验 | 真实证据 | 当前判定 |
|---|---|---|
| 原样tool-zero-writes | [design-1-17](browser/design-1-17/browser.json) | Passed，5动作，0写，包含刷新及原零写断言 |
| 原样tool-new-write | [design-1-18](browser/design-1-18/browser.json) | Expected Failed：1≠0，实际正常计数断言，无TypeError；工具负向回归成功，不是产品失败，不改passed字段为true |
| 原型原样native能力 | [design-1-19](browser/design-1-19/browser.json) | Passed，8动作；实际原生zoom2、DPR2、720/160 CSS px文本完整、AX可见，observations保留 |
| 原型states | [design-1-20](browser/design-1-20/browser.json) | Passed，35动作；状态、错误及查看/筛选/刷新零写区间 |
| 原型core | [design-1-21](browser/design-1-21/browser.json) | Passed，24动作；原主线加改名/删除/撤销 |
| 原型touch | [design-1-22](browser/design-1-22/browser.json) | Passed，12动作；320px、touch=true、Tab/Enter/tap，非物理设备 |
| 原型layout | [design-1-23](browser/design-1-23/browser.json) | Passed，22动作；100%桌面/320px及CSS模拟，原生证据另由native计划提供 |
| 原型error | [design-1-24](browser/design-1-24/browser.json) | Passed，9动作；故障注入后文案/版本可见且原始值不变 |
| 原型CSS zoom演示 | [design-1-25](browser/design-1-25/browser.json) | Passed，4动作；仅布局模拟，不替代原生zoom |
| 原型empty | [design-1-26](browser/design-1-26/browser.json) | Passed，8动作；刷新/原始值/零写检查 |
| 产品原样四组layout/AX | [design-1-27](browser/design-1-27/browser.json) | Passed，26动作；1440/320窗口各100%/200%、文字完整/无新增文档宽/遮挡、AX、原始值及零写均通过 |
| 注册完整verify | [delivery-checks/checks.json](delivery-checks/checks.json) | 本轮实际8项全部exit_code=0：diff、Prettier、ESLint、JS语法、核心浏览器、feature浏览器、Node测试、Python部署测试 |

7份既有原型计划本轮114动作重新通过，另有native/产品矩阵/零写正向检查；负向回归单独判读，不混进产品通过动作数。已实际打开design-1-20桌面、1-23末视口320截图，页脚版本完整；1-27原生zoom-19截图仍只捕获上部，不把截图当作底部版本证据。原生完整性来自Range/元素几何、真实zoom/DPR及AX；AX树不冒充语音，CSS模拟不替代原生。160 CSS px整页旧最小宽仍320，版本未新增溢出，不扩大为全部书单布局改造。

当前所有design必需检查通过；G2基于本轮复验重新判定Ready，原A-003放行依赖解冻、A-004工具依赖关闭。自主策略授权普通返工恢复，用户请求继续不等于逐项审查具体产物。PRD、AC-01～06、版本0.1.0 rc2及只读页脚选择不变，没有新增范围或待用户回答项。

本轮本地核验通过117个相对文档链接、7份原型计划与回执逐动作相同（114动作）、正反例及8项verify实际结果、精确单一版本、footer宽度规则、原型与产品业务JS字节相同、5条需求/6条AC完整引用。两份原型JS node --check及git diff --check退出0。另读取1-19两份真实AX树，标签和值确属同一非ignored paragraph，不推断语音已测。

本轮只更新任务文档/索引，复用已修复原型；未改产品、release声明、公共Harness/工作流、用户脚本或Git。design就绪不等于独立QA/上线完成：交development重新全量复验core、feature、touch、旧数据fixture、原样native和layout/AX、fix/完整verify，并按本轮兼容证据更新发布声明与研发报告，之后才交独立QA。最终合并和高风险发布仍由用户授权。交接结果以注册工具回执为准。

## 前一轮阻断记录（历史，不是当前状态）

## 当前结论和影响

**G2 NOT READY（验证依赖阻断）**。本轮接收development反馈后重新执行check及verify，不沿用初次交接或历史通过。版本0.1.0 rc2、页脚设计、PRD及AC不变；160 CSS px产品修复已保留并同步到原型，原生zoom/AX能力存在且已实际执行。当前阻断是共享工具零写断言本身错误，不是缺少产品方向或真实设备。没有待用户重新批准的产品决策。

本轮仅更新设计/原型/契约与证据，不修改app/、release声明、公共Harness、工作流或受保护配置。没有Git写操作、直接GitHub调用或外部部署。当前不交研发/QA；Owner上游修复及同步需要在本任务权限以外完成，已把可执行最小输入明确列出，不将同一缺口原样退给同样没有权限的阶段。Owner同步后在design核对解除，重新进入development全量复验，不复用旧G2放行。

## 真实执行证据

| 本轮调用 | 真实结果 | 说明 |
|---|---|---|
| app + 原样browser-layout-regression.json | [design-1-10/browser.json](browser/design-1-10/browser.json) Failed | 四组原生缩放、几何/无新增宽度/AX及原始值检查都执行；最后共享unchanged_storage_writes报TypeError，storageWrites=0。部分成功不等于整体通过 |
| 注册verify | [delivery-checks/checks.json](delivery-checks/checks.json) Failed | 本轮前5gate退出0，第6feature退出1，后续gate未执行；错误仍为数字0被当作message，不能沿用旧Node/Python门禁成功 |
| 原型修复前 + 原样native计划 | [design-1-11/browser.json](browser/design-1-11/browser.json) Failed | 160 CSS px版本仍越界，发现初次原型未同步产品footer宽度修复；不是仅复述上游报告 |
| 原型加footer max-width后 + 同一原样native计划 | [design-1-12/browser.json](browser/design-1-12/browser.json) Passed | 原样8动作全部通过，actualZoom=2、DPR=2，720/160 CSS px文本边界完整、无版本焦点、AX可见，storageWrites=0；没有零写公共断言，不能替代整套门禁 |
| 原型原样check-empty.json | [design-1-13/browser.json](browser/design-1-13/browser.json) Failed | 空态、刷新、原始值保持均成功，最后unchanged_storage_writes仍TypeError，storageWrites=0；初次该计划的历史通过已经不适用于当前工具 |
| 既有独立复现及Node语义实验 | [reproduce-tool-storage.cjs](reproduce-tool-storage.cjs) 实际运行；本轮额外终端实验 | 当前错误调用在零写下仍TypeError；正确三参数调用对0=0、2=2通过，对1≠0产生AssertionError。只是修复方向验证，未修改共享工具，不能作浏览器门禁替代 |

所有原样用户脚本和计划保留，没有删、重排、替换既有断言。check以隔离page_script执行，未在shell启动浏览器。

产品本轮四组测量：

| 窗口 / 原生倍率 | CSS视口 / DPR | 版本文字水平范围 | 页宽 / 临时还原旧footer基线宽 |
|---|---|---|---|
| 1440 / 1 | 1440 / 1 | 679.1875～760.796875 | 1440 / 1440 |
| 1440 / 2 | 720 / 2 | 319.1953125～400.796875 | 720 / 720 |
| 320 / 1 | 320 / 1 | 119.1875～200.796875 | 320 / 320 |
| 320 / 2 | 160 / 2 | 39.1953125～120.796875 | 320 / 320 |

基线法是任务脚本临时还原HEAD页脚内容并移除新增max-width，保留未改body/main/业务JS，再恢复原DOM及style；不写存储、不永久修改页面。160 CSS px仍有原body最小宽320造成整页横滚，版本未新增文档宽，不能宣称修复全部旧业务布局。原型修复后160 CSS px得到同样版本范围，与产品一致。

本轮实际读取design-1-12两份AX文件，标签“版本 ”与值“0.1.0 rc2”为同一paragraph内两个非ignored StaticText。对标签和值分别检查，不增加ARIA副本；这不是读屏语音实测。已打开检查 [原生截图](browser/design-1-12/zoom-6.png)：工具只捕获上部，不能据此称底部版本出现在截图；完整性依据原生指标、真实Range/元素几何及AX。已打开 [零写失败计划桌面截图](browser/design-1-13/screenshot.png)，该100%截图确有页脚版本，但不抵消公共门禁失败。

## 根因、Owner最小操作及可执行验证

只读定位实际工具 `/Users/zhaojiuzhou/work/agent_platform/examples/github/tooling/full_harness/browser/check.cjs` 的unchanged_storage_writes分支约332～344行：

```js
assert.equal(storageWrites, observations, writeSnapshot, "localStorage write attempts changed");
```

当前已读取源码SHA256为 `32a22fd70113aef2bbd88aa3ace138b3d0afab95900005d33f7e719916cf8946`，不是已审查提交号。错误是第二参数多了observations数组，第三参数为数字writeSnapshot，Node因此报 `ERR_INVALID_ARG_TYPE`。本轮注册check/verify及独立最小复现均支持此根因。

Owner需在共享工具上游修复为以下语义，并由既有受审查同步流程提供正确版本；**不在产品仓库或本任务Agent权限内修改工具**：

```js
assert.equal(storageWrites, writeSnapshot, "localStorage write attempts changed");
```

至少增加工具自身两类回归：无新增写应通过，确实新增写应产生计数断言失败而不是TypeError；还要保证observations/zoom/AX输出保留。为最小可执行输入，本任务提供两份诊断计划，修复同步后在独立浏览器上下文、root=本任务prototype用注册check执行：

- [tool-zero-writes.json](tool-zero-writes.json)：snapshot→刷新/可见→原始值→写次数；预期Passed、0新增写。
- [tool-new-write.json](tool-new-write.json)：snapshot→正常添加一本→写次数；预期Failed且末动作是实际计数不等，不能TypeError，失败结果应记录storageWrites增加。它是预期失败的工具负向用例，不是产品放行失败、不作为替代产品门禁。

两份计划本轮未运行，先等待Owner修复后用以核对同步；当前相同零写故障已由design-1-10和1-13真实复现，不反复空转。Owner工具自身回归不由本任务两份输入代替。这些计划仅在注册工具新建的临时上下文操作演示书籍，不读写用户产品存储。

## 恢复条件和阶段责任

1. Owner提供上游修复与回归成功，并同步已审查工具版本；记录版本标识而非只说“已升级”。不改本任务AC、门禁或受保护配置。
2. design用注册check核对两类工具用例、原生计划和原型；对受影响G2及能力映射复审。只在实际所需检查通过后交development，不能把Owner动作记成用户已批准设计。
3. development重新执行核心、专项、触屏、旧数据fixture、原样native、四组layout/AX、fix及完整verify，保存当前结果；根据本轮兼容性证据更新release声明。不沿用旧结果以跳过失败或未执行gates。
4. 研发必需检查全过才能交独立QA；QA复核，不承担修复公共工具缺口。最终PR合并和高风险发布仍保留人工授权。

条款来源与责任见 [契约C-05](../../../01-architecture/tasks/97/contracts.md)，设计索引和G2已更新为未重新放行。非阻断风险仍为页脚发现性/手工版本陈旧；共享断言修复是唯一当前外部解除条件，不需要增加版本管理功能。

## 文档和范围核验

本轮执行两份原型JS的node --check、git diff --check均退出0；任务文档相对链接逐一检查存在，四份本轮check回执Passed/Failed及动作计数与报告一致；两份Owner诊断计划JSON可解析。原型app.js与当前产品app.js字节一致，条款来源和阶段主责对照PRD自查完成。独立检查不是完整verify通过证据；产品/QA放行仍阻断。所有初次及本轮失败证据保留，不用旧7计划成功抵消升级后失败。
