# Issue #71 研发交付计划

基线：已批准 PRD v1、design/README.md、HLD、contracts 和 A-001～003；本轮由 development Agent 领取。不重复审批。任务状态以本文件为事实源，README 只提供入口。

## 目标与变更边界

现状缺口在 `app/app.js` 的条目创建和写入操作：没有改名入口，旧写入先修改内存。最小实现是在现有原生 DOM 产品内增加单条编辑草稿、原位表单、校验与候选先写后提交；协调新增、标记和删除仅为保持草稿与已保存清单一致。必要文件：app.js 行为、index.html 状态播报、styles.css 批准布局；本任务 LLD、可复现测试、验收计划和报告；Trellis 记录可执行约束。禁止修改共享 Harness、工作流、Git 操作；无框架、后台、持久 ID、数据迁移、原型演示数据或故障开关进入产品。

## 里程碑与关键路径

| ID / 可观察结果 | 进入条件 | 退出条件与证据 | 依赖 | 状态 |
|---|---|---|---|---|
| M01 原条目可保存、取消及修正错误 | 批准设计与 LLD 就绪 | AC-01～04/07；产品路径与测试通过 | G2 | Accepted（本阶段自动验证） |
| M02 旧清单和全部管理动作兼容 | M01 可运行 | AC-05/06/08～10/13；fixture 深比较、实际存储失败恢复、固定 reading-core | M01 | Accepted（本阶段自动验证） |
| M03 桌面手机可操作且交付可复验 | M02 可运行 | AC-11/12、格式/lint、所有证据及限制准确归因；Runner 复验输入完整 | M02 | Ready for Review（AC-12仍Partial；用户授权草稿PR交接，非完整验收） |

关键路径：T01→T02→T03→Runner 复验；无日历承诺、无并行 Agent。代码与测试触及相同 DOM/数据责任，单人串行避免冲突；测试设计可从批准契约提前准备，无其他软依赖。

## 任务包

### T01 原条目修改闭环
- 状态：Done；里程碑 M01；优先级 Critical；负责人 development Agent；执行类型 SDD + 功能回归；评审人为本阶段自查，Runner 独立复验。
- 权威输入：prd.md AC-01～04/07、design/interaction.md、prototype/、HLD、contracts、[LLD](../../../01-architecture/tasks/71/lld.md)。硬依赖 G2，现已满足。
- 范围/交付物：app/ 三文件；保存、取消、条目错误、键盘/组合事件门控。不做非目标功能。
- 验证契约：原应用无需构建；Node 语法检查；注册 check 执行 browser-plan.json 和本任务测试夹具。成功须只变更目标 title，失败和取消不写草稿；完整证据在 validation.md。

### T02 清单兼容与失败恢复
- 状态：Done；里程碑 M02；优先级 High；负责人 development Agent；执行类型 Validation + 必要局部修复；评审同 T01。硬依赖 T01 已满足。
- 权威输入：PRD AC-05/06/08～10/13、contracts §1～5、LLD；冲突范围 app.js 与 T01 相同，不并行改动。
- 交付物：本任务浏览器测试夹具、旧 fixture、故障快照断言、reading-core 实际报告。
- 验证契约：注册浏览器内执行真实 localStorage，临时注入 setItem 抛错并恢复；比较整个 JSON、内存/视图、顺序/扩展字段；测试标记替换后重绑、删除另一书后关联不漂移。成功须旧数据无迁移、草稿不混入其他写入。

### T03 响应式与可访问交付证据
- 状态：In Review；里程碑 M03；优先级 High；负责人 development Agent；执行类型 Validation / Review；硬依赖 T02 已满足。权威输入 AC-11/12、批准原型与交互/焦点契约。真实系统IME/读屏器人工证据仍待验收，不将本任务标为Done；用户明确授权带此缺口交付待审查草稿PR。
- 交付物：指定 browser-plan.json、validation.md、浏览器报告和截图清单、代码规范更新、索引。
- 验证契约：320/1280px 产品路径、长名布局测量、Tab/Enter/Escape、组合事件测试与 ARIA 语义；真实系统输入法/屏幕阅读器实测与合成事件不可混淆。运行用户提供共享 fix/最终复验命令；失败项修复后重跑。交付不是上线/合并。

## 计划审查

已按 Skill delivery-review-checklist 自查：13 AC 全覆盖、复用项目任务路径、依赖无环、未将批准决策留给编码、无重复台账；真实浏览器工具已挂载。结论 Ready for Dispatch。OS 输入法/屏幕阅读器不在工具动作能力中；先完成自动证据，最终如实说明实测边界，不将模拟说成真实人工验收。

## 公共进度与交接

当前 Ready for Review：T01/T02 Done，T03 In Review，下一批没有未实现功能任务。实施结果：产品三文件与LLD已完成，先写后提交、单草稿、引用重绑、旧格式兼容均通过18组真实浏览器集成断言；正式产品62动作、键盘29动作、固定主线16动作通过。没有产品/架构偏差。详细结果、用户交接授权及证据以 [validation.md](../../../05-validation/tasks/71/validation.md) 为准，不复制第二套结论。

未闭合项：AC-12系统IME/真实读屏人工证据、Runner完整共享verify；CLI浏览器listen被沙箱EPERM拒绝，同一计划已由注册工具通过。不得称M03/G4 Accepted或完整验收通过。用户明确本轮目标为待审查草稿PR/流水线验证，授权立即通过注册submit_handoff交Runner正式复验、提交任务分支和创建草稿PR；AC-12保持Partial/待人工验收，不因该保留项反复自查或等待重复确认。交接与后续发布仅按工具实际返回报告；Agent不执行Git提交/发布/合并。
