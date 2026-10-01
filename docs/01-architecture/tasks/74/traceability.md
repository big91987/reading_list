# Issue #74 来源覆盖与追溯

输入：[PRD](../../../04-implementation/tasks/74/prd.md) G-01～03、R-01～08、US-01～04、AC-01～10；D-001～005 已接受。范围无改动。

## 能力—事实—责任覆盖（提出模块前完成）

| source_ref | capability_or_fact | owner_domain | adjacent_domain | lifecycle_or_flow | disposition |
|---|---|---|---|---|---|
| G-01、US-01、R-01/02/06 | 阅读进度与完整计数、分类空态 | 书单展示 | 书单管理 | 加载、只读投影、筛选 | Included |
| G-02、US-02、R-03/04/05 | 新增、删除、阅读状态、编辑后数量 | 书单管理 | 书单展示 | 校验、保存、渲染；同一条目生命周期与失败责任 | Merged（复用现有管理流程，不拆成四个领域） |
| US-03、R-08 | 旧 JSON、本地事实与恢复 | 书单管理 | 浏览器存储 | 加载、成功保存、失败保持 | Included |
| G-03、US-04、R-07 | 原视觉、键盘、筛选、焦点、摘要、编辑兼容 | 书单展示 | 书单管理 | 现有 UI 行为与响应式渲染 | Included |
| PRD §3/8、R-08 | 同源 localStorage、静态运行 | 浏览器 | 书单管理 | Browser 提供持久化；应用负责错误处理 | External |
| PRD §2/8、D-004/005 | 搜索、后端、计数存储、跨页同步 | 无新增主责 | 无 | 独立需求触发后再评估 | OutOfScope |

HLD 图中管理、存储、内存集合、计数、筛选／列表对应上述责任；投影是同一展示责任域内部，不新增独立服务或数据事实。没有 Gap。

## 需求—架构—验证

| requirement_ref | architecture_driver | hld_mapping | decision_refs | validation_ref | lld_owner | status |
|---|---|---|---|---|---|---|
| R-01、AC-01、G-01 | 同时可见与精确计数 | HLD §2/5、契约 §2/4、交互规范 | D-005、A-001 Accepted | flow、layout、关键状态截图 | 前端展示 | Covered（设计已批准） |
| R-02、AC-02 | 全量而非可见列表 | HLD §2/3、契约 §2 | D-001～005 | flow 筛选不改数 | 前端渲染 | Covered |
| R-03、AC-03 | 成功增删更新 | HLD §3、契约 §3 | D-001～005 | flow 增删；正式完整样例序列待研发 | 前端管理 | Covered |
| R-04、AC-04/08 | 双向状态／改名兼容 | HLD §3、契约 §3 | D-001～005 | flow 双向移出分类、改名；取消及错误完整回归待研发 | 前端管理 | Covered |
| R-05、AC-05、G-02 | 保存生效与刷新恢复 | HLD §3/4、契约 §1/3 | D-001～005 | flow、failure；正式逐动作刷新待研发 | 前端存储 | Covered |
| R-06、AC-06 | 零和分类空态 | HLD §2/3、交互规范 | D-001～005 | failure、empty、flow零分类；仅已读集合待研发 | 前端展示 | Covered |
| R-07、AC-09、G-03 | 桌面／手机、键盘及可访问性 | HLD §5、交互规范 | D-005、A-001 Accepted | layout、keyboard；真实触摸／读屏待人工 | 前端展示 | Covered |
| R-08、AC-07/10 | 存储兼容与失败不计数 | HLD §3/4/6、契约 §1/3 | D-001～005 | failure模拟、源码核对；损坏数据及实际失败待研发 | 前端存储 | Covered |

Covered 表示 HLD 方案、契约及验证责任已承接，不表示所有产品 AC 已执行或通过。US-01～04 分别通过 AC 分组承接。A-001 只审批本轮展示／设计包，不重开需求边界。
