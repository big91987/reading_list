# Issue #97 来源覆盖与需求追溯

当前恢复状态：能力及事实主责不变，全部PRD/AC保留。AC-03/AC-04的原生zoom/AX、160 CSS px文字完整及无新增宽/遮挡已复验，AC-05/AC-06相关零写门禁及完整8项verify本轮通过；共享工具依赖已解除。design7份原型计划重新通过；development接收后完整重跑，QA独立复核。具体条款来源/验证方法/责任见契约C-05，当前证据见 [恢复报告](../../../05-validation/tasks/97/design-rework.md)。下表Covered只表示架构承接，不冒称QA验收通过。

2026-10-03。基线 [PRD](../../../04-implementation/tasks/97/prd.md)；证据 [设计验证](../../../05-validation/tasks/97/design-validation.md)。Covered表示HLD已承接，不表示最终产品AC通过。

## 来源覆盖（先于责任图及实现选择核对）

| source_ref | capability_or_fact | owner_domain | adjacent_domain | lifecycle_or_flow | disposition |
|---|---|---|---|---|---|
| G-01、US-01、R-01/02 | 用户识别版本及原页脚保留 | 页面呈现 | 使用者 | 打开→查看→继续 | Included |
| G-02、US-02、R-05 | 既有阅读操作不受影响 | 既有书单 | 页面呈现 | 原操作与恢复 | Included |
| PRD§3/4 | 维护者声明与首次交付、更新退出 | 产品维护 | 既有发布 | 声明→验证→交付→替换 | Included |
| R-03 | 可读、窄屏、缩放和无新增焦点 | 页面呈现 | 开发/QA | 查看与辅助访问 | Included |
| R-04、PRD§4 | 状态独立、数据不变量 | 页面呈现/既有书单各自主责 | 浏览器存储 | 读取版本不写书单 | Included |
| app/index.html/styles.css | 静态页面及既有页脚责任 | 页面呈现 | 静态交付 | 同生命周期、部署及故障域 | Merged：版本并入页面模块，不拆服务 |
| app/app.js、本地存储 | 既有用户数据格式与存储错误 | 既有书单 | 页面呈现 | 沿用加载/保存 | Included |
| 项目既有发布与release.json | 交付、兼容性声明 | 维护者/Owner | Runner | 既有命令/权限边界 | External：开发提供兼容证据，失败不改变数据 |
| PRD非目标 | 版本历史/自动取发布信息/账号等 | 无新增责任 | 无 | 不进入本次生命周期 | OutOfScope |

图、责任表和契约均只有页面呈现、既有书单、维护交付三个责任，不存在无来源服务、计量或状态对象。无Gap。

## 交付追溯

| requirement_ref | driver / hld_mapping | decision_refs | validation_ref | lld_owner | status |
|---|---|---|---|---|---|
| R-01；AC-01 | 唯一精确声明；HLD§2/3，C-01 | A-001、A-002 | states可见、layout唯一诊断、静态核对 | 产品HTML/CSS开发 | Covered |
| R-02；AC-01、AC-03 | 原文保留/自然流；HLD§3，C-02 | A-002 | states原文、layout截图与边界诊断 | 产品HTML/CSS开发 | Covered |
| R-03；AC-03、AC-04 | 320px/缩放/可访问性；HLD§3/5 | A-002、A-003 | layout及touch；原生200%/朗读后续 | 开发/QA | Covered，产品验证未完成 |
| R-04；AC-02、AC-05 | 状态独立/0新写；HLD§4，C-03 | A-001、A-003 | states筛选/刷新/写入故障/原始值和无写观察 | 开发/QA | Covered |
| R-05；AC-04、AC-06 | 保留原主线及无新网络；HLD§3/5，C-04 | A-001、A-003 | core改名撤销/touch键盘；静态无新增请求；产品待测 | 开发/QA | Covered |

双向核对：所有新增能力来自R-01～05；没有自动发布、遥测或持久version对象。AC-01～06均有设计或研发验证责任，没有通过压缩验收范围消除缺口。
