# Issue #94 架构决策台账

更新：2026-10-03。状态 Complete；层级0～5已覆盖。最近轮次 D1：事实调查→可逆方案选择→原型验证→G2自查。活动轮次 none；活动/未回答 ID none；下一个 A-004。恢复入口为设计索引及实际证据；尚未完成真实产品实现/AC验收。

依据 Runner 的自主推进策略，以下 Accepted 表示 Agent 在授权范围内依据证据作出的可逆决定，不表示用户逐项回答或审查批准。上游固定文案、顺序、范围和非目标继承 PRD，不重新询问。

依赖图：已就绪PRD＋app代码事实 → A-001 → A-002 → A-003 → G2。A-001/002为 Decision；A-003为 Validation。

## A-001 · 解释机制

- architecture_layer：3/5；semantic_key：filter-tooltip-presentation；status：Accepted；supersedes：none。
- question：用何种机制提供无需点击的短提示？（内部设计题，未向用户发问）
- options：原生 title；局部 CSS 浮层；独立 JS 提示组件。
- recommendation/conclusion：局部静态 span＋CSS，复用墨色样式，立即显示/隐藏；Escape 仅抑制本次悬停。原生 title 改动更少，但注册截图/DOM不能直接证明其可见性和退出；独立组件需更多状态与依赖，当前无生命周期需求。
- user_answer：无逐项回答；授权依据是本轮 Runner 明确自主策略，非伪造用户批准。
- architecture_impact：增加展示标记/CSS及极小临时事件，筛选/存储主责不变；可删除增量退出，无数据迁移。
- prerequisites：PRD R-01～04；descendants：A-002/003。
- evidence：2026-10-03 app/index.html/styles.css/app.js代码事实与 prototype 实测；原生 title 自动化限制来自上游交接。无外部规范合规声明。
- source_coverage：HLD §2全部来源已纳入/合并/外部/非目标，无新事实源；AC-01～07有追溯。
- validation：实际可见、真实进入事件、离开/Escape、原名称和存储断言；退出条件为设计原型检查通过；产品AC归研发。
- artifact_mapping：HLD §3/5、contracts页面/事件、interaction全部。

## A-002 · 能力与数据隔离

- architecture_layer：3～5；semantic_key：hover-only-and-data-isolation；status：Accepted；supersedes：none。
- question：如何保留原键盘/触屏筛选及本地数据？（内部设计题）
- options：仅 hover+fine 显示且原按钮直接激活；新增焦点/触屏提示流程。
- recommendation/conclusion：前者；不新增焦点/长按流程。固定 span aria-hidden，原名称不变；原型独立键隔离真实数据；无新API/产品存储。
- user_answer：无逐项回答；同本轮自主策略。保留原行为与非目标是上游基线，不重新决策。
- architecture_impact：仅CSS显示条件与演示隔离；触屏能力实际验证仍属研发，不凭媒体查询宣称已测。
- prerequisites：A-001；descendants：A-003。
- evidence/source_coverage：现有 button、aria-pressed、localStorage键与persist；覆盖R-03/04、US-02、AC-04～07及#71/#82责任。
- validation：Tab/Enter/Space、写失败下注入筛选、存储比较/刷新及原型核心/改名撤销回归；纯触屏后续验证。
- artifact_mapping：HLD §4/6、contracts、prototype/README。

## A-003 · 提示可见性证据

- architecture_layer：5；semantic_key：real-pointer-visible-evidence；status：Accepted；supersedes：none。
- question：注册工具没有独立 hover，怎样给出真实而非属性存在证据？（验证问题）
- options：仅属性断言（不足）；click移动产生真实pointerenter并在点击前读取CSS/几何，随后visible+截图；reload保持鼠标位置（实测不成立）。
- recommendation/conclusion：采用真实 pointerenter 观察，不模拟 hover；演示观察器不能控制浮层。保留失败和工具动作边界，纯 hover 停留手验由研发补齐。
- user_answer：无逐项回答；这是事实调查/验证修正，不改变上游产品范围。
- architecture_impact：仅原型证据/观察器；不得将 demo 观察器移植入产品。
- prerequisites：A-001/002；descendants：G2及研发验证。
- evidence：design-1-1刷新后visible超时；design-1-2通过，可信指针进入时tooltip实际display/宽度与点击前filter，实际桌面截图。
- source_coverage：AC-01/02提示可见性在设计阶段有证据，独立hover动作/完整产品验收仍Partial。
- validation：注册工具五组通过、截图人工核看；移入浮层持续可读、纯悬停、触屏/跨引擎仍列后续，不伪报已测。
- artifact_mapping：design-validation、G2、traceability。

没有会改变方向的开放问题，没有P0/互斥目标；无须用户答复。没有难逆转决策，不建立额外 ADR。后续证据若推翻当前机制，冻结受影响 A-001→A-003/G2，修正原型与文档并复验，不沿用旧通过。
