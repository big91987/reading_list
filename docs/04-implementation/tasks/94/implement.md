# Issue #94 实施计划与公共任务状态

2026-10-03；development 独立执行。输入 [PRD](prd.md)、[设计索引](design/README.md)、[HLD](../../../01-architecture/tasks/94/hld.md)、[契约](../../../01-architecture/tasks/94/contracts.md)、[LLD](../../../01-architecture/tasks/94/lld.md)。原型仅作批准交互参照，不移入隔离存储键/demo。Runner 自主策略允许低风险可逆选择和通过检查后自动交 QA，不表示用户逐项审批。

## 里程碑与任务包（唯一状态事实源）

| 里程碑 | 进入/退出条件 | 硬依赖 | 状态 |
|---|---|---|---|
| M1 三入口可解释且保留行为 | 已接受设计；实现与单元/结构检查存在 | 无 | Ready for Review |
| M2 产品关键旅程与提示有验证证据 | M1；功能、格式/lint、注册浏览器与全部 AC 核验 | M1 | Ready for Review |
| M3 可交独立 QA | M2 所需检查通过；证据/发布声明/索引一致 | M2 | Ready for Review |

| 任务 | Owner/类型/优先级 | 硬依赖/冲突范围 | 状态 | 输出及验收契约 |
|---|---|---|---|---|
| T1 三入口静态提示及退出 | development / SDD / Critical | 设计；app 三文件串行 | In Review | app、LLD；AC01–06实现及单元已形成，原点击逻辑不变；完整AC由T2验证 |
| T2 功能与回归证据 | development / Validation / Critical | T1；tests | In Review | 宿主机13项Node及8项Python、8项gate全通过；本轮正式MCP16计划851动作，纯hover/触屏模拟/几何及零写补齐，AC01–07当前研发PASS（范围见报告） |
| T3 交接就绪核验 | development / Review / High | T2；文档/release | In Review | validation、规范、索引、发布声明与完整证据一致，自主交独立QA就绪；实际交接以工具回执为准，最终合并/高风险部署仍人工授权 |

关键路径 T1→T2→T3已达到研发交接门槛；无软依赖，无多 Agent 分工，不创建并行事实源。开始基线 HEAD `82ec5a7653d57939df276058b7cbf465bfe8c90c`，旧 app 保留于 Git 只读历史，业务/布局规则已审计。当前无阻塞或额外 Ready 实现任务；下一步自主调用工具交独立QA，执行结果以回执为准。QA 前任务最多 In Review、里程碑最多 Ready for Review。2026-10-03当前范围/证据见 [validation](../../../05-validation/tasks/94/validation.md)，无设计偏差/上游返工需求。

## 验证与风险

运行 `python3 -m http.server 8080 --directory app` 后打开本地产品（环境需允许端口监听）；也可打开 app/index.html。功能测试 `node --test tests/*.test.cjs`；注册 check root=app，核心 tests/browser/core.json，新增功能 docs/05-validation/tasks/94/browser-plan.json。共享 verify --fix 和最终 verify 按 Runner 提供命令运行，真实结果见 validation。不得修改受保护配置或工具以绕过检查。

首轮缺少hover/指针/触屏上下文，受限shell端口EPERM，曾如实Blocked by Validation；历史报告与失败回执保留。平台维护者修复正式工具后，当前同名check支持hover/pointer/tap/device及几何/存储写观察，本轮实测补齐；宿主机8项gate全部成功，EPERM不再是当前结论。未从受限shell重启浏览器/绑定端口；最终宿主机gate按当前计划由Stop Hook和交接Runner执行。Chromium触屏模拟不冒充物理手机，跨引擎/屏幕朗读为明确未测边界，不重复询问产品方向。

## 计划自查

按交付清单核对：R01–04、AC01–07 各有 T1/T2 覆盖；唯一权威输入，依赖无环，共享文件串行，无私有会话进入仓库；可执行命令、历史失败和当前成功证据/支持边界均保留。恢复后的当前结论Ready for independent QA（独立评审尚待）；依据Runner自主策略和用户继续验证后交QA请求，完成证据后自动交接，无形式审批或伪造批准。
