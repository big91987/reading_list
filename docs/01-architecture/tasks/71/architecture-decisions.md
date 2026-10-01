# Issue #71 架构决策台账

> 状态：Complete · 更新：2026-10-02 · 目标产物：hld.md、contracts.md、原型及 design/README.md

| 检查点 | 值 |
|---|---|
| 当前层级 | 逻辑、部署与实现设计均已批准；进入 LLD／研发交接 |
| 最近完成轮次 | Design-v1：用户明确批准 A-001～003；Escape 补测通过，不重复审批 |
| 活动轮次 | none |
| 活动问题／未回答 ID | none；Accepted 3 项，未回答／冲突／冻结 0 项 |
| 下一个 ID | A-004 |
| 恢复说明 | 先读 AGENTS、docs/README 和本文件；设计已批准，直接消费确认基线继续研发；不重开 PRD 或设计审批 |

依赖图：已批准 PRD（含 D-001～003）→ A-001、A-002、A-003 → LLD／产品实现／验收。三项无相互审批依赖；整包批准能无歧义映射三项。调查事实 F-001：现有 app 使用无 ID 的 `{title, read}` 数组和 `page-between-reading-list`，新增长度 80、toLocaleLowerCase 去重；源代码 2026-10-02 检查。验证 V-001：原型 7 组最终 browser 检查通过（含本轮 Escape），证据见 design-validation.md；真实输入法等缺口不升级为已验证。

## A-001：成功写入后提交候选

| 字段 | 记录 |
|---|---|
| architecture_layer / semantic_key / decision_type | 3/5 · persist-before-commit · Decision |
| question | 是否批准先构造候选清单，本地写入成功后才提交内存和成功反馈，失败保留原名与草稿的设计？ |
| options | A 候选先写后提交；B 先改内存再回滚 |
| recommendation | A；不暴露未保存结果，失败分支单一，成立条件为现有同步浏览器本地模型 |
| architecture_impact | 校验、清单管理、本地保存及相关编辑协调操作共用成功门槛 |
| user_answer | 设计通过，A-001、A-002、A-003 均接受推荐方案，批准进入研发。 |
| conclusion / status | 采用 A：候选先写后提交，失败保留原值与草稿；Accepted |
| prerequisites / descendants | 已批准 PRD BR-07/R-08；LLD 保存模块与完整产品验收 |
| evidence | F-001、原型失败／重试路径，2026-10-02；不是实际产品存储异常验收 |
| source_coverage | R-02/03/05/08 纳入清单管理和本地保存；无需新服务 |
| validation | 研发注入实际 setItem 抛错并比较存储／内存，失败不得污染其他命令；不符则阻止交付 |
| artifact_mapping / supersedes | HLD §3～7、contracts §3～5；none |

## A-002：条目内表单与响应式操作布局

| 字段 | 记录 |
|---|---|
| architecture_layer / semantic_key / decision_type | 1/5 · inline-responsive-editor · Decision |
| question | 是否批准原型展示的条目内输入、保存／取消、条目错误和桌面／手机布局、键盘与焦点安排？ |
| options | A 本次原型的条目内表单；B 保持已批准原位编辑但调整布局细节后再审查 |
| recommendation | A；沿用纸色、暖色、字体与已读划线；入口常显，手机操作换到第二行 |
| architecture_impact | DOM 重绘、焦点恢复、状态播报；超长输入完整保留并报错而非截断 |
| user_answer | 设计通过，A-001、A-002、A-003 均接受推荐方案，批准进入研发。 |
| conclusion / status | 采用 A：本原型布局及交互细化已获批准；Accepted；原位、单条草稿等上游业务规则仍 Accepted |
| prerequisites / descendants | 已批准 R-01/04/06/07；LLD DOM 与产品 UI 验收 |
| evidence | 已查看桌面 1280px、手机 320px、错误、失败截图及键盘路径；输入法未实际模拟 |
| source_coverage | R-01/02/04/06/07，全部草稿和可操作状态纳入交互呈现 |
| validation | 产品 AC-11/12，包括真实中文组合、辅助技术和布局测量；发现偏差记录并修复 |
| artifact_mapping / supersedes | 原型全目录、interaction.md、contracts §5/6；none |

## A-003：保持持久格式，使用临时目标关联

| 字段 | 记录 |
|---|---|
| architecture_layer / semantic_key / decision_type | 3/5 · transient-target-reference · Decision |
| question | 是否批准不新增持久 ID／版本或迁移，使用当前加载周期内目标对象关联，确保重名历史与筛选下标不会选错书？ |
| options | A 临时对象关联并在替换时重绑定；B 增加持久 ID 和迁移（将改变已批准数据兼容约束，需另行范围审批） |
| recommendation | A；保持旧 JSON、无需升级存储；成立条件是本轮单页面本地清单 |
| architecture_impact | 更新候选时保留位置／字段；不能通过名称或过滤下标定位；复用原生 DOM 和当前静态部署 |
| user_answer | 设计通过，A-001、A-002、A-003 均接受推荐方案，批准进入研发。 |
| conclusion / status | 采用 A：保持持久格式，用临时目标关联并在替换时重绑定；Accepted |
| prerequisites / descendants | 已批准 BR-05/06，F-001；LLD 状态与目标定位测试 |
| evidence | 现有源码与原型筛选／标记／删除协调路径；旧 fixture 深比较待研发 |
| source_coverage | R-03/05、AC-05/06/09/10；历史数据和派生统计纳入原清单责任 |
| validation | 修改前 fixture 含重复／长名；改目标无误伤，标记替换后保存仍正确；失败阻止交付 |
| artifact_mapping / supersedes | HLD §2/3/8、contracts §1/2；none |

决策没有新增不可逆存储变更，故本台账与 HLD 比较承担架构记录，不另建空泛 ADR。已确认需求记录仍以 requirements-decisions.md 为唯一来源。用户设计批准已映射为三项 Accepted；本轮只补证据，按其授权直接使用注册工具交接，不再次审批。

## 本轮用户批准原文与答复映射

用户原文：“我已在真实网页操作原型，检查空名、Escape 取消、保存后刷新保留已读状态、保存失败与恢复重试，以及 320px 手机编辑布局；也已审查 HLD、contracts 和 G2 自查。设计通过，A-001、A-002、A-003 均接受推荐方案，批准进入研发。共享浏览器检查器已修复 Escape 支持，请用已注册 check 补跑 Escape 取消路径并更新真实证据；这不改变已确认设计，无需再次审批。随后直接调用 submit_handoff 交给研发，交接结果请如实简短说明。”

映射：A-001／A-002／A-003分别采用原推荐A，无替代／冲突／冻结。本轮注册 check 的 check-escape.json 已通过35动作，报告 design-1-8/browser.json；原型代码与已确认行为未变。用户亲自操作是用户报告的人工证据，与Agent运行的注册检查证据分别记录，不冒充Agent实测。
