# Issue #97 设计验证证据

历史截图存储说明：本报告旧PNG已按原字节SHA256[无损归档](browser-archive/README.md)，browser.json原样保留；旧图片链接使用归档脚本按需恢复。当前development复验结论见[产品验证](validation.md)，本设计报告不替代研发或QA放行。

当前恢复核验见 [design-rework.md](design-rework.md)：原型7计划已用修复后的runtime重新通过，原生能力/四组矩阵/零写正反例及完整verify闭环，G2重新Ready。下文初次历史证据仍保留，不以旧成功替代本轮复验；CSS模拟仍不能代替原生缩放，树快照不代表语音。

2026-10-03；仅设计原型，不是产品完成或部署证据。真实工具为注册 `mcp__registered_browser_design.check`，root为 `docs/04-implementation/tasks/97/prototype`。每次独立浏览器上下文，无shell浏览器或伪造截图。

## 注册检查实际结果

| 计划 | 实际结果目录 | 结论及范围 |
|---|---|---|
| check-states.json首次 | [design-1-1](browser/design-1-1/browser.json) | Failed：断言写成“未能保存”，实际添加错误文案为“未能添加”。修正测试而非产品；原始失败保留 |
| check-states.json重跑 | [design-1-2](browser/design-1-2/browser.json) | Passed，35动作：空态、混合、三筛选、刷新、无结果、添加存储错误，版本始终可见，原始值不变及查看/筛选/刷新零写观察 |
| check-layout.json首次 | [design-1-3](browser/design-1-3/browser.json) | Failed：320px + CSS2倍后点击已读导致横向溢出诊断；截图有继承的tooltip越界。版本本身完整，无遮挡。未称该组合通过 |
| check-core.json | [design-1-4](browser/design-1-4/browser.json) | Passed，24动作：Owner核心计划原样加改名、删除、撤销和版本检查 |
| check-touch.json | [design-1-5](browser/design-1-5/browser.json) | Passed，12动作：device touch=true、isMobile=true、320px，Tab/Enter添加、真实tap筛选及版本可见；非物理手机 |
| check-layout.json调整验证条件后 | [design-1-6](browser/design-1-6/browser.json) | Passed，22动作：桌面1440/窄屏320在100%、桌面1440在CSS2倍；唯一、完整、不遮挡、无焦点、无横向溢出诊断。没有修复或重新放行首次失败组合 |
| check-error.json | [design-1-7](browser/design-1-7/browser.json) | Passed，9动作：注入存储写入失败，原始数据未变、原错误提示/版本可见，保存错误状态截图 |
| check-zoom.json | [design-1-8](browser/design-1-8/browser.json) | Passed，4动作：1440px CSS2倍布局模拟及截图；不是原生浏览器200% |
| check-empty.json | [design-1-9](browser/design-1-9/browser.json) | Passed，8动作：空态及刷新可见，存储未变且观察0写 |

最终7份计划通过，共114个动作；2次初始失败保留，不能从总通过数推断产品AC已全部通过。states的storageWrites=3为显式fixture两次和新增一本的业务写；core=7、touch=1为原业务操作；error=1为fixture写。无写断言针对snapshot之后的查看/筛选/刷新区间，不冒称整份含演示预置的计划零写。

## 截图与实际观察

- [桌面筛选无结果](browser/design-1-2/screenshot.png)：完整版本在页脚，原页脚文案保留。
- [320px布局](browser/design-1-6/screenshot.png)：该计划最后视口实际为320px；文件名screenshot不代表桌面，已打开检查无截断。
- [触屏上下文截图](browser/design-1-5/mobile.png)：已打开检查；工具拍mobile时自动调整尺寸，触屏证明来自browser.json中device动作/320px及tap，不由截图尺寸推断。
- [错误提示与版本](browser/design-1-7/screenshot.png)：已打开检查，未能添加提示与完整版本同时存在。
- [桌面CSS2倍](browser/design-1-8/screenshot.png)：已打开检查，完整版本，正文与页脚不叠加。
- [空清单移动截图](browser/design-1-9/mobile.png)：已打开检查，原文及版本完整。
- [首次缩放组合失败截图](browser/design-1-3/mobile.png)：已打开检查，横向溢出诊断为是；作为限制证据，不计通过。

每个目录都保留原始browser.json、screenshot.png、mobile.png；自动移动截图只证明拍摄后的状态，不替代动作时每个视口的断言。

## 静态及文档核验

原型app.js与本轮产品app.js字节一致；HTML仅增加版本节点/演示工具，CSS新增版本/演示样式。版本单一普通文本无tabindex/aria-live；业务脚本不消费版本。版本前景#716b62与平坦纸色#f4efe6采用相对亮度计算，结果约4.61:1，只是色值计算非真实屏幕或朗读认证。

实际本地检查通过43个相对链接、7份JSON计划与真实结果逐动作相同、精确版本节点及5条需求/6条AC完整ID覆盖；`node --check`验证两个原型脚本语法及 `git diff --check` 均退出0。第一次AC ID检查因追溯表使用简写而失败，已改成完整引用并重跑通过，不变更范围。实际命令结果记录于G2自查；产品Python未修改，不触发Python质量工具要求。

## AC与证据边界

| AC | 当前设计证据 | 研发/QA必须补充 |
|---|---|---|
| AC-01 | 唯一版本、原文可见，真实截图 | 正式产品同样可见，不是原型替代 |
| AC-02 | 空态、混合、筛选、刷新、无结果与添加写入错误通过 | 产品及其他现有错误恢复路径 |
| AC-03 | 320px与桌面100%、桌面CSS2倍布局通过 | 原生浏览器200%实际检查；按支持视口核对与未改基线的差异，不宣称320px叠加CSS2倍通过 |
| AC-04 | 普通HTML文本/无焦点诊断及Tab/Enter、touch模拟 | 产品可访问树或真实朗读；完整键盘检查，不用模拟截图证明物理设备 |
| AC-05 | 原始值比较及无写观察、添加存储错误 | 产品打开/查看/刷新0新写，加载异常/完整恢复；已有中文数据 |
| AC-06 | 原型主线加改名/删除/撤销通过，业务JS原样 | 产品完整回归、0新增网络依赖/请求证据 |

后续项属于产品实现验收，不改变本次静态版本架构。没有用户待回答项。无需为原生缩放缺少当前证据追加形式审批；不能将其标为Passed。
