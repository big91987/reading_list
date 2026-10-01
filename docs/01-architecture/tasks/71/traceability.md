# Issue #71 需求—架构—验证追溯

> v1 · 2026-10-02；设计覆盖不代表产品验收完成。LLD Owner 全部为下游 development Agent。

| 需求／AC | 架构驱动及 HLD 映射 | 决策 | 原型证据／研发验证方式 | 覆盖 |
|---|---|---|---|---|
| R-01、AC-01 | 原条目修正；HLD §3/4，contracts §3 | A-002/003 | desktop 已读／未读保存；研发验证原名预填与不新增对象 | Covered |
| R-02、AC-02 | 空名错误恢复；HLD §4/5，contracts §3 | A-001/002 | desktop/errors 空名拒绝再修正 | Covered |
| R-02、AC-03 | 全清单重名；HLD §2/4，contracts §3 | A-001/003 | desktop 隐藏 DUNE 仍拒绝；研发历史重复 fixture | Covered |
| R-02/03、AC-04 | trim／自身排除／大小写／80边界；contracts §3 | A-001/003 | desktop trim、DUNE；errors 80成功／81拒绝；原名与emoji边界待研发 | Covered |
| R-03/05、AC-05 | 状态、位置、统计、三筛选；HLD §3/4/6 | A-001/003 | desktop 三筛选可见结果／统计；研发顺序与read深比较 | Covered |
| R-03/05、AC-06 | 旧存储兼容与刷新；HLD §5/8，contracts §1 | A-003 | desktop/mobile 刷新持久；原产品键及旧 fixture 深比较待研发 | Covered |
| R-04、AC-07 | 取消／刷新丢弃；contracts §5 | A-002 | desktop/mobile/errors；关闭页面生命周期待研发 | Covered |
| R-04/05、AC-08 | 唯一草稿／换条筛选丢弃；contracts §2/5 | A-002/003 | mobile 换条／筛选；研发断言编辑条数和预填 | Covered |
| R-05、AC-09 | 删除终止及其他删除保留；HLD §4/5 | A-001/003 | mobile 目标删除刷新；coordination 删除其他／已新增书 | Covered |
| R-05、AC-10 | 新增标记协调与旧主线；contracts §5 | A-001/003 | coordination 新增失败／成功、标记移出筛选；研发固定 reading-core 全主线 | Covered |
| R-06/07、AC-11 | 320/1280、长名布局；HLD §6、interaction.md | A-002 | desktop/mobile/errors/coordination 动作与截图；研发溢出测量 | Covered |
| R-07、AC-12 | 键盘／语义／组合输入；HLD §6、contracts §6 | A-002 | keyboard Tab/Enter、escape 真实取消路径和源码语义自查；真实中文IME、辅助技术待研发，产品 Escape 仍须回归 | Partial：技术证据缺口，不是未定义行为 |
| R-08、AC-13 | 原名可信、草稿重试；HLD §4～6，contracts §4 | A-001 | mobile/failure 原型写入入口故障；真实storage异常快照验收待研发 | Covered |

US-01→AC-01/05/06；US-02→AC-02/03/04；US-03→AC-07/08/09/10；US-04→AC-11/12；US-05→AC-13。所有 R-01～08、US-01～05、AC-01～13 均有责任、契约、验证及 LLD 接续方式；Covered 只表示设计承接完整。非目标见 HLD §1/2，无无来源后台、身份或新数据体系。
