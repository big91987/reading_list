# Issue #97 架构决策台账

## 当前恢复检查点

状态Complete（design依赖及自查就绪，不表示QA/上线完成）；活动问题none；下一ID A-005。用户明确恢复继续及Runner自主策略为推进依据，不视为具体产物逐项审查批准。

A-001/A-002内容不变。A-003的验证放行依赖基于本轮1-17～27及完整verify重新验证后解冻，保留上轮冻结历史。A-004状态Accepted/验证闭环：用户提供上游eab78c2说明，已只读核对修正调用并复验runtime零写通过/新增写正确失败/observations保留；原型native、7计划及产品四组layout/AX与全部8门禁通过，证据见 [恢复报告](../../../05-validation/tasks/97/design-rework.md)。后代为development接收后全量复验和QA，旧成功不替代后续必需检查。

## 上轮阻断检查点（历史）

状态Blocked（共享验证依赖）；当前层级5；活动问题none；无需用户重新回答产品选择。初次Complete/G2放行是历史记录，当前不沿用。A-001/A-002内容不变；A-003旧放行冻结，解冻条件为共享零写门禁修复并实际复验。

A-004：type=Validation，semantic_key=native-viewport-and-tool-integrity，前置PRD/A-001/A-002，状态Blocked。原生zoom与AX由当前注册check提供，实际复现支持160 CSS px且能执行隔离page_script；已有产品footer宽度修复同步到原型，不改业务/数据。阻断为共享assert.equal多传observations，Owner须上游修复/回归/同步；证据与恢复输入见 [design-rework.md](../../../05-validation/tasks/97/design-rework.md)。后代为G2再放行和development完整verify/QA交接；下一ID A-005。授权是Runner普通返工自主策略，不是用户审查批准。

## 初次设计台账（历史）

2026-10-03；状态Complete（设计选择已收口，实际产品验证在研发）。层级0～5；活动轮次none；活动/未回答ID none；下一ID A-004。

授权：Runner明确Issue自主推进，普通可逆选择可依据证据采用推荐；下面 Accepted 指自主决策已采用，不是用户已审查批准。上游版本值及页脚默认沿用 PRD，不重开审批。

依赖图：PRD → A-001；PRD → A-002；A-001 + A-002 → A-003 → HLD/契约/追溯/原型。若上游变更，冻结受影响结论并重新验证。

| 字段 | A-001 | A-002 | A-003 |
|---|---|---|---|
| layer/type/semantic_key | 5 / Decision / static-version-source | 3 / Decision / footer-layout | 5 / Validation / prototype-evidence |
| 问题 | 版本由何处维护？ | 页脚如何排布及可读？ | 当前证据覆盖何种条件？ |
| options | HTML单节点；JS常量；独立配置/自动查询 | 独立一行；同行并排；固定悬浮 | 注册真实浏览器加明确模拟边界；仅静态截图 |
| recommendation | HTML单节点，符合静态页面与无JS/请求依赖 | 独立一行，保留文案，避免窄屏拥挤 | 注册工具检查，原生缩放/朗读列后续验证 |
| status/conclusion | Accepted；C-01 | Accepted；C-02 | Accepted；验证报告中的原型证据，不表示产品AC全部通过 |
| user_answer | 无逐项回答；Runner自主授权 | 同左 | 同左 |
| evidence | 2026-10-03 app/index.html有静态页脚，app.js无版本模型；本地代码事实 | 既有页脚字号0.78rem及颜色#8f867b；版本单独14px muted；真实布局检查 | check实际结果、截图、失败及重试 |
| source_coverage | R-01/04/05、维护价值流与版本生命周期Included | R-02/03、AC-01/03/04 Included | AC-01～06覆盖责任明确，尚未产品验证 |
| architecture_impact | 不新增服务/API/持久化 | CSS/HTML局部可逆，不改书单 | 准确区分设计与产品验收 |
| prerequisites / descendants | PRD / A-003 | PRD / A-003 | A-001,A-002 / 研发验证 |
| validation | 唯一文本；静态来源；0新增写 | 1440px/320px布局、对比、非焦点 | 状态/布局/主线/触屏计划及人工边界 |
| artifact_mapping | HLD§2/4；契约C-01/03 | HLD§3/5；契约C-02 | 追溯及design-validation.md |
| supersedes | none | none | none |
| 退出条件 | 删节点，不改数据；未来自动版本另立需求 | 可逆替换CSS，重新验布局 | 发现方向性问题回退受影响结论 |

方案比较：HTML覆盖立即展示且存储/JS错误不影响文本，只有手工维护成本；JS常量增加初始化依赖但无本任务收益；独立配置或发布查询引入读取/更新失败及来源同步，无需求依据。同行排布更紧凑但320px换行控制复杂；悬浮增加遮挡风险且非目标。只读静态能力不需要领域专家或新平台选型，不存在难逆选择，ADR门槛未触发；台账保留全部可逆权衡，并未裁剪原型/HLD/契约。

风险及恢复：页脚发现性和手工陈旧由维护者承担；原生缩放、实际朗读、无JS加载、产品0请求与完整错误路径由开发/QA验证。恢复时读取本表、设计索引及实际证据；没有待用户回答的问题，不将“自主推进”写成具体产物人工批准。
