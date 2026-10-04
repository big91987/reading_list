# Issue #100 设计验证（新一轮）

日期：2026-10-04。对象为任务prototype与架构机制；没有产品实现/上线/QA验收。旧G2失败保留为历史，本轮不沿用旧浏览器五动作能力通过。

## 真实来源与机制

- 上游34条目录及11份原HTTP响应gzip已解压核对原字节长度/SHA256；9项source-poc-test实际重跑通过，保留两次上游解析失败历史。
- 本轮[design-source-recheck.py](design-source-recheck.py)串行访问三个具体官方原页，均HTTP200，解析中国作家网30条+福建馆2条，两个独立组织、历史社科/现当代文学/科普三非空基本类型、原型对应题名/作者仍一致。[报告](design-source-recheck/report.json)有UTC时间、最终URL、Content-Type、编码、字节长度/hash及gzip快照引用。只重核选定具体原页，不称最新完整目录或生产采集器通过；permission_granted=false。
- [runtime-feasibility-test.py](runtime-feasibility-test.py)4项真实临时目录/标准库机制测试通过：[日志](runtime-feasibility.log)。验证文件锁争用/释放、staged写未发布时旧目录保留/替换后完整、绝对URL避开release base、plist字段序列化。没有安装launchd，也不是七天调度、生产HTTP路由或发布AC通过。

## 注册check最终证据

根目录均为`docs/04-implementation/tasks/100/prototype`。最终6份计划136动作全部passed，errors=[]；page_script包含细项断言，不把动作数冒充AC数量。

| 计划 / 原始结果 | 动作 | 实测范围 |
|---|---:|---|
| [main](browser-main.json) / [design-1-9](browser/design-1-9/browser.json) | 46 | 类型空/7目录状态、重复零写、加入刷新、信息保存/失败保草稿、0/1/N候选、人工保留/无空缺零写、改名待核对、Escape零写、删除撤销完整原值及恢复失败 |
| [touch](browser-touch.json) / [design-1-10](browser/design-1-10/browser.json) | 15 | 独立device hasTouch=true/isMobile=true、maxTouchPoints=1、真实tap、320px、长中文名/440字简介、编辑保存、AX |
| [keyboard](browser-keyboard.json) / [design-1-11](browser/design-1-11/browser.json) | 18 | Escape焦点返回、Enter重开/保存、Tab/Enter候选、关闭、原生200%桌面布局/AX |
| [security](browser-security.json) / [design-1-12](browser/design-1-12/browser.json) | 10 | 恶意HTML/JS链接只呈安全文本、无script/img执行DOM、链接拒绝；原产品键哨兵未改变，reload/查看snapshot后零setItem尝试 |
| [failures](browser-failures.json) / [design-1-7](browser/design-1-7/browser.json) | 34 | 加入失败无写、已读跨筛选重复无写、单候选采用失败/重试、推荐全失败仍手动新增、目录重试不写私人书单 |
| [layout](browser-layout.json) / [design-1-8](browser/design-1-8/browser.json) | 13 | 320px、非touch Chromium原生zoom actual=2→160 CSS px，查看/编辑无横向溢出、控件44px、AX、零存储写 |

截图：[推荐桌面](browser/design-1-8/screenshot.png)、[推荐320](browser/design-1-8/mobile.png)、[200%/160 CSS px](browser/design-1-8/zoom-4.png)、[书单桌面](browser/design-1-9/screenshot.png)、[长信息触屏](browser/design-1-10/mobile.png)。已实际查看推荐/书单桌面和触屏长信息、原生缩放截图，未发现新增关键操作遮挡。

注意：touch上下文zoom调用记录actual=2，但CSS宽和DPR仍320/1，不作为160 CSS px放大证据；真正非touch原生缩放证据在layout，实际width=160/DPR=2。AX是树，不冒充读屏器语音；触屏为Chromium模拟，不是物理手机/跨引擎认证。原型场景模拟不能证明后端故障、缓存网络或自动采集持续运行。

## 整改与剩余责任

本轮Python质量check初次发现4个新任务脚本的import/格式问题，已运行原有quality.py fix修复（仅4个新任务脚本），再check通过：[fix日志](design-quality-fix.log)、[check日志](design-quality-check.log)。源解析9项/机制4项及101历史别名hash重新通过，原型JS语法和git diff --check通过；没有改格式规则或共享质量脚本。

[失败/导入大小整改](evidence-archive.md)保留首轮定位错误及真实导入阻断；最终新证据通过。历史101个字节相同截图使用可恢复别名清单，unique PNG/hash及旧回执未改；没有删验收或改共享Harness。

生产采集器、原子目录/只读路由、tick/启停/恢复、摘要规则与请求安全、app实现/原存储兼容/跨标签冲突/既有质量门禁、发布声明为development必需检查，再由QA独立复验。设计仅已完成真实采集可行性、完整契约和交互原型验证；正式Owner安装/最终合并/高风险部署仍人工授权。
