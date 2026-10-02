# Issue #82 实施与公共交付计划

2026-10-02 · development · Verifying / Ready for Review。权威输入为批准的 [PRD](prd.md)、[设计索引](design/README.md)、[契约](../../../01-architecture/tasks/82/contracts.md)，不重新审批上游决定。实现和自测完成；用户已检查产品并明确授权工具交给独立QA，仅QA验收，不创建PR、不合并。共享verify整条命令受沙箱端口限制，不能称为全部门禁通过；交接结果以工具回执为准。

## 范围与准备检查

当前差距是 app 删除成功后只有一般反馈，没有恢复入口。状态及事件位于 app/app.js；新增独立栏需 app/index.html 与 app/styles.css。保留原新增、编辑、阅读、筛选、JSON格式及持久化提交顺序；不复制原型实现/诊断、不新增账号、后端、历史栈、依赖或迁移。G2 已批准，现有 persist 和正式 browser check 可用，无阻塞。

## 里程碑与关键路径

| ID | 可观察结果 | 进入条件 | 退出证据 | 依赖 | 状态 |
|---|---|---|---|---|---|
| M1 | 可删除并恢复最近一本书 | 批准基线/LLD | 功能、原序位和同名拒绝 | 无 | Ready for Review |
| M2 | 失败可重试且原有操作不回归 | M1实现 | 产品核心/功能/故障/键盘与窄屏浏览器证据 | M1 | Ready for Review |
| M3 | 可交独立QA审查 | M2证据 | 质量检查、AC追溯、用户交接授权 | M2 | Ready for Review；已授权QA，Runner完整门禁仍待复验 |

关键路径 T1→T2→T3；单 Agent 独立执行，不启动子 Agent。共享 app 文件有写冲突，串行实现。风险是草稿引用/焦点重绘、隐藏冲突和失败提前消费机会，均以批准契约及真实产品操作覆盖。

## 任务包（唯一状态事实源）

| ID | 结果/交付物 | Owner / 类型 / 优先级 | 硬依赖 | 状态 | 验收与验证契约 |
|---|---|---|---|---|---|
| T1 | app三文件实现、LLD | development / SDD / Critical | 批准设计 | In Review | AC01–07、10–11；仅最近成功删除，完整序位恢复，保留草稿/筛选；check app真实UI |
| T2 | 产品浏览器计划及证据 | development / Validation / Critical | T1实现 | In Review | AC08–09、12–14；正式storage_write_failure及存储快照、桌面/320px、键盘、核心回归；失败修复后复验 |
| T3 | 规范/索引/validation与交接集 | development / Review / High | T2证据 | In Review | --fix成功，verify前4项通过、浏览器子进程EPERM；注册check通过；独立QA和Runner仍需复验 |

软依赖无。实际实现/偏差/最新验证写入 validation.md；T1–T3在独立QA评审前最多 In Review，里程碑最多 Ready for Review，不冒称独立QA通过或已发布。

## 复现与交接

运行 `python3 -m http.server 8080 --directory app` 打开本地产品（需允许监听本机端口的环境）；也可直接用浏览器打开 app/index.html。数据仅浏览器本地。正式检查调用注册 check(root="app", plan=项目相对计划路径)，本轮绝对root不匹配Owner注册故改用相对root。核心计划 tests/browser/core.json 原样复制Owner原动作/断言，功能计划 docs/05-validation/tasks/82/browser-plan.json，故障复用同目录 product-storage-failure-plan.json；完整计划/结果索引见 validation.md。共享质量入口沿用用户给出的 Runner verify 两条命令。用户明确确认后才通过 submit_handoff 启动QA，不操作Git发布。

## 实施结果与当前风险

T1完成内存单记录、原子候选提交、独立反馈栏、原序位/状态恢复、草稿和焦点；无批准行为偏差。T2的12份最终计划共517动作通过，9项独立单元通过，发现长名窄屏溢出后修复并保留原始证据。T3完成自查与索引，但共享verify的shell浏览器在监听127.0.0.1时报EPERM，Owner保护工具未改；Runner需在可运行环境复验。系统IME/屏幕阅读器朗读未实测。无下一批实现任务；用户已完成产品手动检查并授权独立QA，下一步通过工具交接，不预设结论，不发布PR或合并。具体证据、AC覆盖、用户反馈和授权范围见 validation.md。

## 计划自查

按交付Skill清单核对：14项AC均有任务、上游权威唯一、无重新产品决策、依赖无环、验证真实入口、无额外Harness建设需求、未完成/人工证据明确分开。结论 Ready for Dispatch。
