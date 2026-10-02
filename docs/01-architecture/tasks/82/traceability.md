# Issue #82 需求—设计—验证追溯

> 2026-10-02 · 需求与修订设计已批准。Covered 表示设计承接，不表示产品 AC 验收通过。
> 责任来源完整清单见 HLD §2；上游只读基线为 PRD/需求台账。

| requirement_ref | architecture_driver | hld_mapping / 契约 | decision_refs | 原型 validation_ref / 限制 | lld_owner | status |
|---|---|---|---|---|---|---|
| AC-01、BR-01/04 | 原名/状态/统计/持久化 | HLD §3；contracts §1/2/3 | A-001/002/003 | core：已读恢复、未读恢复、刷新统计；产品未验 | 清单/持久化 | Covered |
| AC-02、BR-02 | 最新一次、单次消费 | HLD §3；contracts §2 | A-001/002 | core：两删只恢复最后一本；研发按 PRD 核对连续操作/刷新无重复，内部守卫可独立单元检查 | 清单 | Covered |
| AC-03 | 空态可恢复 | HLD §5；interaction 状态表 | A-002/003 | core/empty：空态 Space 恢复、入口和焦点 | 交互 | Covered |
| AC-04、BR-03 | 正常动作保留，无计时，刷新失效 | HLD §3；contracts §2 | A-001/002/003 | core/states/conflicts：新增、改名、标记、筛选、取消/校验失败、刷新；无 timeout 静态核对 | 清单/交互 | Covered |
| AC-05、BR-05 | 当前筛选不变、完整清单恢复 | HLD §3；contracts §4 | A-001/002/003 | core/keyboard-filter：过滤删除、隐藏恢复、反馈/筛选/焦点 | 清单/交互 | Covered |
| AC-06、BR-06 | 新增同名冲突保留机会 | HLD §3/4；contracts §2/3 | A-001/002/003 | conflicts：删已读、新增同名、失败、改名后恢复，完整 JSON 核对 | 清单 | Covered |
| AC-07、BR-06 | 改名冲突、隐藏/大小写 | HLD §3/4；contracts §2/3 | A-001/002/003 | conflicts/keyboard：atomic habits 隐藏冲突，改名后重试 | 清单 | Covered |
| AC-08、BR-01/07 | 删除写失败保持旧机会 | HLD §3/4；contracts §2 | A-001/002/003 | failure：实际 setItem 抛错计数、JSON/统计/机会；成功重试替换；**仅原型** | 持久化/清单 | Covered |
| AC-09、BR-07 | 撤销写失败不提前恢复 | HLD §3/4；contracts §2/5 | A-001/002/003 | failure：实际异常、原清单/存储/统计不变、解除故障重试/刷新；**产品待执行** | 持久化/清单 | Covered |
| AC-10、BR-09 | 原完整序位/末尾与现存顺序 | HLD §3；contracts §1/5 | A-001/002/003 | core：A/B/C 删除 B 再增 D 得 A/B/C/D，删 C 再删 A 仅恢复 A；末尾恢复；严格越界内部边界由研发验证 | 清单 | Covered |
| AC-11、BR-08 | 草稿不丢失/不隐式保存 | HLD §3/5；contracts §4 | A-001/002/003 | conflicts：其他草稿保留、焦点、继续保存；被删书草稿不复活 | 交互/清单 | Covered |
| AC-12、QR-01 | 320px/1280px 视觉操作 | HLD §4/5；interaction 布局 | A-002/003 | core/conflicts/failure/states/empty：两种视口、长名、错误、空态、横溢出诊断；不是触屏真机验收 | 交互 | Covered |
| AC-13、QR-02 | 键盘和辅助技术 | HLD §4/5；contracts §3/4 | A-002/003 | keyboard/keyboard-filter：Tab/Enter/Space、焦点；ARIA 静态核对；真实朗读/IME 后续 | 交互 | Covered |
| AC-14、QR-03 | 既有能力与旧数据 | HLD §3/6；contracts §1/5 | A-001/002/003 | prototype 回归新增校验/保存/取消/标记/筛选/统计/刷新；实际产品旧 JSON/Owner reading-core 研发再跑 | 清单/交互/持久化 | Covered |

验证计划文件的完整路径见 prototype/README.md 及 fault-validation-plan.md；运行日志索引见 design-validation.md。所有产品 AC 验证，包括故障保持、旧数据兼容和连续操作无重复，均仍为 NEXT STAGE，由研发实施、QA 据证据判断；没有把后续未执行测试算作本阶段设计缺陷或声称已通过。

AC-08/09 正式方案改为 product-storage-failure-plan.json：注册工具故障注入＋snapshot_storage/unchanged_storage＋UI 书名/统计/机会断言＋同页关闭重试/刷新。design-1-19 已在隔离原型验证该正式路径（69/69），不算 app/ 产品通过。历史原型自带故障开关/计数证据仍保留，但不成为产品验收要求；内部 handler 或人工构造边界只可作为单元检查，不算真实用户操作。

反向检查：新增常驻 UI、单记录、写成功后提交均来自 BR/AC；故障开关和诊断仅验证工具，不成为产品能力。不存在新账号、API、持久历史、架构公共承诺或额外 SLA。HLD 能力表与逻辑图三个责任块一致，无无来源模块。
