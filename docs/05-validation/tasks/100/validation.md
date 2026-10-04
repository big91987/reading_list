# Issue #100 开发验证与QA输入

## 当前：QA返工后的重新验证

QA已证实首次Transport违反实际发送1秒间隔及300秒整轮预算（QA-100-01/02），原研发就绪结论不可沿用。当前修复与逐AC复验、失败→通过证据、47项Python/25项Node、10份真实浏览器208动作、真源32条和完整门禁见[本轮返工报告](development-rework/README.md)。仅重新达到研发就绪，最终QA尚未放行；当前临时预览为`http://127.0.0.1:5535`，无正式安装/发布。

## 首次开发验证（历史，不作为返工后放行）

2026-10-04，development；依据Runner自主推进授权，非用户逐项审查批准。
结论：已实现接受设计并完成研发必需自测，Ready for independent QA。独立QA尚未执行/放行；没有安装正式服务、升级生产controller、发布、Git写操作或合并。

## 成果与复现

- 产品：`app/app.js`、`index.html`、`styles.css`；推荐/我的书单双视图，主动加入、类型/简介编辑、0/1/N候选补空缺、人工快照、改名待核对、完整撤销及失败重试。
- 后端：`scripts/recommendations.py`、`local_deploy.py`、`install_local_preview.py`；两固定源安全采集，独立公共目录，绝对同源只读路由，Owner显式安装支持、CLI/锁/预算/原子发布/调度治理。未修改保护Workflow或共享Harness。
- 本机工作树预览：`http://127.0.0.1:5534`；运行入口[preview.py](preview.py)，操作及正式Owner安装边界见[operations](../../../04-implementation/tasks/100/operations.md)。临时采集根为`/private/tmp/reading-list-100-development`，调度关闭；默认原5533服务不变。不同origin不含原私人书单，不宣称完成原origin迁移。
- 开发文档：[实施计划](../../../04-implementation/tasks/100/implement.md)、[LLD](../../../01-architecture/tasks/100/lld.md)、运行说明；新前后端`.trellis/spec/`记录可执行签名、错误矩阵、兼容/错误示例与测试要求。PRD/HLD/契约/原型复用，不降低11R/12AC。

## 真源与内容边界

最新正式入口`python3 scripts/recommendations.py run --root /private/tmp/reading-list-100-development`退出0，见[final-real-run](collector/final-real-run.json)与[final-catalogue](collector/final-catalogue.json)。
2026-10-04T09:14:50.370283Z开始，09:14:54.808360Z生成；32条、中国作家网30条/福建馆2条、三非空类型（现当代文学/历史社科/科普），coverage=ready，revision=`027ea87c5caf10ee72ced73622aaafc4c4a9a42c60a04816cf0d9ab57f3f3013`。

请求报告逐项保留具体URL、请求时间、HTTP状态、响应长度/SHA256及32条摘要证据hash。抽查中国作家网《屯堡》（冉正万，长篇小说、科举/屯堡/军屯内容线索）及福建馆《梅西传》（塞尔吉奥·莱文斯基，足球传记、作家出版社）与来源解析证据一致；不称入围为获奖，不称书单为全站最新。来源日期未明确即null，UI说明未知。

简介为受证据支持的确定性原创短概述，不复制长评/封面；缺依据整源拒绝发布。HTTP200与robots404不是许可，报告`permissionGranted=false`。固定页集是已接受维护者治理方案，不自动发现全站新页面；扩充页面及事实规则需Owner维护，详情见operations。正式长期运行接入仍由Owner显式审查。

## 逐AC结果与责任

来源U=用户明确要求、P=项目既有约束、A=Agent推荐默认；沿用[PRD](../../../04-implementation/tasks/100/prd.md)及[设计追溯](../../../01-architecture/tasks/100/traceability.md)。表中通过仅指研发负责的方法实际通过，QA对全部条款独立复验。

| AC / 来源 | 开发方法及实际证据 | 研发结果 / 后续责任 |
|---|---|---|
| AC-01 U+A | 真源32条/两组织/三类型，具体请求与摘要hash；Python两源及无依据拒绝测试 | 通过；QA独立出处抽查，不以fixture代替实采 |
| AC-02 U+A | 正式CLI实际run；Python受控时钟tick未到期零请求、七天到期/登录恢复补检、启停保持due、首次ready/合法退出重启、plist小时RunAtLoad/退出测试 | 通过；QA复核入口/运维，不称生产已安装或观察七天 |
| AC-03 A | Python单源parse/网络失败、全败/首次无缓存、policy暂停/恢复、旧成功保留、报告失败/原子中断；真实浏览器网络专项7响应场景 | 通过；QA独立故障复验 |
| AC-04 U+A | Node目录schema/revision/类型/身份；浏览器有效空、类型空、三类筛选及长信息；真实请求具体原页200，未知时期UI明确 | 通过；QA复验展示/类型，不造古典/仙侠数据 |
| AC-05 U+P+A | Node全范围trim/大小写去重与完整状态；主流程加入/重复/失败/恢复/刷新及候选专项 | 通过；QA复验原数量/顺序/read/元信息 |
| AC-06 U+A | Node新增/编辑/限制/人工字段/失败原子；主流程保存与候选取消/写失败重试、触屏长简介与旧数据占位 | 通过；QA复验草稿/原值/持久化 |
| AC-07 U+A | 明确隔离的0/1/N夹具，单候选需确认、多候选选第二版、拒绝及已有完整人工信息零写、未知命名空间null拒绝 | 通过；QA复验身份与零副作用，N夹具不冒充真实官网 |
| AC-08 P+A | Node实际旧版改名/新版只读识别titleAtAdoption差异；浏览器人工信息保存、目录刷新不覆写、改名待核对及候选重绑 | 通过；QA复验快照，不静默清空关联 |
| AC-09 P+A | 固定公开GET请求/无私有字段、DNS私网/重定向/TLS地址/预算边界测试及数据流自查；浏览器HTML安全文本/危险链接/schema/过大目录拒绝、缓存故障与书单继续 | 通过；QA安全复核；浏览器响应注入不是实时外站端到端采集 |
| AC-10 P+U+A | 核心16动作原业务动作/断言保留；Node旧JSON/未知字段/完整撤销；浏览器旧raw加载零写、备份恢复、外部存储冲突拒绝、失败撤销重试与完整位置/read/元信息 | 通过；QA独立核心回归；外部存储注入不是物理多标签认证 |
| AC-11 P+A | 桌面、320长中文/touch、真实Tab/Enter/Escape及焦点恢复、AX；原生zoom actual2/160 CSS px/DPR2的DOM全宽断言无横溢 | 通过；QA独立交互复验。AX非朗读语音，touch非物理手机，不承诺跨引擎认证 |
| AC-12 P | 实际已部署10c5e03原文件hash、旧新版执行往返和原raw备份恢复；none发布声明；Python37/Node25、格式lint及8项Owner门禁 | 通过（研发）；QA独立放行，最终合并/高风险部署仍人工 |

## 功能、质量与跨层自查

可重跑命令：

```sh
python3 -m unittest discover -s tests -p '*_test.py'
node --test tests/*.test.cjs
python3 full_harness/quality.py fix
python3 full_harness/quality.py check
python3 docs/05-validation/tasks/100/evidence-deduplicate.py verify
```

最新Python37/Node25通过（包含已有部署8项及核心JS回归），Python13文件格式/lint通过；日志见[Python](collector/reading-list-100-python.log)、[Node](collector/reading-list-100-node.log)、[fix](collector/reading-list-100-quality-fix.log)、[check](collector/reading-list-100-quality-check.log)。不把平台通用verify仅发现的local_deploy8项当全部新增Python测试。

Owner完整质量门禁由注册`verify`在宿主运行，最终[checks.json](delivery-checks/checks.json)8项exit0：diff、Prettier、ESLint、JS语法、固定核心、功能浏览器、Node25、既有部署8项。保护配置未修改、无lint豁免/产品debug注入接口；纯JS无独立TypeScript检查配置，不自行新建。

trellis-check与交付检查已自查：公开采集→源快照→原子目录→只读HTTP→schema/cache→安全文本；私人写入只经用户操作→persist原字节比对→成功后提交内存，零上传第三方；源移除重建摘要证据、人工快照和未知属性保留；控制器更新与app release分离。单经典app.js保持Owner ESLint词法边界，未新增未经需求支持的模块/配置。

最终[development-audit.json](development-audit.json)核对7份当前开发/索引文档86个本地链接、实际基线3份文件hash/长度、当前release指纹、保护目录零变更、核心计划与HEAD逐字节相同、11R/12AC保留；临时预览实际HTTP200/32条。临时审计命令初次列表表达式语法错误未运行，修正后全部通过；不把该首次尝试写成通过。

## 真实浏览器回执

注册check使用root=`app`；7份最终计划173动作，passed=true/errors=[]。已核对计划与执行步骤、所有page_script原文件逐字节一致，见[browser-audit.json](browser-audit.json)。

| 计划 | 最终回执 | 动作 |
|---|---|---|
| [browser-plan](browser-plan.json) | [development-1-13](browser/development-1-13/browser.json) | 48 |
| [network](browser-network.json) | [development-1-14](browser/development-1-14/browser.json) | 14（含7响应场景） |
| [candidates](browser-candidates.json) | [development-1-15](browser/development-1-15/browser.json) | 39 |
| [touch](browser-touch-product.json) | [development-1-16](browser/development-1-16/browser.json) | 13 |
| [keyboard](browser-keyboard-product.json) | [development-1-17](browser/development-1-17/browser.json) | 20 |
| [storage](browser-storage.json) | [development-1-18](browser/development-1-18/browser.json) | 23 |
| [core](../../../../tests/browser/core.json) | [development-1-19](browser/development-1-19/browser.json) | 16 |

核心计划保留旧计划16个业务动作/断言；新功能专项不替代核心。fixture来自实采32条的3条子集，歧义/恶意/网络状态另为明确测试数据。触屏是真正独立hasTouch/isMobile上下文、tap/maxTouchPoints=1；键盘计划用真实Tab/Enter进入/加入/打开编辑、Escape取消及焦点恢复，但简介输入使用fill，不冒称全字符键入认证。额外原生select菜单ArrowDown/Enter探测未能改变值，最终不声称原生菜单选择已通过；类型行为另有事件专项。

补充[推荐页展示计划](browser-showcase.json)4动作通过，见[development-1-20](browser/development-1-20/browser.json)，不替代上述验收。已查看[推荐页](browser/development-1-20/screenshot.png)、[桌面书单](browser/development-1-14/screenshot.png)、[320触屏长信息](browser/development-1-16/screenshot.png)、[原生zoom截图](browser/development-1-13/zoom-47.png)。zoom图存在裁切，不把它当完整可读性截图；真实zoom指标与DOM元素边界/scrollWidth断言支持无横溢结论，320长信息截图支持窄屏完整展示。AX回执只证明可访问树，不冒称读屏音频。

## 实际兼容与发布声明

Owner现有`deployed.json`及immutable release只读核实实际部署SHA=`10c5e03d04bad026524e20476efd124db7e3a907`；没有拿当前HEAD猜部署基线。三份实际app文件快照与长度/hash见[baseline.json](compatibility/baseline.json)，Node测试直接执行旧源码读/改名/删除/撤销及新版往返，保留bookInfo/未知属性。
书单无需启动迁移；新增信息仅用户主动保存扩展。旧版不显示元信息但保留；旧版改名后新版只读显示待核对。浏览器原raw备份/主动恢复/零写刷新已验证；未读取真实私人书单。
验证后执行`declare --impact none --compatible-from 10c5e03d04bad026524e20476efd124db7e3a907`，写[deploy/release.json](../../../../deploy/release.json)，app摘要与当前文件一致。none仅表明数据兼容，无数据转换/移除；不是controller重装、launchd安装或正式发布授权。

## 失败历史、修复与证据存储

- 初次浏览器精确状态定位歧义改为完整状态断言；原生zoom窄屏溢出及`[hidden]`被grid覆盖已修复并在最终回执重跑。旧失败JSON/独有图像保留。
- 初次双经典脚本的ESLint跨文件no-undef修复为原单app.js同作用域，未配置豁免。
- shell完整verify在Chromium启动因MachPort/EPERM失败，日志[保留](collector/reading-list-100-verify.log)；改用注册宿主verify。其首次feature步骤报`page_script requires prepared source`，将browser-plan中断言源码从文件原样嵌入source后通过；动作/断言未降级，未改共享Harness或可信门禁。
- 新截图导致工作区60,207,583字节，core check导入上限失败（未运行）。沿用字节相同PNG可恢复别名，新增100项节省13,635,263字节；与上游101项合计201项已核对SHA256/长度。独有原图和失败/通过回执不删；旧路径读取canonical，恢复入口见[evidence-archive](evidence-archive.md)与[manifest](evidence-aliases.json)。

## 交接边界

普通可逆工程选择遵循既有U/P/A和Runner自主策略：原单脚本保持、只读旧改名识别、source预载、临时隔离预览和相同字节证据归档，依据分别为真实lint/旧源码测试/宿主失败/隐私origin/导入上限。未把自主决定记为用户已批准；不新增高风险安装或放宽验收。
没有尚未解决的研发阻断问题，没有需要用户回答的问题。QA应独立执行全部AC与核心/功能/安全/兼容复验，不沿用本报告作为QA放行；Owner正式接入/长期源维护、最终合并/高风险部署仍是后续人工责任，不转嫁同能力缺口给QA。
