# Issue #97 需求决策台账

日期：2026-10-03。Status: Complete。Target artifacts: `prd.md`、`g1-review.md`。

## 授权与事实

原始用户表述：“页面上增加版本号显示，当前希望是0.1.0 rc2”。Runner 明确本任务自主推进，普通可逆选择可按证据推荐决定，不代表用户审查批准产物。原始 Issue：https://github.com/big91987/reading_list/issues/97。

本任务首次进入时不存在 `docs/04-implementation/tasks/97/`。已读取项目入口、当前产品 HTML/CSS 和版本/存储相关代码搜索、部署声明，以及本阶段 Skill 的方法、粒度、G1 和台账契约。`app/index.html` 无版本文本且有现成页脚；`app/styles.css` 的页面最小宽度为 320px；版本搜索未发现现有产品版本声明。现有书单行为以工作区代码为准，不把历史任务文档的未发布结论当作本次线上事实。

## Checkpoint

| Field | Value |
|---|---|
| last_completed_round | R-001（证据核对与自主决策，无提问轮次） |
| active_round | none |
| active_question_ids | none |
| unanswered_ids | none |
| next_id | D-004 |
| resume_note | 无 Asked、Conflict、Frozen 或未记录假设；进入设计；成功交接后通过工具处理补充，勿改共享文件 |

## 决策

| 字段 | D-001 | D-002 | D-003 |
|---|---|---|---|
| semantic_key | displayed-product-version | visibility-and-placement | version-lifecycle-and-boundary |
| question | 未向用户提问 | 未向用户提问 | 未向用户提问 |
| options | 不适用，用户已提供值 | 页脚常驻 / 新增隐藏入口；未发给用户 | 本次声明由维护者更新 / 自动查询发布；未发给用户 |
| recommendation | 原样显示 `0.1.0 rc2` | 页脚加“版本”前缀并保留原文案 | 只读声明，沿用受审查产品变更维护 |
| user_answer | “当前希望是0.1.0 rc2” | 无；自主决策，非用户批准 | 无；自主决策，非用户批准 |
| conclusion | 显示该版本值，保留空格与大小写 | 默认“版本 0.1.0 rc2”；无需点击，允许滚动，不固定悬浮 | 不自动查询、不写用户数据、不加管理入口；后续可更新版本声明 |
| status | Accepted（用户明确需求） | Accepted（Runner 授权自主决定） | Accepted（Runner 授权自主决定） |
| prerequisites | none | D-001 | D-001 |
| descendants | D-002、D-003 | none | none |
| supersedes | none | none | none |
| source | 本轮 Issue 输入 | HTML 既有页脚、当前单页产品；自主推进策略 | 无现有版本声明、静态产品形态、部署摘要非语义版本；自主推进策略 |
| rationale/impact | 明确用户口径，不自行格式化 rc | 低干扰且易撤回；发现性和可读性带入设计验证 | 避免扩大发布治理范围；未来存在手工更新陈旧风险，维护责任须明确 |
| artifact_mapping | PRD R-01、AC-01/02 | PRD R-02/03、AC-01/03/04 | PRD 3/4/8、R-04/05、AC-05/06 |

## Round R-001

- ordered IDs：D-001、D-002、D-003；response received：原始需求与 Runner 策略。
- mapping：用户原话对应 D-001；D-002/003 为有证据的自主决策，未当作用户回答。
- resolved IDs：全部三项；unanswered IDs：none。无需暂停等待用户。
- write-verification：落盘后检查四份文档、相对链接、需求/AC 标识、台账及状态一致性；具体结果见 G1 记录。
