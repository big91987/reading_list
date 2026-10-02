# Issue 76 研发交付计划

日期：2026-10-02。负责人：development Agent；评审：Agent 自查完成，Runner 复验、Owner 人工验收待完成。当前 Verifying / Ready for Review，G2 已批准，无需求或架构阻塞。

## 基线与变更边界

权威输入：[PRD](prd.md)、[批准设计索引](design/README.md)、[交互](design/interaction.md)、[HLD](../../../01-architecture/tasks/76/hld.md)、[契约](../../../01-architecture/tasks/76/contracts.md)、[LLD](../../../01-architecture/tasks/76/lld.md)。复用全部批准原型与 #71 的事务式管理逻辑。

差距在 app/ 单页呈现层：现有纵向列表未具备批准的侧栏、网格和有界反馈。修改 app/index.html（语义布局）、styles.css（批准视觉/断点）、app.js（卡片呈现、反馈、动画生命周期）；不改存储键、JSON、顺序或业务语义，不迁移、不加入演示按钮/数据、封面服务、搜索或后端。不修改受保护工作流/Harness，不操作 Git 写入。局部重绘仍沿用对象引用，以真实 DOM/Storage 快照回归证明行为未退化。

## 里程碑

| ID | 可观察结果 | 进入/退出条件 | 依赖 | 状态 |
|---|---|---|---|---|
| M1 | 已有清单以新书房布局管理 | 批准设计 → 完整数据与管理回归、四宽度可用 | G2 | Ready for Review；26组及四宽度通过 |
| M2 | 动效可打断且不影响提交 | M1 → 数量/时长上限、连续操作、降级与减少模式证据 | M1 | Ready for Review；受控证据通过，系统偏好/真机待验收 |
| M3 | 可复验的研发审查包 | M2 → 功能/格式检查、浏览器证据、已知人工缺口、注册交接 | M2 | Ready for Review；Runner共享门禁受本机沙箱限制，待重跑 |

## 任务包（本文件为状态事实源）

| ID | 结果 / 输入与输出 | AC | 依赖 / 冲突 | 状态 / 执行类型 |
|---|---|---|---|---|
| T1 | 原清单在新版布局无损管理；输入批准原型/契约，输出 app/、LLD、真实兼容快照 | 01–08、12–14 | G2；与 T2 共用 app.js，串行 | In Review；自动回归通过，真实IME/读屏待验收 |
| T2 | 反馈与动画取消可验证；输出运动生命周期与浏览器时序测试 | 09–11、13–14 | T1 硬依赖 | In Review；数量/时序/API通过，实际系统偏好/舒适度待验收 |
| T3 | 产品验收可复现；输出 tests/browser/core.json、本轮计划、集成夹具、报告截图、规范更新 | 01–16 | T1/T2 已实现后最终自动验收 | In Review；资料完成，Runner正式门禁/草稿PR待执行 |

关键路径：T1 → T2 → T3 → Runner。均由同一 development Agent 负责；无并行写入或委派。每任务完成需产物可定位、可执行检查和 AC 映射；无法自动证明的真机/IME/读屏/视觉舒适度明确留待人工，不将 Ready for Review 当 Accepted。

## 验证与风险

核心回归首次复制 .harness/reading-core.json 到 tests/browser/core.json，仅允许更新定位。新功能注册浏览器计划在 docs/05-validation/tasks/76/browser-plan.json；测试夹具通过真实产品 DOM 和 Storage，断言初开不写回、额外字段/历史长名、80/81、失败恢复、连续操作与降级。产品检查四宽度 320/390/768/1440、键盘路径、完整截图。共享 verify.py --fix 和最终 verify.py 均执行，不以原型结果代替产品证据。

存储写失败先保留内存/输入、再显示失败；动画独立不回写数据。实际系统偏好切换若注册工具不支持则报告能力缺口，合成事件不冒充真实系统测试。回退仅撤回表现代码、继续读取原 JSON，不清空数据。

计划按 delivery-review-checklist 自查：覆盖全部 PRD/原型/契约；无重复事实源、循环依赖或新架构决定；入口与失败证据明确。结论 Ready with Non-blocking Gaps（真实辅助技术和系统偏好证据能力须实测后记录）。无须用户重新回答已批准决定。

## 2026-10-02 执行结果与交接条件

无下一批待实现任务，无产品/架构决定待用户回答。实现、Agent代码自查、功能/格式/lint/语法、注册浏览器回归已完成，详见 [逐AC验证](../../../05-validation/tasks/76/validation.md)。LLD/规范/测试/证据同步，未改变批准设计。尚未全量Accepted：系统偏好真实切换、IME/读屏/真机、最终视觉舒适度留作人工验收；共享verify.py的shell浏览器因listen EPERM未执行，Runner应在允许端口绑定环境重跑再发布草稿PR。用户已授权带明确人工缺口交还Runner，不请求重复确认。

交接状态以注册submit_handoff回执为准；不能把资料就绪写为已发布或已合并。撤回表现代码可继续读取原JSON，无迁移/清理数据步骤。
