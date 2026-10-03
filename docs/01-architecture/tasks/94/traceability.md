# 需求—设计—验证追溯

Covered表示设计承接完整，不表示真实产品AC已通过。所有LLD/产品验证由development Agent负责，Owner/后续验收核验结果。

| requirement_ref | architecture_driver | hld_mapping | decision_refs | validation_ref | lld_owner | status |
|---|---|---|---|---|---|---|
| R-01/02、US-01、AC-01 | 不点击即解释，离开不常驻 | HLD §2/3；interaction呈现；contracts事件 | A-001/003 | hover plan、指针进入记录、截图；纯hover停留与浮层移入手验待补 | 展示/事件 | Covered（产品验收待补） |
| R-01、AC-02 | 选中/非选中解释独立 | HLD §3；contracts页面 | A-001/003 | hover点击前filter与点击后visible、states选中visible；研发补各选中范围逐一hover矩阵 | 展示/筛选 | Covered |
| R-01/02、AC-03 | 空/无结果文案不变 | HLD §2/3 | A-001 | states：空清单、仅已读→未读、仅未读→已读 | 列表/展示 | Covered |
| R-03、AC-04 | 不位移/原顺序样式/窄屏可用 | HLD §5；interaction布局 | A-001/002 | 静态基线一致性、桌面及320截图/溢出；产品基线几何对比待研发 | CSS/布局 | Covered |
| R-03、US-02、AC-05 | 保留三种筛选 | HLD §3；contracts匹配规则 | A-002 | hover、keyboard、core实际列表断言 | 筛选 | Covered |
| R-03、US-02、AC-06 | 保留名称/焦点/键盘/触屏 | HLD §4/5；interaction名称 | A-002 | 精确role/name与Tab/Enter/Space通过；真实触屏/朗读未测 | 输入/无障碍 | Covered（触屏后续验证） |
| R-04、AC-07 | 无写入/数据格式或CRUD变化 | HLD §3/4/6；contracts数据 | A-002 | storage快照/刷新/失败注入筛选、core、edit-undo；真实产品键/额外字段/写次数待研发 | 存储/书籍操作 | Covered |

反向检查：浮层、能力媒体查询及Escape均为R-01/03的可逆呈现机制，不引入独立业务状态/新存储；演示重置与观察器只为验证，不是新增产品能力。非目标覆盖HLD责任表，无来源组件为零。

阶段划分：本阶段原型验证完成；真实产品全部AC仍待实现后重跑。不能以Covered、原型pass或G2 READY替代产品验收。完整证据及限制见 [设计验证](../../../05-validation/tasks/94/design-validation.md)。
