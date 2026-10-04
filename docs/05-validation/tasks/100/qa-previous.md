# 书籍推荐、类型与简介：独立 QA 复验报告

日期：2026-10-04。任务：[Issue #100](https://github.com/big91987/reading_list/issues/100)。任务分支：`codex/issue-100-platform`。

## 本轮结论

**返工后的本轮独立 QA 通过，可交 report。** 两项原阻断缺陷均用原 QA 方法重新复现并通过；全部12项验收、47项Python、25项Node、10份真实浏览器计划209动作及注册宿主8项门禁通过。没有沿用开发自测或旧 QA 的放行结论，没有部署、安装生产调度、创建或合并PR。

上一轮真实失败完整保留在[首轮报告](qa-first.md)及[首轮边界结果](qa-logs/transport-boundaries.json)；旧记录不是本轮结果。独立新证据集中于 `qa-recheck/` 和 `browser/qa-1-11` 至 `qa-1-20`。依据Runner自主推进策略完成后交接，不表示用户逐项审查批准。

## 基线、方法与责任

- 沿用未变更的[PRD](../../../04-implementation/tasks/100/prd.md)、[HLD](../../../01-architecture/tasks/100/hld.md)、[契约](../../../01-architecture/tasks/100/contracts.md)；读取最新返工交付、后端规范与运行说明。项目未配置独立QA Skill，采用已读的调试/验证方法与Trellis检查要求，不自创验收门槛。
- 来源U=用户明确要求，P=项目既有约束，A=Agent推荐默认，保持PRD原定义。设计提供交互与契约；开发负责实现和必需自测；QA负责以下独立验证，不修改产品或既有测试来使其通过。
- 所有浏览器使用隔离origin和合成私人数据。真实采集使用隔离临时根 `/private/tmp/reading-list-100-qa-recheck`，调度disabled。未读取真实私人书单，不操作原生产服务。
- 新计划复用已接受步骤并在注册check重跑，附加独立目录、长文本、去重与人工信息保护断言。固定核心原文件与HEAD字节相同；QA复制计划仅JSON排版不同，解析后的16个动作完全一致；注册verify也直接执行原核心计划。

## 逐项验收

| 条款 / 来源 | 本轮独立方法与证据 | 结果 / 责任 |
|---|---|---|
| AC-01 U+A | 正式CLI init/run/validate成功；2026-10-04 11:09:22.362246Z开始，11:09:27.272975Z生成32条，两个官方组织、三类型。另重新请求每组织一具体页核对书名、作者、机构与推荐措辞，并保存响应hash及原页压缩快照。[采集](qa-recheck/real-run.json)、[目录](qa-recheck/catalogue.json)、[出处抽查](qa-recheck/source-audit.json) | 通过；QA执行，开发提供采集器。200/robots404不等于许可 |
| AC-02 U+A | 原两个失败边界独立重跑通过；47项Python覆盖七天due、未到期零请求、停机恢复、源退出/tombstone、小时重试、锁和plist。正式disabled tick成功。[边界](qa-recheck/transport-boundaries.json)、[Python](qa-recheck/python.log)、[tick](qa-recheck/disabled-tick.json) | 通过；开发修复，QA复核，不声称生产安装或等待七天 |
| AC-03 A | Python覆盖部分/全源失败保旧、首次无缓存、原子发布和报告写失败；真实浏览器覆盖空目录、partial+stale、无缓存、缓存写失败、本地仍能添加。[Python](qa-recheck/python.log)、[network](browser/qa-1-12/browser.json) | 通过；QA执行，受控故障不是生产源事故 |
| AC-04 U+A | 本轮采集目录在浏览器断言全部32、三类型30/1/1、古典与仙侠各0且显示空态；完整简介、具体HTTPS出处链接、未知时间诚实展示。[catalogue](browser/qa-1-18/browser.json)、[原页核对](qa-recheck/source-audit.json) | 通过；QA执行，类型选择用DOM change验证，不冒称原生菜单键盘选项实测 |
| AC-05 U+P+A | 推荐加入默认未读、写失败零写/重试/刷新保留；隐藏已读后，空白与大小写不同的同名书仍全范围去重、存储不变。[main](browser/qa-1-11/browser.json)、[dedup](browser/qa-1-20/browser.json) | 通过；QA执行 |
| AC-06 U+A | 旧书人工编辑、取消零写、失败保草稿再保存；手动新增古典与仙侠及简介；80字书名/600字简介保留未知字段、read和位置。[main](browser/qa-1-11/browser.json)、[manual](browser/qa-1-19/browser.json) | 通过；QA执行 |
| AC-07 U+A | 0/1/N明确候选、拒绝零写、多候选选第二版、只补空缺、失败保候选、null命名空间拒绝覆写。[candidates](browser/qa-1-13/browser.json) | 通过；QA执行 |
| AC-08 P+A | 更新公共目录后公共新简介显示，人工类型/简介/出处及私人原字节不变；改名待核对和旧版改名只读识别，查看建议零写。[dedup](browser/qa-1-20/browser.json)、[main](browser/qa-1-11/browser.json)、[Node](qa-recheck/node.log) | 通过；QA执行，公共更新为受控响应 |
| AC-09 P+A | 浏览器危险协议/非法版本/超长目录拒绝、不执行HTML；绝对同源、credentials omit、私人原值不变；Python覆盖公网IP固定、TLS/redirect/限长/超时/节流、HTTP GET/HEAD/503/404/405。独立真实墙钟阻塞探针通过。[network](browser/qa-1-12/browser.json)、[Python](qa-recheck/python.log)、[墙钟](qa-recheck/wall-budget.json) | 通过；QA复核，不把OS解析停止等待称为取消OS解析 |
| AC-10 P+U+A | raw加载零写、异常原值保护、备份恢复、外部冲突拒绝；完整对象删除撤销及失败保机会；固定核心16动作与旧源码往返测试。[storage](browser/qa-1-16/browser.json)、[core](browser/qa-1-17/browser.json)、[Node](qa-recheck/node.log) | 通过；QA执行，外部写注入不是物理多标签认证 |
| AC-11 P+A | 1440桌面、320真实独立触屏context与tap、长书名/简介；真实Tab/Enter/Escape、焦点恢复；AX树及原生200% zoom、DOM无横溢。[touch](browser/qa-1-14/browser.json)、[keyboard](browser/qa-1-15/browser.json)、[manual](browser/qa-1-19/browser.json)、[catalogue](browser/qa-1-18/browser.json) | 通过限定范围；QA执行，AX不是朗读、触屏不是物理手机 |
| AC-12 P | 实际deployed.json与immutable release三文件逐字节/hash核对10c5e03基线；本轮Node执行旧/新源码往返；release none指纹及compatible_from匹配；注册8门禁、47/25及质量检查通过。[审计](qa-recheck/audit.json)、[门禁](delivery-checks/checks.json)、[质量](qa-recheck/quality-final.log) | 通过；QA核对，不等于已发布或授权升级controller |

## 两项旧失败：具体场景与关闭证据

### QA-100-01：慢DNS后两次实际请求挤在一起（原P2，已关闭）

场景：采集器连续获取两个官方页面，第一次域名解析耗时2秒，后续连接和响应很快。约束要求实际HTTP发送至少隔1秒。旧实现把“开始准备请求”当作节流起点，解析耗时把等待时间抵掉，所以两次GET都在模拟时刻102发送，间隔0秒。这会在慢解析后的快速连续采集、重试或重定向时对来源网站形成突发请求；不是界面按钮失效或私人书单丢失。

开发将节流放到DNS/连接/TLS准备完成后的真正发送边界。本轮原命令 `python3 docs/05-validation/tasks/100/qa-transport-boundaries.py` exit0，两次发送为102和103，实际间隔1秒。正式联网五次请求的四个发送间隔为 **1.0105925 / 1.0034343 / 1.0104126 / 1.0066047秒**；重试/重定向回归也在47项测试中重跑。见[原方法新结果](qa-recheck/transport-boundaries.json)、[新审计](qa-recheck/audit.json)。

### QA-100-02：整轮已超时却继续发送GET（原P2，已关闭）

场景：整轮限5分钟；模拟时刻100开始，截止400，DNS阻塞301秒直到401才返回。旧实现未在解析后重新检查截止，还至少给请求1秒，因而超预算后仍发送GET、读完才报size_limit。影响是异常网络下任务不能按约定及时结束，可能占锁更久或产生本应停止的网络活动；不代表正常采集必定失败。

开发新增各阶段剩余预算等待、截止复查和晚到socket清理。本轮同方法在DNS返回401时 **HTTP发送列表为空**，立即size_limit，断言通过。QA另外用真实墙钟80ms受控预算阻塞DNS与connect：约80.65ms/90.14ms返回；释放晚到结果后DNS无后续连接，晚到connect socket关闭。见[边界](qa-recheck/transport-boundaries.json)、[墙钟](qa-recheck/wall-budget.json)。这是缩短预算的真实等待探针，不是观察生产300秒事故；OS DNS本身不可强制取消，只是不等待其结束且丢弃晚到结果，不据此发HTTP。

## 回执、截图与可恢复证据

- 新10份check全部passed、errors=[]，总209动作；注册verify独立8项exit0，并另执行固定核心16和功能48动作。47/25测试及正式采集均是本轮执行，不引用研发passed代替结果。
- [桌面推荐截图](browser/qa-1-18/screenshot.png)、[移动推荐截图](browser/qa-1-18/mobile.png)已实际查看。展示历史社科中的梅西传，其余32条和全分类在展示前完整断言；页面“更新失败，显示上次缓存”是隔离浏览器中真实新目录缓存加受控网络失败的展示状态，不是正式采集失败。
- 独有截图保留原PNG；重复截图只在字节完全相同时记录canonical别名，AX/执行计划原JSON无损gzip，原browser.json未改。[本轮清单](qa-recheck/evidence.json)、[归档日志](qa-recheck/archive.log)。运行 `node docs/05-validation/tasks/100/qa-recheck/evidence.cjs restore` 可精确恢复，冲突拒绝覆写；verify及审计验证长度/hash/解压原字节。历史失败及独有证据未删除。
- [审计脚本](qa-recheck/audit.py)核对新计划/实际嵌入脚本字节、历史/新证据hash、基线与声明、核心和保护路径零diff。首次辅助审计将QA复制计划排版误当字节相同而失败，[原日志](qa-recheck/audit.log)保留；随后修正为解析动作一致，又纠正Node日志显示前缀假设，最终[审计日志](qa-recheck/audit-final.log)通过。这是证据辅助脚本错误，不是产品缺陷，未改产品/门禁。
- 写报告后质量检查曾因60MB导入上限未执行，保留[实际故障](qa-recheck/quality-import-failure.log)；无损gzip四份历史设计目录的AX/执行计划（不改PNG或browser.json），纳入本轮清单并验证可恢复。重跑发现QA新增墙钟脚本排版不合规则，保留[格式失败](qa-recheck/quality-format-failure.log)，仅格式化该QA脚本、重新执行[墙钟探针](qa-recheck/wall-budget-formatted.json)通过。最终[19文件质量检查](qa-recheck/quality-final.log)通过，未改产品或豁免门禁，不称全部首跑通过。

## 限制与交付边界

- **登录、错误凭据、退出、未登录访问：不适用。** 产品无账号认证与登录界面，不虚构账号、凭据或登录通过证据；私人数据留在原浏览器origin，不进入公开采集请求。
- 正常真实联网采集与后端受控异常、浏览器缓存/响应注入分别记录，不声称浏览器直接访问外站的实时端到端验证。HTTP成功及robots404不是内容许可，permissionGranted=false；只发布事实短简介，不复制长评/封面，不称入围为获奖或全站最新。
- 未测非阻断范围：物理手机、跨引擎、读屏器语音、系统IME全字符输入、原生select菜单键盘选择、生产多标签、真实私人数据、正式launchd安装和连续七天无人值守、真实来源超时事故及长期页面变更。AX只是树，touch只是真实浏览器触屏context；原生zoom已验证但截图裁切不作为完整可读性认证。未承诺专项不升级为阻塞，未测不写通过。
- 采集固定具体官方页集，长期来源扩展/维护及Owner正式安装仍需执行运行说明；当前无生产服务变更。此次QA仅新增验证计划/脚本/证据、更新报告并保留旧报告，不改实现、既有测试、release声明或保护配置，不运行Git写操作。
- [PR说明](pull-request.md)依据实际差异和本轮证据编写。自主授权仅用于普通交接，不是用户逐项批准；交report由交付流程处理PR，最终合并和高风险部署仍需人工授权。
