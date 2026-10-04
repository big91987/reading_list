# Issue #100 决策与续接台账

> Status: Complete
> Target artifacts: `prd.md`, `research.md`, `g1-review.md`, `requirements-rework.md`, `network-recovery.md`
> Updated: 2026-10-04

## Checkpoint

| Field | Value |
|---|---|
| last_completed_round | R-003，联网恢复与两源内容PoC收口 |
| active_round | none |
| active_question_ids | none |
| unanswered_ids | none |
| next_id | D-010 |
| resume_note | D-008实际原会话联网恢复、D-009等价来源替换；业务目标/全部AC保留；本轮自查后重新交design，不沿用旧G2放行 |

本台账的 Accepted 表示“已纳入自主需求基线”，source 明确区分用户要求、既有约束和 Agent 决策。Runner 自主策略覆盖 Skill 的普通人工确认要求。D-001至007未发送访谈问题，其question是分析问题，不冒称已向用户询问；D-008是本轮持久化后向Runner/Owner提出的实际依赖请求，不是普通阶段审批。user_answer仅保存真实原话、未询问或尚未回答。

## 决策记录

| ID / semantic_key | question / options | recommendation 与依据 | user_answer / conclusion | status / source | prerequisites / descendants / supersedes | artifact_mapping |
|---|---|---|---|---|---|---|
| D-001 / product.discovery-metadata | 本期目标是什么？选项：官方推荐+分类+简介；只有元信息编辑 | 前者，用户同时明确提出三个需求，不能删自动推荐 | 用户：“自动从网上一些权威网站……官方的推荐……古典、仙侠……包括……已有的”；结论：三个结果均必需 | Accepted / 用户本轮原始Issue | none / D-002至D-007 / none | PRD §1、2、5 |
| D-002 / source.trusted-public | 首批来源？选项：官方公开荐书白名单；任意网站/商业热榜 | 前者，符合用户“官方、各种各类”；国家图书馆与中国作家网是待核验方向，当前web无可用返回。数量默认两个组织、三个非空类型，避免单源单类型假闭环；来源可逆替换 | 未询问；设计先按E-02的PoC计划验证具体来源，不把新书资讯误标背书 | Accepted / Agent默认；用户原话及research E-02的未验证假设 | D-001 / D-003、D-004 / none | R-01、03、09；AC-01 |
| D-003 / collection.recurring-operation | 如何自动更新？选项：可运营周期采集目录；浏览器每次直接跨站抓取；手工逐本录入 | 周期采集；静态本地应用没有真实后端，用户没承诺实时性。默认七天、到期补检，可调可停；不新增付费/不修改工作流 | 未询问；首次真实采集+无人值守到期更新+维护者立即执行/报告，具体实现交设计，不能仅内置演示数据 | Accepted / Agent默认；E-01、E-02 | D-001、D-002 / none / none | R-02、11；AC-02、03 |
| D-004 / metadata.legacy-match | 旧书如何补简介？选项：候选确认+手动编辑；按同名静默批量覆盖；任意全网检索 | 第一项；已有书只有名称，作者/版本身份不足。保留用户内容且无需外发私人书单 | 未询问；目录建议由用户确认，只补缺失；任意旧书均可手填，未知明确说明 | Accepted / Agent默认；代码title/read基线 | D-001、D-002 / D-006 / none | R-06、07；AC-06、07 |
| D-005 / taxonomy.browse | 类型如何提供？选项：可区分的受控类型集合；单一文学类别；无限预建分类 | 第一项；用户明确古典与仙侠，初始文学/历史/科普/其他是覆盖不同阅读主题的可逆默认，用户可编辑，来源分类与产品映射分开，待真实目录校验覆盖 | 用户原话含“古典、仙侠”；细化集合和多类型为Agent默认；无该类型内容显示空，不编造荐书 | Accepted / 用户要求+Agent默认 | D-001 / none / none | R-04；AC-04、06 |
| D-006 / metadata.preservation | 元信息与原书单如何兼容？选项：兼容扩展+失败保原值；重建/清空旧数据 | 第一项；项目要求数据保护，现有对象可保留附加信息。不在需求层指定数据schema或none发布等级 | 未询问；旧格式可读、纯加载零改写、用户采用/编辑才保存，撤销恢复全信息，改名关联待核对 | Accepted / 项目约束+Agent默认；E-01 | D-001、D-004 / none / none | R-05、08、10；AC-08、10、12 |
| D-007 / validation.honest-gates | 验证依赖如何处理？选项：显式设计前置补齐；仅凭静态/旧证据放行；交同样没能力QA | 第一项；当前shell DNS失败，无注册check，插件/资源发现未找到；需求审查不需执行UI，但设计/采集可行性必须执行 | 未询问；设计先核验能力与两源；开发补任务级测试，缺能力不减AC、不伪称通过、不转嫁QA | Accepted / Runner约束+E-03真实调用 | D-001 / none / none | PRD §7、8；research E-03、04；G1 |
| D-008 / operations.authorized-network-entry | 历史请求：请 Runner/Owner 提供哪一种可供本任务实际调用的已授权联网入口？选项：A现有本机预览宿主的任务执行入口；B已有无新增费用的联网Runner入口；C暂时没有可用入口，先由Runner/Owner配置 | 原建议A；本轮真实回答明确现有原会话即可，不能继续索要额外Runner或连接插件 | 用户：“此前 DNS 错误来自 Codex sandbox network_access=false，不是缺少远程 Runner”；平台已通过正式管理员接口允许既有requirements/design会话联网。结论：直接用现有终端/Python；首页恢复及两源内容PoC已执行，生产调度/分发仍由design定义 | Accepted / 用户本轮明确通知、当前开发者network enabled权限、source-probe-recovery与source-poc真实结果 | D-002、D-003、D-007 / D-009 / none | network-recovery §1、2、4；PRD §8；G1最新结论 |
| D-009 / source.evidence-backed-replacement | 首批候选遇限制如何处理？选项：取得依据再接国家图书馆；在同约束内换官方公开来源 | 本轮采用福建省图书馆新书推荐+中国作家网文学好书入围书单。国家图书馆声明存在内容使用/采集边界，默认暂不接入；两机构、三非空类型要求保持 | 未新增询问；Agent按已接受D-002的可逆替换授权，以真实34条解析/原页归属与版权边界证据定案；入围不写成获奖，索书号映射不冒称官方类型，未取得概括性再发布许可 | Accepted / Agent推荐默认、source-poc manifest/catalogue/report及network-recovery §3 | D-002、D-005、D-008 / none / none | R-01、03、04、09；AC-01、04、09；research E-06 |

## Round R-001

- ordered IDs：D-001、D-002、D-003、D-004、D-005、D-006、D-007；按依赖收口，不是同时发送的问题批次。
- response received：用户原始需求及Runner自主策略；没有另行追问或虚构答复。
- answer mapping：D-001与D-005的类型示例映射用户原话；其余归属Agent推荐或项目约束，不记为用户批准。
- resolved IDs：上述7项；unanswered IDs：none；不存在冲突、冻结或静默假设。
- write-verification：本轮落盘后重新读取台账并核对7个唯一ID、next_id、状态和目标文档引用；实际结果见 G1 自查。

## 可逆默认与影响

七天频率、首批机构、类型集合、候选确认方式可在保持AC结果的情况下细化。涉及实时服务/付费、新的个人数据外发、静默覆盖或降低“两源真实采集”则不是等价细化，应返还需求重新分析。最终合并与高风险部署仍由人授权。

## Round R-002（历史设计返工依赖协调，已由R-003收口）

- ordered IDs：D-008；active/unanswered：D-008；无产品目标重审批。
- response received：design → requirements的B-100-01返工报告，不是Owner提供联网入口的回答。
- D-001至007含义不变；D-007中“无check”为首次requirements历史事实，design原始结果现已证明其check能力。当前阻断是外部联网执行入口，不冻结或删除已接受AC。
- question与options：严格使用D-008记录；A推荐，B可先支持PoC但仍需周期/分发位置，C保持阻断。没有被问到的账号/密钥不能索取。
- resolved IDs：none；write-verification：发送前读取checkpoint及D-008，校验next_id=D-009、唯一Asked与同一问题/选项，实际结果见G1本轮记录。

## Round R-003（实际联网恢复与来源收口）

- response received：用户明确原会话权限修复并要求终端/Python实测，不是回复A或批准新增架构；按实际含义映射D-008，Accepted代表环境决定，不是用户审查本PRD。
- ordered IDs：D-008、D-009，按依赖顺序收口，未另发问题批次；resolved IDs：D-008、D-009；unanswered：none；next_id：D-010。
- D-001至007业务规则保持；其中早期“当前DNS失败/无check”为历史证据，现已被恢复和design能力证据更新，不重新审批。
- D-009为本轮可逆来源推荐，真实解析34条，不降低任何AC；两次解析失败及修复回归、质量体积失败及无损去重/压缩恢复均留证据。
- write-verification：交接前读取并核对9个唯一Accepted、无Asked/Conflict/Frozen、下一ID及R/AC追溯和原始hash，结果见G1最新自查。
