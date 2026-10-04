# Issue #100：QA-100-01/02 开发返工验证

2026-10-04，development；Runner自主推进授权与[QA失败报告](../qa.md)为返工依据，非用户逐项批准。结论：修复后重新达到研发就绪，待新一轮独立QA；不沿用首次研发或QA的通过子项作为本轮放行。无需要用户回答的问题，未安装正式服务、改生产controller、发布、Git写操作或合并。

## 缺陷、根因与修复范围

1. **QA-100-01（P2）**：首次DNS耗时2秒后，两次实际request都在monotonic102，gap0。旧previous在DNS前更新，测到的是准备起点而不是发送起点。
2. **QA-100-02（P2）**：deadline400、DNS返回401后仍发GET，读完才size_limit；阻塞DNS不受等待预算限制，timeout又强制至少1秒。

原QA复现脚本先运行退出1，两项false，原始结果保留[qa-before](qa-before.json)。新增8项Transport测试先红，含14个失败子项，[red-tests](red-tests.log)；再修复并追加预算失败保旧/锁/due及socket中断测试，共新增10项，旧37项不删，现Python47。

修改产品只限`scripts/recommendations.py`的Transport；`app/`、controller/安装器、release声明、私人schema与来源规则在本轮未变。实际发送前（DNS/连接/TLS准备后）计算1秒间隔，重试/redirect都复用，request调用才写previous。等待只使用剩余预算，剩余≤0即拒绝，不授予一秒机会。

DNS/连接/TLS/发送/响应头/读取每阶段在daemon worker中运行，等待≤min(20秒,轮次剩余预算)，进入及结束复查截止，超时结果不进入后续I/O。晚到socket关闭；复制底层socket句柄，在截止/超时shutdown共享连接，TLS转移fd所有权/response缓冲仍可中断，finally关闭复制句柄。OS解析不能强制取消，DNS超时只是停止等待并丢弃晚到结果，**不宣称取消了OS DNS**，不再由该结果发HTTP；不等待后台解析退出才释放业务锁。白名单、公网固定IP连接、hostname TLS验证、原子发布和失败保旧规则保留。

报告requestedAt现在在实际发送前取时；新增completedAt、startedMonotonic、durationSeconds，不再把响应完成时间差当节流证据。上游HLD的1秒/300秒约束未降低；20秒来自原网络timeout，daemon预算/句柄实现为可逆工程选择，非新产品要求。

## 失败→通过及实际采集

修复后的同一[QA复现](../qa-transport-boundaries.py)退出0，两项true，见[qa-after](qa-after.json)：连续发送102/103，gap1秒；DNS超过deadline后HTTP起点数组为空，size_limit。

`python3 -m unittest discover -s tests -p '*_test.py'`：47项通过；`node --test tests/*.test.cjs`：25项通过，见[Python](python.log)、[Node](node.log)。覆盖慢DNS/TLS连续发送、retry/redirect、DNS/connect/TLS/request/headers/read/wait跨截止、subsecond remaining、真实墙钟阻塞DNS/TLS/read及底层socketpair中断、报告时刻分离、size_limit保源快照/32条/一小时due/报告/释放锁。墙钟专项使用50ms受控deadline，不冒充真实源事故或生产300秒观测。

新临时root`/private/tmp/reading-list-100-rework`正式CLI init/run/validate实际执行，调度disabled；[real-run](real-run.json)退出0，2026-10-04T10:47:32.059603Z开始，耗时4.378623秒，32条/两官方组织/三类型（现当代文学30、历史社科1、科普1），[catalogue](catalogue.json)revision=`d5f36cfc04d3d99f4845f1d8094b540b886d0469df7ca16969b9fd197e21ade1`。
五次真实请求实际单调发送间隔为1.005649、1.002656、1.005617、1.005587秒；保留发送/完成、HTTP、长度/hash及摘要证据，[audit](audit.json)核对gap≥1。[validate](validate.json) ready=true。`permissionGranted=false`；HTTP200/robots404不是许可，不改变固定页集/原创短简介/不复制长评封面的边界。

本机可运行预览：`http://127.0.0.1:5535`，实际同源目录HTTP200/32条已核实；使用上述临时公共目录，不含原5533私人书单，原正式服务未改。复现入口和安装责任见[operations](../../../../04-implementation/tasks/100/operations.md)。

## 本轮逐AC重新验证

来源U=用户要求、P=项目约束、A=推荐默认，沿用[PRD](../../../../04-implementation/tasks/100/prd.md)，不新增或裁剪AC。以下均为development重新执行的方法；全部12AC须独立QA复验，研发通过不是最终QA放行。

| AC / 来源 | 本轮方法与研发结果 | 负责阶段 |
|---|---|---|
| AC-01 U+A | 新root真实正式32条、两机构/三类型、摘要证据/响应hash齐备；旧来源解析用例重跑通过 | 开发已测；QA独立抽查 |
| AC-02 U+A | 受控due/恢复/CLI启停/plist旧用例重跑；新增实际发送限流、完整剩余预算与真实run通过 | 开发修复；QA重点复验QA-100-01/02 |
| AC-03 A | partial/首次全败/保旧/报告/原子旧用例，新增size_limit锁/due/快照；浏览器故障状态重跑通过 | 开发已测；QA复验 |
| AC-04 U+A | 全量目录分类30/1/1、古典0仙侠0、完整摘要/原页锚点及长信息重跑通过 | 开发已测；QA复验 |
| AC-05 U+P+A | 加入/重复/失败、隐藏已读首尾空白及大小写去重/零写重跑通过 | 开发已测；QA复验 |
| AC-06 U+A | 手动古典+仙侠、旧80字书名/600字简介、取消/失败重试/刷新重跑通过 | 开发已测；QA复验 |
| AC-07 U+A | 0/1/N候选、明确第二版、拒绝/人工保留/null命名空间重跑通过 | 开发已测；QA复验 |
| AC-08 P+A | 合法公共更新保人工快照/原字节、改名待核对、实际旧新版执行往返重跑通过 | 开发已测；QA复验 |
| AC-09 P+A | 新预算/限流/中断回归、DNS/重定向/TLS边界/公开GET旧例；浏览器恶意文本/缓存/故障重跑通过 | 开发修复；QA重点安全复验 |
| AC-10 P+U+A | 固定核心16动作、raw零写/异常保护/备份恢复/外部冲突、完整撤销重跑通过 | 开发已测；QA复验 |
| AC-11 P+A | 真实桌面/320/hasTouch/tap/Tab Enter Escape/AX/原生200%指标重跑通过 | 开发已测限定范围；QA复验 |
| AC-12 P | 实际部署10c5e03三文件hash、旧源码往返、现release指纹/compatible_from重核；新47/25/质量及宿主完整8项通过 | 开发重新就绪；最终QA仍未放行 |

## 真实浏览器与共享门禁

注册check root=`app`，复用原QA完整10份计划（核心直接使用`tests/browser/core.json`），未改变动作/断言。development-1-21..30全部passed/errors=[]，合计208动作，计划与page_script源字节审计见[browser-audit](browser-audit.json)：

| 计划 | 本轮回执 | 动作 |
|---|---|---|
| qa-main | [1-21](../browser/development-1-21/browser.json) | 48 |
| qa-network | [1-22](../browser/development-1-22/browser.json) | 14 |
| qa-candidates | [1-23](../browser/development-1-23/browser.json) | 39 |
| qa-touch | [1-24](../browser/development-1-24/browser.json) | 13 |
| qa-keyboard | [1-25](../browser/development-1-25/browser.json) | 20 |
| core | [1-27](../browser/development-1-27/browser.json) | 16 |
| qa-storage | [1-26](../browser/development-1-26/browser.json) | 23 |
| qa-catalogue | [1-28](../browser/development-1-28/browser.json) | 8 |
| qa-manual | [1-29](../browser/development-1-29/browser.json) | 16 |
| qa-dedup | [1-30](../browser/development-1-30/browser.json) | 11 |

触屏为独立hasTouch/isMobile、maxTouchPoints1/tap；AX非读屏音频；原生zoom actual2/160CSSpx/DPR2的DOM无横溢，截图仍可能裁切，不当完整可读性认证。当前320长信息截图实际查看；PNG可能为同字节canonical别名，按下述清单读回。响应注入不是实时端到端外站；外部存储注入非生产物理多标签；既有IME/朗读/物理设备/跨引擎/真实七天未测专项不冒称通过。

注册宿主verify完整8项exit0，见[checks](../delivery-checks/checks.json)，实际固定core16/feature48、Node25/既有部署8重跑通过；新增Python47另跑，不用共享8项替代。`quality fix`实际自动修复3项、格式化5个Python文件（含QA新增辅助脚本的机械整理），未改其复现断言/验收动作；16文件`quality check`通过，见[fix](quality-fix.log)/[最终check](quality-final.log)。app/release未变，none指纹仍匹配实际已测试部署SHA，不重新声明未经测试的基线。

## 证据归档与环境失败

首轮quality fix/check因工作区60,100,511字节超过60MB导入上限而未执行，不称通过；首轮日志路径被后续重跑覆盖，原失败工具回执和本段明确保留失败事实。完整verify再次生成截图后，quality再遇同一大小限制，真实失败日志[quality.log](quality.log)保留；归档门禁5张相同PNG后最终quality-final通过。任务级[rework-evidence.cjs](../rework-evidence.cjs)将9份开发AX原JSON无损gzip（解压byte/hash/长度核验），并只把本轮development-1-21及后续21个逐字节相同PNG作可恢复别名；独有图片和所有browser/失败结果JSON不改。见[清单](ax-archives.json)、[归档日志](archive.log)。
`node docs/05-validation/tasks/100/rework-evidence.cjs verify`验证AX与PNG；`restore`精确恢复原路径，冲突拒绝，恢复会再次增加工作区大小，check前不要全量restore。历史201项、QA原20项加本轮门禁5项PNG别名独立校验通过。AX原路径缺失时从清单archive解压，PNG从canonical读取；不是删掉失败证据制造通过。

## 待独立QA

两P2实现缺陷已修复并重新验证，不需上游产品取舍；无研发阻断。QA应独立重跑原边界复现、新增网络/预算/失败保旧和全部12AC，不沿用旧qa.md通过子项或本报告作为最终放行。Owner正式安装/源治理、最终PR合并与高风险部署仍人工授权；本轮只交QA，不创建PR。
