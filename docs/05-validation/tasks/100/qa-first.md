# 书籍推荐、类型与简介：独立 QA 报告

日期：2026-10-04。任务：[Issue #100](https://github.com/big91987/reading_list/issues/100)。工作区任务分支：`codex/issue-100-platform`。

## 放行结论

**不放行，退回 development。** 独立执行共享质量门禁、37项Python、25项Node、10份真实浏览器计划208动作均通过；正式CLI两源真实采集32条成功。但额外任务级边界验证证明已接受的请求节流和整轮截止约束未得到完整执行，见QA-100-01、QA-100-02。共享门禁通过不能覆盖这两个失败，不交 report，不创建、发布或合并 PR。

责任为实现阶段：PRD R-02/R-11、[HLD第5节](../../../01-architecture/tasks/100/hld.md)、[C-04](../../../01-architecture/tasks/100/contracts.md)、[backend规范](../../../../.trellis/spec/backend/recommendations.md)已经承诺1秒最小请求间隔和5分钟整轮预算，不是本轮新增门槛或需求取舍。Runner授权自主推进且明确QA证实缺陷可直接返工；这不表示用户逐项审查批准，无需用户回答普通返工问题。

## 基线与独立性

- 读取PRD、HLD/契约、设计索引、实施计划/运行说明及Trellis前后端规范；项目未配置独立QA Skill，复用注册review的`trellis-check`方法，遵守本轮QA只写验证证据、不修改产品的职责。
- 七份回归计划复用上游可执行步骤，但**全部在本轮注册QA check中重新执行**；独立编写全量目录/分类/原页链接、手动新增/长旧书元信息、隐藏已读的大小写/空白去重与人工快照更新保护、运输层DNS/时钟边界验证，不沿用上游passed作为结论。
- 所有浏览器使用隔离测试origin和合成私人书单，不访问原生产origin的私人数据。两源采集使用临时`/private/tmp/reading-list-100-qa`；调度保持disabled，无服务安装、launchctl或生产部署。
- [本轮审计](qa-logs/audit.json)核对实际部署10c5e03的3份原文件与兼容快照字节/hash、release指纹与compatible_from、核心计划与HEAD原字节、保护目录零差异及各执行脚本原字节。其`audit_passed`只是证据一致性，不是`qa_release_passed`。

## 逐项验收

来源：U=用户明确要求，P=项目既有约束，A=Agent推荐默认；组合来源保持[PRD](../../../04-implementation/tasks/100/prd.md)原定义。设计负责交互与契约，开发负责实现与必需自测，QA负责以下独立复核；缺陷修复仍由开发承担。

| 条款 / 来源 | 本轮方法、结果与证据 | 结论 / 负责阶段 |
|---|---|---|
| AC-01 U+A | 正式init/run/validate成功；2026-10-04 09:33:20.813595Z开始，09:33:28.083112Z发布32条，30中国作家网+2福建馆，现当代文学/历史社科/科普三类型。所有发布项由正式schema校验；另重新请求每组织一具体页，核对屯堡/冉正万、梅西传/莱文斯基、机构与推荐措辞，保留原响应hash/压缩快照。[真实报告](qa-logs/real-run.json)、[QA目录](qa-logs/catalogue.json)、[出处抽查](qa-logs/source-audit.json) | 通过；设计/开发供基线，QA执行。HTTP200及robots404不等于内容许可 |
| AC-02 U+A | 正式入口run及disabled tick通过；37项Python独立重跑覆盖七天due、未到期零请求、停机恢复一次、启停/源退出/tombstone/uninstall隔离、小时重试和plist。**同一Transport边界出现0秒请求间隔与截止后GET**。[Python](qa-logs/python.log)、[失败边界](qa-logs/transport-boundaries.json) | **失败（已接受运行约束）**；development修复，不声称生产任务安装或等待七天实测 |
| AC-03 A | 单源timeout/解析失败、全源失败、首次无缓存、状态恢复/部分失败保旧、报告写失败不回滚、原子replace中断，Python重跑通过；真实浏览器空目录/过期+partial/无缓存失败/缓存失败及本地仍可添加。[Python](qa-logs/python.log)、[network](browser/qa-1-2/browser.json) | 本条通过；QA复核，故障注入不冒充真实源故障 |
| AC-04 U+A | 本轮32条目录在真实浏览器逐类型断言30/1/1、全部32、仙侠0与古典文学0分别诚实空态；所有卡片完整简介和具体HTTPS原页anchor/target/noopener核对，发布时间未知显示不编造。[分类结果](browser/qa-1-8/browser.json)、[出处抽查](qa-logs/source-audit.json) | 通过；QA执行，select通过DOM change断言，不声称原生菜单键盘选项实测 |
| AC-05 U+P+A | 推荐加入默认未读、失败零写和重试、刷新保留，已有已读梅西传去重零写；补充真实浏览器未读筛选隐藏已读`  mIxEd  `后再加入`MIXED`，完整存储快照不变。[main](browser/qa-1-1/browser.json)、[去重](browser/qa-1-10/browser.json) | 通过；QA执行 |
| AC-06 U+A | 编辑旧书、取消零写、保存失败保草稿再成功、刷新；新增手动古典文学+仙侠及简介，旧80字书名补600字简介，未知字段/read/位置保留。[main](browser/qa-1-1/browser.json)、[manual](browser/qa-1-9/browser.json) | 通过；QA执行 |
| AC-07 U+A | 0/1/N候选、拒绝零写、完整人工无空缺零写、多候选明确选第二版、失败保留候选重试、null命名空间拒绝。[main](browser/qa-1-1/browser.json)、[candidates](browser/qa-1-3/browser.json) | 通过；QA复核 |
| AC-08 P+A | 人工简介/类型不覆盖，补充真实浏览器注入合法更新目录后公共新简介确实显示、已有人工类型/简介/出处快照及私人原字节保持；改名待核对、原titleAtAdoption保留、旧版改名只读识别；查看建议零写。[Node](qa-logs/node.log)、[main](browser/qa-1-1/browser.json)、[更新保护](browser/qa-1-10/browser.json) | 本条通过；QA执行，合法更新为受控响应，不冒充实时端到端联网 |
| AC-09 P+A | 实际浏览器HTML文本不执行、危险协议/schema/超大目录不覆盖缓存、读取目录绝对同源且credentials omit/私人原值不变；Python重跑DNS私网/外部redirect/403/429/限长/重试和公开GET无私人字段，HTTP真实GET/HEAD/503/404/405测试通过。**采集请求预算边界仍失败，见QA-100-01/02**。[network](browser/qa-1-2/browser.json)、[Python](qa-logs/python.log)、[边界](qa-logs/transport-boundaries.json) | 隐私与渲染子项通过；**采集安全预算不放行**，development修复 |
| AC-10 P+U+A | 旧raw/异常条目保护/备份恢复/外部写冲突拒绝，元信息完整撤销及失败保机会；固定16动作核心含新增/read/筛选/刷新/删除，另改名/撤销专项和未知属性Node断言。[storage](browser/qa-1-6/browser.json)、[core](browser/qa-1-7/browser.json)、[main](browser/qa-1-1/browser.json) | 通过；QA独立执行，外部写注入不是物理多标签认证 |
| AC-11 P+A | 1440桌面、320触屏、80字书名/600字简介完整显示；真实Tab/Enter浏览/加入/打开编辑与Escape取消焦点恢复；touch context hasTouch/isMobile/maxTouchPoints1，实际tap保存/加入；AX名称/原生200% zoom及DOM无横溢。[keyboard](browser/qa-1-5/browser.json)、[touch](browser/qa-1-4/browser.json)、[manual](browser/qa-1-9/browser.json)、[catalogue](browser/qa-1-8/browser.json) | 通过限定范围；自动AX非朗读、touch非物理手机；zoom截图裁切不能作为完整可读截图 |
| AC-12 P | 实际deployed.json及immutable release只读核对10c5e03；Node真正执行该旧源码与新版往返/read/rename/delete/undo；none指纹与已测试SHA匹配；开发必需共享8项、Python37/Node25/质量检查本轮均通过。[审计](qa-logs/audit.json)、[共享checks](delivery-checks/checks.json)、[质量日志](qa-logs/quality.log) | 部署兼容/声明及原门禁子项通过；**最终QA失败，不能据此放行发布** |

## 证实缺陷与复现

复现命令：`python3 docs/05-validation/tasks/100/qa-transport-boundaries.py`。本轮退出码**1**，两项`passed=false`，见[完整JSON](qa-logs/transport-boundaries.json)。脚本导入未经修改的`scripts/recommendations.py`，只在DNS/clock/socket/TLS/HTTP边界控制时间，记录真正`HTTPSConnection.request()`的发送起点；不访问外部网络，不改既有测试。此证据与真实联网正常采集分开。

### QA-100-01：DNS耗时后两个实际GET可无间隔（P2，阻断）

1. 初始monotonic=100，首次DNS耗时2秒，随后TLS/响应无额外耗时，连续调用同源两个合法fetch。
2. 预期：两次真正HTTP发送至少相隔1秒。
3. 实际：两次request都在102秒，gap=0；两次sleep均0、没有错误。
4. 根因位置：`scripts/recommendations.py:226`在DNS/TLS前更新`previous`，后续请求按旧的准备起点计算间隔，而非实际发送起点。
5. 影响：慢DNS/握手后的快速连续页面、重试或重定向可突破对官方来源的负载节流。既有测试mock sleep但未断言实际发送时刻，不能用其通过否定本缺陷。

要求：在实际HTTP发送边界落实最小间隔，DNS/连接准备的耗时不得抵消前一次发送后的节流；覆盖慢DNS/握手、普通连续请求、重试、重定向，不绕过目标/IP/TLS校验。保持既有1秒承诺，不临时扩大或缩小需求。

### QA-100-02：DNS跨过轮次截止后仍发送GET（P2，阻断）

1. 初始monotonic=100，Transport截止400；DNS受控耗时301秒，随后返回合法公网IP。
2. 预期：截止已过，不再打开/发送外部请求，整轮超限失败；阻塞DNS也应属于已承诺的整轮预算。
3. 实际：401秒仍调用HTTP request，读完后才抛`size_limit`。脚本记录deadline=400、http_request_starts[0].time=401。
4. 根因位置：`scripts/recommendations.py:220`只在fetch入口检查截止；`getaddrinfo`无deadline约束，后面timeout用`max(1, remaining)`使超期也得到至少1秒网络机会。
5. 影响：实际采集可超过已接受五分钟预算，延长持锁时间，并在预算结束后继续访问官方源。未以真实生产超时事故证明，但确定性执行已证明控制流违反契约。

要求：覆盖DNS解析及TLS/连接/读取的剩余预算，等待和准备后、每次外部I/O/实际发送前重新检查截止；remaining≤0时不授予额外网络时间。恢复`size_limit`失败路径的保旧、锁释放、重试due和报告一致性。不能仅在响应结束时报错，也不能降低HLD预算承诺。若修复需要设计取舍，开发按既有阶段策略记录并回相应责任阶段。

附带诊断注意：当前`requestedAt`在响应读取后取时间，所以真实日志相邻timestamp不是请求起点差值。本报告不把真实报告中的时间差当节流缺陷证据；以上失败使用真实request调用时刻断言。建议同时令运行报告准确区分发送起点/响应完成，便于运营核查。

## 浏览器执行与截图

10份独立QA计划：main48、network14、candidates39、touch13、keyboard20、storage23、core16、catalogue8、manual16、dedup11，合计208动作，全部`passed=true/errors=[]`，执行步骤与page_script文件原字节已审计。plans为`qa-*-plan.json`；对应回执为`browser/qa-1-1`至`qa-1-10`。共享verify还独立重跑固定核心及开发48动作门禁，不与208重复计数。

- [桌面32条推荐截图](browser/qa-1-8/screenshot.png)、[同轮窄屏推荐截图](browser/qa-1-8/mobile.png)：已查看，原页信息/操作完整；大图为长页面，不单靠缩略图判文字可读性，辅以全量DOM/AX及布局断言。
- [320触屏80字书名/600字简介及手动分类](browser/qa-1-9/mobile.png)：已查看，长内容完整、操作未被遮挡；[对应日志](browser/qa-1-9/browser.json)含完整对象/长度与触屏证据。
- [触屏加入/编辑截图原字节canonical](browser/development-1-16/mobile.png)：本轮QA-1-4实际生成，与该文件逐字节相同后归档；先查看QA原图再归档，不沿用旧浏览器结论。
- [原生200%日志](browser/qa-1-1/browser.json)actual2/160CSSpx/DPR2、DOM scrollWidth160。该zoom截图存在工具裁切，只计原生缩放/DOM证据，不声称截图全页可读性认证。
- [推荐AX原始树无损gzip](browser/qa-1-8/accessibility-8.json.gz)、[手动/长信息AX无损gzip](browser/qa-1-9/accessibility-16.json.gz)、[触屏AX无损gzip](browser/qa-1-4/accessibility-13.json.gz)：树快照不是屏幕阅读器语音实测。

## 环境故障与恢复（非产品缺陷）

首次main计划携带上游source字段时注册check返回`inline source is not accepted`，没有执行浏览器；移除内联source，保留任务级script路径后check自动装载，成功执行。未修改共享工具或门禁。

manual补充两次、dedup补充一次返回`Workspace exceeds import limit`，未启动浏览器，不计失败产品用例。无损归档本轮QA生成的15张重复PNG及verify生成5张重复PNG（累计3,450,009字节）；所有独有图像/原回执保持，canonical长度/hash/原字节验证，见[QA别名清单](qa-evidence-aliases.json)、[日志](qa-logs/evidence-archive.log)。4份AX树gzip均保留原字节/hash，可精确还原，共节省1,098,743字节，见[压缩清单](qa-packaged-evidence.json)。随后manual在qa-1-9、dedup在qa-1-10真实通过，环境阻塞已恢复。[工具尝试记录](qa-logs/browser-tool-attempts.md)区分未执行与通过。

恢复PNG：`node docs/05-validation/tasks/100/qa-evidence.cjs restore`；校验：同命令`verify`。AX恢复：将清单4份`.json.gz`无损解压为同名`.json`后核对清单SHA256；恢复会重新增加导入大小，不在下一轮check之前恢复全量。历史上游201项别名也独立核对通过。旧失败日志未删除或改成通过。

## 适用性、未测与后续

- 登录/错误凭据/退出/未登录访问：**不适用**。PRD/HLD与实际静态app无账号/认证体系，书单仅本地存储；不虚构账号或权限通过。公共目录真实HTTP只读路径验证不等于认证功能。
- 未测：物理手机、跨浏览器引擎、实际屏幕阅读器朗读、系统IME、生产多标签操作、真实私人书单、生产launchd安装/连续七天无人值守、真实源禁止/超时事故和长期页面变更。上述专项不是承诺必需门槛，明确记录，不新增阻塞；已接受的collector预算失败不能降为未测。
- 本轮不改产品、既有测试、PRD/设计、受保护配置，不操作Git分支/提交/推送或直接GitHub，不使用生产登录凭据。新建/更新仅任务验证计划、脚本、报告及可恢复证据包。
- 不编写待创建PR的`pull-request.md`：本轮QA拒绝放行并直接返工，不创建新PR；通过下一轮完整QA时再按Runner要求生成准确PR文案和证据链接。
- development修复两项缺陷、补回归测试、重跑原37/25测试及必需质量/真实采集，交回QA后需**重新验证受影响运行约束、缓存/故障、核心及浏览器回归**；本轮通过仅保存为证据，不沿用为返工后自动放行。
- 最终合并、Owner正式controller/采集器接入及高风险部署仍人工授权。此次返工授权为Runner自主策略+QA实际失败证据，不写作用户具体批准。
