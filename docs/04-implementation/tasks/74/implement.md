# Issue #74 研发交付计划

日期：2026-10-01（本轮研发记录；上游原日期保留）。负责人：development Agent；评审：本阶段自查、Runner正式复验、Owner最终人工验收。状态事实源为本文件，任务索引仅投影。

## 基线与里程碑

权威输入：[PRD](prd.md) AC-01～10、[设计索引](design/README.md)、[HLD](../../../01-architecture/tasks/74/hld.md)、[contracts](../../../01-architecture/tasks/74/contracts.md)、[LLD](../../../01-architecture/tasks/74/lld.md)。A-001已批准，无新决策；基线HEAD bff9bb10eafb548783c8cb7b8adb0cfb9b6f0a8c，分支codex/issue-74-platform；上游文档已在工作区未提交，保留。

M01：在原书单操作中可靠展示全量分类数量，达到可审查草稿交付。进入条件是需求/设计批准、真实原型和现有保存边界可复用，已满足。退出条件：三个产品文件最小实现，AC自动部分、Owner原主线、Issue71回归、格式/lint通过，人工缺口如实保留，临时夹具清理，Runner工具交接。M01当前Ready for Review；不等同最终验收或发布。

## 任务包与依赖

| 任务 | 结果/范围 | 状态 | 硬依赖 | 验证及交付 |
|---|---|---|---|---|
| T01 | 按批准原型展示派生计数；仅app三个文件、LLD | Done | A-001 | 产品计数/布局通过，自查无设计偏差 |
| T02 | 全量计数与旧操作、故障、刷新兼容证据 | Done | T01 | 28项计数+18项71集成通过，产品动作及回归详见validation |
| T03 | 规范同步、质量检查及可复验交付 | In Review | T02 | 静态检查通过，授权核心计划及功能计划注册浏览器通过，等待Runner独立正式门禁与工具交接 |

执行类型T01=SDD、T02=Validation、T03=Review；同一Agent串行负责，无多人分发或写入冲突。关键路径A-001→T01→T02→T03→Runner；不创建重复交付目录。人工触摸/读屏待验收为非阻塞缺口，Owner负责，不降低自动门槛。无后端/GPU/新接口、迁移、发布或主线合并任务。

## 验证契约与恢复

公共入口：注册浏览器check，root=app；新增计划 `docs/05-validation/tasks/74/browser-plan.json`，集成/键盘/回归计划与证据同目录。夹具准备/恢复命令见验证报告。共享质量命令使用用户提供的Runner verify.py --issue 74 --fix，然后不带--fix最终检查。node --check、git diff --check补充语法/空白检查。不改禁写目录，不操作Git分支/提交/推送/GitHub。

成功为动作通过且DOM/内存/存储和布局断言成立；失败修复并重跑，不用原型证据冒充产品。环境限制或人工证据缺失记录到validation，不虚构通过。

计划自查（delivery-review-checklist）：全部AC映射T01/T02，上游契约不下放决策；任务按可验证结果拆分，无循环依赖、平行事实源或无必要管理文档。结论Ready with Non-blocking Gaps（仅物理触摸/读屏人工证据）；实施状态和交接结果在检查后更新本文件。

## 当前交接事实

M01=Ready for Review，T01/T02功能证据已完成，T03=In Review；非产品或架构改变，无新批准请求。任务文件是当前状态事实源，里程碑未标Accepted或Delivered，等待Runner复验和Owner最终验收。实施无设计偏差：计数只在统一render添加，存储及原命令链路未修改；Owner固定计划精确名称与新显示契约冲突，是验证配置不兼容，不隐藏数字或改产品规避。

[验证报告](../../../05-validation/tasks/74/validation.md)和[完整文件集合](../../../05-validation/tasks/74/development-artifacts.md)供审查；28计数集成/18编辑集成、真实键盘和9视口、等价Owner旅程通过，静态格式/lint/语法通过。正式verify在本沙箱端口EPERM失败，不等同MCP失败；历史Owner旧定位超时且修改被保护拒绝已撤销。用户本轮明确告知verify.py已修复并授权迁移核心计划到tests/browser/core.json；研发核实新版优先级、迁移原16动作/断言并仅更新三个名称，18及功能19真实注册检查通过，无保护配置改动。正式门禁待Runner独立环境执行，无需用户再次批准产品。Runner负责任务分支提交/推送/草稿PR，Agent不操作。

交付自查结论Ready with Non-blocking Gaps（仅人工证据）；真实触摸/读屏人工证据仍为非阻塞待验收，未假称通过。下一批Ready是Runner正式环境独立复验及草稿PR；需求/设计无待回答问题。工具交接结果另记于validation，不用报告代替执行回执。
