# Issue #97 development 验证记录

日期：2026-10-04。本轮接续 design 恢复交接后独立复验；当前结论：**Ready for independent QA**。研发检查完成，不代表 QA 已放行、用户逐项批准、PR 已创建、合并或部署。交接执行以注册工具回执为准。

## 可运行成果与范围

预览：`python3 -m http.server 8000 --directory app`。原页脚“一本一本，慢慢读完。”保留，独立一行展示唯一普通文本“版本 0.1.0 rc2”，14px、muted 色、自然文档流。产品仅修改 app/index.html 和 app/styles.css；不复制原型控制，不改业务 JS、API、网络资源引用、存储键或格式。

原生320px窗口200%形成160 CSS px视口；旧body min-width:320px让footer居中位置超出视口。保留最小修复 `footer { max-width: 100vw; }`，不重构body/main/旧书单布局。[原失败](browser/development-1-9/browser.json)与诊断仍保留；本轮原样计划与脚本通过，不修改断言或降低AC。160 CSS px下版本文字边界39.1953125～120.796875、footer0～160；整页宽320与临时还原HEAD footer基线320相同，**不声称修复整页旧窄屏布局**。

## 本轮真实产品浏览器检查

全部使用注册check；每份计划独立上下文，6份产品计划合计159动作通过。产品root为app，兼容fixture为本轮复制产品字节的prototype/product-validation，演示控制不进入产品。

| 计划 | 真实回执 | 动作 | 结果与覆盖 |
| --- | --- | --- | --- |
| tests/browser/core.json | [development-1-17](browser/development-1-17/browser.json) | 16 | Passed；既有核心旅程原样保留 |
| browser-plan.json | [development-1-18](browser/development-1-18/browser.json) | 64 | Passed；版本/空态/混合/三筛选/无结果/刷新/写入失败及恢复/键盘/改名删除撤销 |
| browser-touch.json | [development-1-19](browser/development-1-19/browser.json) | 20 | Passed；320px，hasTouch/isMobile=true，真实tap，非物理手机认证 |
| browser-native-capabilities.json | [development-1-20](browser/development-1-20/browser.json) | 8 | Passed；原样native200%/version-layout.js/AX，无放宽原失败断言 |
| browser-layout-regression.json | [development-1-21](browser/development-1-21/browser.json) | 26 | Passed；1440/320窗口100%及200%，四组文字完整/遮挡/基线宽度/原始值/零写/AX |
| browser-fixture.json | [development-1-22](browser/development-1-22/browser.json) | 25 | Passed；旧中文JSON、未知字段及空白原始值、异常加载及恢复、零写 |

[桌面截图](browser/development-1-18/screenshot.png)、[320px触屏截图](browser/development-1-19/screenshot.png)、[旧数据fixture截图](browser/development-1-22/screenshot.png)已打开检查。原生缩放截图捕获仍只包含页面上部，不声称截图覆盖底部版本；原生文字完整性由实际Range/DOM几何、缩放指标和AX证实。原生200%实际factor2、DPR2，1440窗口为720 CSS px，320窗口为160 CSS px；CSS放大不代替原生证据。

AX [桌面200%](browser/development-1-20/accessibility-4.json)及[160 CSS px](browser/development-1-20/accessibility-8.json)中“版本 ”与“0.1.0 rc2”位于同一非ignored paragraph。**AX树不代表实际读屏器语音实测**。

## 验收来源、方法与负责阶段

沿用已接受PRD AC-01～AC-06；本轮未删改标准。以下均由development执行并通过，独立QA负责重新复核产品最终放行。

| 条款 | 来源 | 本轮方法/证据 |
| --- | --- | --- |
| AC-01 | 用户明确版本值；页脚位置/只读/保留原文为已接受Agent推荐默认 | Node单节点/精确值/样式；产品feature、native可见性 |
| AC-02 | 已接受Agent推荐状态独立规则及项目既有书单约束 | feature 64动作：空/混合/三筛选/无结果/错误/刷新 |
| AC-03 | 已接受Agent推荐可读性；项目320px支持约束 | 原样native及四组layout几何/遮挡/与HEAD基线比较，无新增溢出 |
| AC-04 | 已接受Agent推荐普通可访问文本；既有键盘/触屏约束 | AX普通文本/无焦点断言、feature键盘、touch模拟；非语音实测 |
| AC-05 | 项目存储兼容及恢复约束；已接受Agent推荐精确原始值/零写 | fixture25动作、feature写入失败重试、layout原始值/零写 |
| AC-06 | 项目既有业务；已接受Agent推荐无新增网络依赖 | core16及feature改名删除撤销；app.js字节未改、资源引用未改、无新增JS/API请求路径 |

## 质量门禁与兼容声明

Runner共享fix成功（[日志](quality-fix-resumed.log)），未改变产品文件；本轮 `node --test tests/*.test.cjs` 16项通过（[日志](unit-tests-resumed.log)）。注册verify的[8项门禁](delivery-checks/checks.json)均exit_code=0：diff、Prettier、ESLint、JS语法、core浏览器、feature浏览器、Node16项、Python部署8项。文档和兼容声明更新后再次调用注册verify，实际返回Product checks passed；最终门禁记录位于该目录，不沿用design或前轮回执。

[审计记录](evidence-audit-resumed.json)核对计划与回执逐动作、原始version-layout.js、AX语义、fixture产品摘要、核心计划原样、业务JS与HEAD字节、资源引用、质量门禁和本任务文档相对链接；审计不替代真实浏览器。发布兼容声明 `deploy/release.json` 已在本轮验证后重新生成，data_change=none，兼容基线为实际核对仓库HEAD `4a54b10f8acad8f74a167693194c397b93db9adc`，不是未核验的线上部署基线；没有数据转换/删除，不把声明当部署授权。

## 公共工具正反例与证据导入恢复

旧公共零写断言TypeError已由上游修复，当前不再阻断。原样[零写正例development-1-23](browser/development-1-23/browser.json)5动作Passed、写0；原样[新增写负例development-1-24](browser/development-1-24/browser.json)实际Failed（1 !== 0）、写1、无TypeError，证明门禁能拒绝新增写，**不改其passed字段或计入产品通过数**。

首次touch导入曾因工作区超过60,000,000字节限制在浏览器动作前失败，无回执、不计通过。未修改公共Harness或限额；对本任务旧design及development-1-1～16重复PNG做可逆无损去重归档：[归档说明](browser-archive/README.md)、[原路径/摘要索引](browser-archive/manifest.json)、[全部116原图哈希核验](history-archive-validation.log)。63份唯一原始PNG字节在8个小于1.9MB的压缩包保留，旧browser.json不改；恢复单图并核对原始哈希的roundtrip已通过。当前development-1-17及以后截图仍展开。归档是证据存储优化，不是图像编辑、删除验收或改失败为通过。

## 历史、决策与剩余问题

[上一轮development报告完整历史](validation-before-development-resume.md)、[工具缺陷返工](tool-storage-defect.md)、[design恢复证据](design-rework.md)及真实失败回执保留，不沿用旧成功或Blocked结论。旧PNG链接需要按归档README恢复原图。

本轮完成跨文档/PRD/契约/产品自查，未发现BLOCKER或REQUIRED；无待用户回答问题。采用Runner自主推进授权完成普通可逆恢复、归档和最小布局修复，不伪造用户逐项批准。非阻断风险：页脚发现性、手工版本可能陈旧、单Chromium触屏模拟及AX非语音的覆盖边界、160 CSS px下旧整页布局仍宽320。独立QA需按全部AC复核，最终PR合并与高风险部署留人工授权；本阶段无Git写操作、GitHub直接调用、PR、合并或发布。
