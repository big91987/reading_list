# 书籍推荐、类型与简介：独立 QA 复验报告

日期：2026-10-04。任务：[Issue #100](https://github.com/big91987/reading_list/issues/100)。任务分支：`codex/issue-100-platform`。

## 本轮结论

**Ready PR 主线同步后的本轮独立 QA 通过，可交 report。** 两项原阻断缺陷均用原 QA 方法重新复现并通过；全部12项验收、50项Python、25项Node、10份真实浏览器计划209动作及注册宿主9项门禁通过。没有沿用开发自测或旧 QA 的放行结论，没有部署、安装生产调度、创建或合并PR。

上一轮真实失败完整保留在[首轮报告](qa-first.md)及[首轮边界结果](qa-logs/transport-boundaries.json)；上一轮通过报告另完整保留在[同步前报告](qa-before-integration.md)，旧记录不是本轮结果。独立新证据集中于 `qa-integration/` 和 `browser/qa-1-31` 至 `qa-1-40`。依据Runner Ready PR 集成复验授权完成后交接，不表示用户逐项审查批准。

## 基线、方法与责任

- 沿用未变更的[PRD](../../../04-implementation/tasks/100/prd.md)、[HLD](../../../01-architecture/tasks/100/hld.md)、[契约](../../../01-architecture/tasks/100/contracts.md)；读取最新返工交付、后端规范与运行说明。项目未配置独立QA Skill，采用已读的调试/验证方法与Trellis检查要求，不自创验收门槛。
- 来源U=用户明确要求，P=项目既有约束，A=Agent推荐默认，保持PRD原定义。设计提供交互与契约；开发负责实现和必需自测；QA负责以下独立验证，不修改产品或既有测试来使其通过。
- 所有浏览器使用隔离origin和合成私人数据。真实采集使用隔离临时根 `/private/tmp/reading-list-100-qa-integration`，调度disabled。未读取真实私人书单，不操作原生产服务。
- 新计划复用已接受步骤并在注册check重跑，附加独立目录、长文本、去重与人工信息保护断言。固定核心原文件与HEAD字节相同；本轮check与注册verify均直接执行原核心计划，没有复制或修改核心门禁。

## 逐项验收

| 条款 / 来源 | 本轮独立方法与证据 | 结果 / 责任 |
|---|---|---|
| AC-01 U+A | 正式CLI init/run/validate成功；2026-10-04 13:32:30.799005Z开始，13:32:37.833926Z生成32条，两个官方组织、三类型。另重新请求每组织一具体页核对书名、作者、机构与推荐措辞，并保存响应hash及原页压缩快照。[采集](qa-integration/real-run.json)、[目录](qa-integration/catalogue.json)、[出处抽查](qa-integration/source-audit.json) | 通过；QA执行，开发提供采集器。200/robots404不等于许可 |
| AC-02 U+A | 原两个失败边界独立重跑通过；50项Python覆盖七天due、未到期零请求、停机恢复、源退出/tombstone、小时重试、锁和plist。正式disabled tick成功。[边界](qa-integration/transport-boundaries.json)、[Python](qa-integration/python.log)、[tick](qa-integration/disabled-tick.json) | 通过；开发修复，QA复核，不声称生产安装或等待七天 |
| AC-03 A | Python覆盖部分/全源失败保旧、首次无缓存、原子发布和报告写失败；真实浏览器覆盖空目录、partial+stale、无缓存、缓存写失败、本地仍能添加。[Python](qa-integration/python.log)、[network](browser/qa-1-32/browser.json) | 通过；QA执行，受控故障不是生产源事故 |
| AC-04 U+A | 本轮采集目录在浏览器断言全部32、三类型30/1/1、古典与仙侠各0且显示空态；完整简介、具体HTTPS出处链接、未知时间诚实展示。[catalogue](browser/qa-1-38/browser.json)、[原页核对](qa-integration/source-audit.json) | 通过；QA执行，类型选择用DOM change验证，不冒称原生菜单键盘选项实测 |
| AC-05 U+P+A | 推荐加入默认未读、写失败零写/重试/刷新保留；隐藏已读后，空白与大小写不同的同名书仍全范围去重、存储不变。[main](browser/qa-1-31/browser.json)、[dedup](browser/qa-1-40/browser.json) | 通过；QA执行 |
| AC-06 U+A | 旧书人工编辑、取消零写、失败保草稿再保存；手动新增古典与仙侠及简介；80字书名/600字简介保留未知字段、read和位置。[main](browser/qa-1-31/browser.json)、[manual](browser/qa-1-39/browser.json) | 通过；QA执行 |
| AC-07 U+A | 0/1/N明确候选、拒绝零写、多候选选第二版、只补空缺、失败保候选、null命名空间拒绝覆写。[candidates](browser/qa-1-33/browser.json) | 通过；QA执行 |
| AC-08 P+A | 更新公共目录后公共新简介显示，人工类型/简介/出处及私人原字节不变；改名待核对和旧版改名只读识别，查看建议零写。[dedup](browser/qa-1-40/browser.json)、[main](browser/qa-1-31/browser.json)、[Node](qa-integration/node.log) | 通过；QA执行，公共更新为受控响应 |
| AC-09 P+A | 浏览器危险协议/非法版本/超长目录拒绝、不执行HTML；绝对同源、credentials omit、私人原值不变；Python覆盖公网IP固定、TLS/redirect/限长/超时/节流、HTTP GET/HEAD/503/404/405。独立真实墙钟阻塞探针通过。[network](browser/qa-1-32/browser.json)、[Python](qa-integration/python.log)、[墙钟](qa-integration/wall-budget.json) | 通过；QA复核，不把OS解析停止等待称为取消OS解析 |
| AC-10 P+U+A | raw加载零写、异常原值保护、备份恢复、外部冲突拒绝；完整对象删除撤销及失败保机会；固定核心16动作与旧源码往返测试。[storage](browser/qa-1-36/browser.json)、[core](browser/qa-1-37/browser.json)、[Node](qa-integration/node.log) | 通过；QA执行，外部写注入不是物理多标签认证 |
| AC-11 P+A | 1440桌面、320真实独立触屏context与tap、长书名/简介；真实Tab/Enter/Escape、焦点恢复；AX树及原生200% zoom、DOM无横溢。[touch](browser/qa-1-34/browser.json)、[keyboard](browser/qa-1-35/browser.json)、[manual](browser/qa-1-39/browser.json)、[catalogue](browser/qa-1-38/browser.json) | 通过限定范围；QA执行，AX不是朗读、触屏不是物理手机 |
| AC-12 P | 实际deployed.json与immutable release三文件逐字节/hash核对10c5e03基线；本轮Node执行旧/新源码往返；release none指纹及compatible_from匹配；可信宿主9门禁、Python50/Node25及质量检查通过。[审计](qa-integration/audit.json)、[可信宿主门禁](qa-integration/host-checks/checks.json)、[质量](qa-integration/host-checks/check-8.log) | 通过；QA核对，不等于已发布或授权升级controller |

## 两项旧失败：具体场景与关闭证据

### QA-100-01：慢DNS后两次实际请求挤在一起（原P2，已关闭）

场景：采集器连续获取两个官方页面，第一次域名解析耗时2秒，后续连接和响应很快。约束要求实际HTTP发送至少隔1秒。旧实现把“开始准备请求”当作节流起点，解析耗时把等待时间抵掉，所以两次GET都在模拟时刻102发送，间隔0秒。这会在慢解析后的快速连续采集、重试或重定向时对来源网站形成突发请求；不是界面按钮失效或私人书单丢失。

开发将节流放到DNS/连接/TLS准备完成后的真正发送边界。本轮原命令 `python3 docs/05-validation/tasks/100/qa-transport-boundaries.py` exit0，两次发送为102和103，实际间隔1秒。正式联网五次请求的四个发送间隔为 **1.4822082 / 2.3390045 / 1.0009729 / 1.0002895秒**；重试/重定向回归也在本轮50项Python测试中重跑。见[原方法新结果](qa-integration/transport-boundaries.json)、[新审计](qa-integration/audit.json)。

### QA-100-02：整轮已超时却继续发送GET（原P2，已关闭）

场景：整轮限5分钟；模拟时刻100开始，截止400，DNS阻塞301秒直到401才返回。旧实现未在解析后重新检查截止，还至少给请求1秒，因而超预算后仍发送GET、读完才报size_limit。影响是异常网络下任务不能按约定及时结束，可能占锁更久或产生本应停止的网络活动；不代表正常采集必定失败。

开发新增各阶段剩余预算等待、截止复查和晚到socket清理。本轮同方法在DNS返回401时 **HTTP发送列表为空**，立即size_limit，断言通过。QA另外用真实墙钟80ms受控预算阻塞DNS与connect：约80.92ms/83.22ms返回；释放晚到结果后DNS无后续连接，晚到connect socket关闭。见[边界](qa-integration/transport-boundaries.json)、[墙钟](qa-integration/wall-budget.json)。这是缩短预算的真实等待探针，不是观察生产300秒事故；OS DNS本身不可强制取消，只是不等待其结束且丢弃晚到结果，不据此发HTTP。

## 主线同步影响与可信入口

- Runner已完成同步，当前HEAD为 `4e50635f011aa1e4899d90462fa634267d72a7c7`，父提交为 `3f93282a7e6d084bb370079ac227b7ac88da9cea` 与主线 `b21c4a1c8875a727adc5eab7af90a8bc70b9ac3e`。QA没有执行合并、提交或推送。[审计](qa-integration/audit.json)确认主线为当前HEAD祖先。
- 同步引入Owner维护的部署最新main/已部署版本跳过与SIGINT/SIGTERM激活回滚，以及联网选择/工作流入口更新。app、采集器、安装器、推荐测试、release、PRD/架构与同步前原字节一致，既有产品取舍没有变化；不是扩大功能或重新批准控制器变更。
- 当前[Python50日志](qa-integration/python.log)包含主线新增3个部署测试方法：过时/已部署请求跳过、已审批旧计划在main前进后跳过、取消激活回滚（SIGINT和SIGTERM两个子场景）。原部署8项与推荐39项均重跑，总50。测试在隔离临时release目录执行，未触碰实际生产激活或发送生产信号。
- 当前门禁是用户提供的维护者可信宿主verify.py入口；注册verify在宿主外执行同一配置，9项全部exit0，包含全Python50、Node25、真实core16/feature48、Python格式/lint。旧工作区full_harness/quality.py不是本轮入口，未执行它，未为其扫描上限删除、裁剪或归档证据。
- 直接在Agent沙箱执行指定入口首次在Chromium MachPort权限失败（[原日志](qa-integration/trusted-host.log)），不是产品缺陷。转注册宿主verify首次预检又发现失败输出生成的已跟踪check-4.log多出EOF空行；失败日志与回执[原样另存](qa-integration/check-4-sandbox-failure.log)，只从重跑前快照恢复滚动log后完整重新执行宿主9项通过。[维护者观察](qa-integration/host-tool-observation.md)记录工具问题，不修改共享工具/配置、产品或测试，不称首跑通过。

## 本轮回执、截图与证据保存

- 新10份注册check全部passed、errors=[]，总209动作；目录和长文本计划使用本轮正式采集的32条seed，其他异常/候选fixture复用数据但全部重新执行。正常真实联网、后端受控故障和浏览器缓存/响应注入分开记录。
- [桌面推荐截图](browser/qa-1-38/screenshot.png)、[移动推荐截图](browser/qa-1-38/mobile.png)已实际查看；[320触屏长书名/简介截图](browser/qa-1-39/mobile.png)亦已查看。展示梅西传前已断言完整32条及全部类型；“更新失败，显示上次缓存”是受控网络失败展示，不是正式CLI采集失败。
- 本轮实采revision为 `2369c13474e6bfcbdf114342101ed113693ed34214a817b3e7d1f5d243911355`，耗时7.034921秒；原页抽查与请求时刻/响应hash重新生成。HTTP成功和robots404不是许可，permissionGranted=false。
- 本轮浏览器PNG、AX、执行计划及回执均保留原文件，不进行压缩、去重别名或删除。重跑前保存现存[delivery-checks快照](qa-integration/before-delivery-checks/checks.json)与[runner-checks快照](qa-integration/before-runner-checks/checks.json)；当前通过门禁另复制到稳定[host-checks目录](qa-integration/host-checks/checks.json)，避免后续滚动写覆盖本轮依据。
- [审计脚本](qa-integration/audit.cjs)与[审计日志](qa-integration/audit.log)核对新source/计划原字节、209动作、50/25、9门禁、实际部署基线/release、主线同步与QA保护路径零改动；[证据hash清单](qa-integration/evidence.json)只读记录当前新文件和复制快照的长度/hash，不压缩或删除任何文件。
- 历史缺口仍明确：同步前报告已记录一份更早的滚动共享AX字节无法恢复。本轮不声称恢复该字节，也不把旧清单校验写成通过；旧失败/历史报告保持原文，新验收全部依赖本轮完整证据。

## 限制与交付边界

- **登录、错误凭据、退出、未登录访问：不适用。** 产品无账号认证与登录界面，不虚构账号、凭据或登录通过证据；私人数据留在原浏览器origin，不进入公开采集请求。
- 正常真实联网采集与后端受控异常、浏览器缓存/响应注入分别记录，不声称浏览器直接访问外站的实时端到端验证。HTTP成功及robots404不是内容许可，permissionGranted=false；只发布事实短简介，不复制长评/封面，不称入围为获奖或全站最新。
- 未测非阻断范围：物理手机、跨引擎、读屏器语音、系统IME全字符输入、原生select菜单键盘选择、生产多标签、真实私人数据、正式launchd安装和连续七天无人值守、真实来源超时事故及长期页面变更。AX只是树，touch只是真实浏览器触屏context；原生zoom已验证但截图裁切不作为完整可读性认证。未承诺专项不升级为阻塞，未测不写通过。
- 采集固定具体官方页集，长期来源扩展/维护及Owner正式安装仍需执行运行说明；当前无生产服务变更。此次QA仅新增集成验证计划/脚本/证据、更新报告并保留旧报告，不改实现、既有测试、release声明或保护配置；主线原有工作流/部署变更由Runner同步，QA未修改，不运行Git写操作。
- [PR说明](pull-request.md)依据实际差异和本轮证据编写。自主授权仅用于普通交接，不是用户逐项批准；保留既有Ready PR正文，交report由交付流程处理后续集成，最终合并和高风险部署仍需人工授权。
