# Issue #97 实施与公共任务计划

2026-10-04，本轮恢复复验，负责人：development Agent。输入为 [PRD](prd.md)、[设计索引](design/README.md)、[HLD](../../../01-architecture/tasks/97/hld.md)、[契约](../../../01-architecture/tasks/97/contracts.md)。Runner 自主推进是工作方式授权，不代表用户逐项审查。

## G2 与变更边界

已核对需求、原型、契约、现有 app 和共享检查入口，无方向性阻塞。原基线页脚缺版本标识，本轮实现静态标识，行为归属为静态 HTML/CSS。仅修改 app/index.html、app/styles.css；新增测试、任务 LLD、验证计划/记录及可维护规范，验证后更新 deploy/release.json。沿用现有目录，不另建 delivery 事实源。不改 JS、存储、API、工作流或 Harness；不复制原型演示控制。无重构。

## 里程碑与依赖

| ID | 可观察结果 | 进入/退出条件 | 依赖 | 证据 |
| --- | --- | --- | --- | --- |
| M01 | 页面可读出精确版本并保留原页脚 | G2就绪 / 静态契约及产品浏览器展示通过 | 无 | T01与验证报告 |
| M02 | 既有书单与数据不受影响 | M01完成 / 核心、专项、质量与兼容性检查通过 | M01 | T02与验证报告 |
| M03 | 独立QA可复现交付 | M02完成 / 证据索引与工具交接成功 | M02 | T03及真实工具回执 |

关键路径 T01 → T02 → T03，均为硬依赖；无软依赖、无并行写入冲突。不编造期限。当前总览由下表投影，独立QA验收及最终合并不属于development已完成结论。

## 可领取任务包与状态事实源

| ID | 结果/类型/优先级 | 负责人/状态 | 输入、写范围及非目标 | 验收/交接 |
| --- | --- | --- | --- | --- |
| T01 | 静态版本可见 / TDD / High | development / Done | PRD AC-01、C-01/02、LLD；app HTML/CSS、静态测试；不改JS | 单一值/语义/样式Node与产品浏览器通过；局部契约自查完成 |
| T02 | 数据及交互兼容 / Validation / High | development / Done（依赖T01已满足） | PRD AC-02～06、C-03/04；browser计划、证据、release声明；不改Harness | 本轮6份产品计划159动作通过，原样native及四组layout/AX、中文数据fixture/恢复通过；Node16、Python8与verify8项通过，release已按本轮证据更新 |
| T03 | 可复现QA交接 / Review / Normal | development / In Review（依赖T02已满足） | 本计划及验证报告；索引/规范；不创建PR或发布 | 交付自查完成，研发Ready for independent QA；本计划/LLD/报告/索引已同步，正式交接以submit_handoff回执为准 |

## 验证契约与风险

本地预览：`python3 -m http.server 8000 --directory app`；产品无构建依赖。Node：`node --test tests/*.test.cjs`；部署测试：`python3 -m unittest discover -s tests -p '*_test.py'`。运行Runner给出的共享fix/verify，并使用注册浏览器check执行 tests/browser/core.json 与 docs/05-validation/tasks/97/browser-plan.json。实际回执与截图索引见 [验证报告](../../../05-validation/tasks/97/validation.md)。

保存失败必须保留旧值并允许重试；只读区间断言原始字节及零写。原生200%及可访问树的工具能力需据真实结果说明，CSS模拟不替代原生证据。发现性与手工版本陈旧为非阻断设计风险；没有新增发布承诺。所有失败保留并修复或明确影响，不把静态检查作为浏览器/后端证明。

## 实施结果及恢复点

M01/M02研发Accepted，M03 Ready for independent QA，T03等待正式工具交接回执。旧工具阻断是历史，design恢复后本轮development已全量复验，不沿用之前放行结论。footer max-width:100vw为最小可逆修复，不改变body/main、书单逻辑或已接受AC。当前无待用户回答问题，依据Runner自主推进策略自动交独立QA，非用户逐项审查批准。历史返工及失败在验证报告引用保留；归档仅无损保存历史PNG以满足导入限额，不修改公共Harness。研发就绪不等于G4最终QA放行或部署授权，无Git写操作、PR或发布。
