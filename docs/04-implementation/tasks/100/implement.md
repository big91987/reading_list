# Issue #100 开发交付计划

2026-10-04，development Agent；Runner 自主推进，非用户逐项批准。
权威输入：[PRD](prd.md)、[设计索引](design/README.md)、[契约](../../../01-architecture/tasks/100/contracts.md)。

## 准备与变更边界

开发前 app 只有 title/read；没有目录请求、类型、简介。运行责任位于产品 scripts/local_deploy.py 和安装器，而不是 Harness。
新增 scripts/recommendations.py；修改 app 的交互/存储和产品 controller/安装器；新增对应 tests 和任务验证；验证后声明 deploy/release.json。不改保护目录、共享工具、Git 分支或发布运行服务。
已读取 frontend 全部规范及交付 Skill 两份参考。原型只约束交互，研究解析器不作为产品实现。开发新增截图再次触发导入上限，沿用上游的逐字节相同PNG别名机制；同一manifest已验证201项，不删独有图像或改历史回执。

## 里程碑与任务包

| 里程碑 | 结果/进入→退出 | 依赖 | 覆盖 | 状态 |
|---|---|---|---|---|
| M1 | 已接受设计→公开来源安全采集、可验证目录和只读路由 | 无 | AC-01/02/03/09，C-01/04 | Done（研发） |
| M2 | M1契约→用户主动加入、编辑、补空缺及完整撤销 | M1（可先用fixture） | AC-04..11，C-02/03 | Done（研发） |
| M3 | M1/M2→兼容证据、必需门禁、可复现交接 | M1/M2 | AC-10/12，C-05 | In Review（待独立QA） |

| 任务 | 负责人/方式 | 输入→产物 | 硬依赖 | 验证/状态 |
|---|---|---|---|---|
| T1 安全采集与运维 | development/TDD | C-01/04→collector、CLI、测试、运行报告 | 无 | 真源32条、策略/预算/身份/锁/原子/时钟夹具；Done |
| T2 同源分发与安装治理 | development/TDD | A-001/002→controller路由、安装器、说明 | T1 schema | HTTP读写/越界、plist、非安装测试；Done |
| T3 私人元信息和推荐 | development/TDD | 原型/C-02/03→app、单元与浏览器计划 | T1 schema | 原始字节/外部存储冲突/失败原子/核心旅程；Done |
| T4 兼容和交接 | development/Review | C-05→LLD、规范、发布声明、validation | T1..3 | 173动作、Python37/Node25、8项共享门禁与实际基线；In Review |

## 本轮QA返工（当前进度）

QA-100-01/02均由development修复：先保留原失败复现，再新增8项边界测试形成14个失败子项；修复真实发送限流和完整剩余预算，并追加保旧/锁/due、实际socket中断回归。当前Python47/Node25、10份真实浏览器208动作、真源32条与8项共享门禁重新通过，详见[返工验证](../../../05-validation/tasks/100/development-rework/README.md)。T1/T2/T3研发完成，T4仍In Review，待新的独立QA放行；旧M3/QA结论不沿用。未改上游目标、app/release、核心计划或保护配置；无新待用户回答问题。

任务事实源为本文件，README只是索引，不新增第二套看板。关键路径T1→T2/T3→T4；没有期限承诺。每项Done需代码、功能证据及本阶段门禁，M3只称研发就绪，不称QA放行。

## 可逆默认及风险

来源字段和来源事实必须验证，缺简介依据拒绝；不把HTTP成功当许可。正式安装/controller更新由Owner审查，development只用临时root。实际部署基线若不可读，契约C-05允许unknown声明，不能写none；具体AC-12证据缺口先核实。
公开目录独立缓存失败不阻书单，私人存储每次提交对照原字节检测跨标签变化。保留已有title/read和所有未知字段，无启动迁移。所有来源/方法/阶段归属沿用PRD的U/P/A，不降低AC。

## 交付自查

已按delivery-review-checklist及trellis-check核对：11R/12AC未删；任务有公开入口、证据位置和责任；跨层契约引用上游；无新增工具绑定/隐藏会话依赖。已更新前后端可执行规范。真实结果见[validation](../../../05-validation/tasks/100/validation.md)，运维/备份与恢复见[operations](operations.md)，不是QA放行结论。当前没有需要用户回答的问题。
