> 首轮历史存档，非当前放行结论。原 delivery-checks 日志后来由平台维护者宿主机成功回执覆盖；当前结论见同目录 validation.md，宿主机恢复回执已保存于 host-checks-before-resume/。本文所列 EPERM 和 Partial 仅描述首轮状态。

# Issue #94 产品实现与验证

日期：2026-10-03。阶段：development。状态：**实现已形成，Blocked by Validation，未交接 QA**。依据 Runner 自主策略完成可逆实现与可用检查，无人工逐项审批声明。原型结果不代替本报告的产品结果。

## 可运行成果与变更

打开 `app/index.html`，或在允许监听的本地环境运行 `python3 -m http.server 8080 --directory app`。产品三个原按钮内增加补充视觉提示：全部→显示所有书籍，未读→只显示未读书籍，已读→只显示已读书籍。浮层在按钮上方，CSS 仅在 hover+fine 环境显示；Escape 抑制当前提示，离开重置。原按钮标签、顺序、焦点、aria-pressed 和点击业务逻辑保持。

- 新建：`docs/01-architecture/tasks/94/lld.md`、任务 `implement.md`、本报告、三份新增产品浏览器计划、`audit-baseline.cjs`/`baseline-audit.json`、`tests/filter-tooltip.test.cjs`、`.trellis/spec/frontend/filter-tooltips.md`、本轮验证日志及 `browser/development-1-1..9/`。
- 更新：`app/index.html`、`app/styles.css`、`app/app.js`、`tests/undo.test.cjs`（仅补 document.addEventListener 模拟）、`.trellis/spec/frontend/index.md`、任务/项目索引、`deploy/release.json`。
- 复用不改：PRD、设计/原型、HLD/页面契约/决策台账；`tests/browser/core.json` 与 Owner `.harness/reading-core.json` 字节一致；#71/#82 下列既有计划。未改受保护工具/配置、Python 产品代码、分支/提交/推送，不调用 GitHub，不发布、不创建 PR。
- 无交互/数据设计偏差。发布声明 data_change=none 是兼容性判断，不是验收或发布授权；compatible_from 为已审计仓库基线 `82ec5a7653d57939df276058b7cbf465bfe8c90c`，没有声称验证当前部署版本。

## 真实执行结果

### 功能与静态检查

| 检查 | 真实结果/证据 |
|---|---|
| `node --test tests/*.test.cjs` | 最终 13/13 PASS；[完整输出](unit-tests.log)。新增4项覆盖抑制/复位、不消费键盘、三筛选×三入口内存及零写入、中文旧 JSON 扩展字段与静态契约；既有9项撤销单元继续通过 |
| `node audit-baseline.cjs`（从仓库根使用完整路径） | PASS；[脚本](audit-baseline.cjs)、[结果](baseline-audit.json)。剥离新监听后 app.js 与明确基线逐字相同，剥离提示样式后 CSS 逐字相同，HTML 去掉三 span 并规范空白后相同；不是浏览器几何测量 |
| Runner 共享 verify `--fix` | 退出0，Prettier 与 ESLint 自动修复完成；HTML 长行格式化后调整了测试对空白的断言，没有修改产品行为 |
| Runner 共享最终 verify | **退出1**；diff/Prettier/ESLint/JS语法前4检查通过，浏览器第5检查监听127.0.0.1时报 `listen EPERM: operation not permitted`；feature 子检查未执行。[日志目录](delivery-checks/)；不得写整条命令通过 |
| `python3 -m unittest discover -s tests -p '*_test.py'` | **套件FAIL**，8项运行、1项监听权限 ERROR；[完整输出](local-deploy-tests.log)。失败是已有部署服务器测试无法绑定端口，非产品 Python 修改，不更改测试/保护工具绕过 |
| `git diff --check` | 退出0 |
| Type-check | 不适用：静态原生 JavaScript，无 TypeScript 或新增类型构建；不新增工具链 |

首次单元运行有2项因测试误写 `visibleBooks` 而失败，改为实际 `getVisibleBooks` 后通过；格式化后有1项因 span 空白断言过严而失败，[保留输出](unit-tests-format-failure.log)，改为提取并 trim 固定文本后13/13通过。均为测试实现问题，不宣称最初通过。

### 注册 check（全部 root=app）

实际9次调用，7份最终计划 **291动作通过**，1份早期成功计划被补充键盘全范围检查后取代，1次定位错误失败保留。每个目录含完整 browser.json、screenshot.png、mobile.png；本次证据都在真实产品运行，不使用原型夹具或产品调试接口。

| 目录（browser/下） | 计划 | 结果/作用 |
|---|---|---|
| development-1-1 | browser-plan.json 早期64动作 | PASS；后续1-6追加全部按钮键盘激活，1-1不是最终计划字节匹配证据 |
| development-1-2 | tests/browser/core.json，16动作 | PASS；原增书、标记、刷新、筛选、删除主线 |
| development-1-3 | browser-states.json 早期版本 | **FAIL**；撤销按钮实际名称含书名，精确名“撤销删除”定位失败。原始结果保留，计划修正为“撤销删除《改名后的书》”后1-7通过；不修改产品 |
| development-1-4 | #82/browser-plan.json，75动作 | PASS；顺序/隐藏恢复/最新删除、编辑与新增草稿、焦点/键盘、刷新失效回归 |
| development-1-5 | #71/browser-keyboard-plan.json，29动作 | PASS；真实Tab/Enter、保存、校验、取消、Escape回归 |
| development-1-6 | browser-plan.json，67动作 | PASS；三条提示实际可见、Escape隐藏、离开旧入口隐藏/再进入恢复、空清单、混合筛选、存储快照与禁止写入、刷新、三范围Tab/Enter/Space、320px |
| development-1-7 | browser-states.json，26动作 | PASS；两种无匹配、提示、改名Escape取消与保存、删除/撤销/刷新 |
| development-1-8 | #82/product-storage-failure-plan.json，69动作 | PASS；实际存储失败/快照/重试、删除及撤销原错误路径 |
| development-1-9 | browser-desktop.json，9动作 | PASS；桌面三条可见提示和已读无匹配 |

已查看 [1440px产品提示](browser/development-1-9/screenshot.png)、[320px产品提示](browser/development-1-6/screenshot.png)、[390px产品截图](browser/development-1-6/mobile.png)、[改名撤销后桌面](browser/development-1-7/screenshot.png)。提示在按钮上方，320px截图内提示右边缘未越过屏幕，原布局无肉眼新增排布问题。390px截图保留相同鼠标位置后可悬停另一个按钮（选中已读、提示未读），这是桌面上下文缩放后的指针位置，不是触屏结果。不从截图推导 scrollWidth、完整几何不变或跨引擎兼容。

## AC逐项追踪与证据边界

| AC | 产品证据 | 状态及尚缺内容 |
|---|---|---|
| AC-01 | 1-6/1-9三条可见、Escape与离开/再入；静态规则 | **Partial**：click带真实移动/激活，未单独验证不点击停留；不能用 span 属性存在替代可见性 |
| AC-02 | 三范围点击、原选中业务函数逐字相同；单元三范围×三入口状态/书籍一致 | **Partial**：真实浏览器纯hover的3×3选中/非选中矩阵未执行；不能把模拟 matches 当真实鼠标 |
| AC-03 | 1-6空清单三提示、1-7两类无匹配固定文案 | **Partial**：无匹配状态保持不变时纯hover三个入口未实测（点击另入口会正常改变筛选） |
| AC-04 | 1-6/1-9实际320/1440截图，原CSS/HTML结构审计 | **Partial**：未完成基线与产品 DOM 几何对比或自动 scrollWidth 断言；不以原型或源码一致代替测量 |
| AC-05 | 1-6真实混合状态筛选列表正确，1-2核心回归，原处理器不改 | **Partial**：点击筛选通过；单纯hover期间列表不变的真实浏览器观测仍缺 |
| AC-06 | 1-6三范围键盘激活、精确原按钮名；1-5编辑键盘回归 | **Partial**：无hover触屏一次激活未测；320/390缩放不算触屏；原名称的role定位通过不等于屏幕阅读器朗读 |
| AC-07 | 产品存储 snapshot/unchanged/禁写筛选/刷新；单元旧JSON中文扩展字段、零写入；核心/#71/#82通过 | **Partial**：真实旧字段夹具与纯hover实际键原值/写次数观测未测；同值写入不能由快照单独排除 |

## 当前阻塞与恢复入口

这是验证能力/环境缺口，不是目标冲突、上游方向变化或 P0 数据风险；不要求用户重新确认已接受方案。注册 check 的公开动作只有 fill/click/visible/absent/reload/viewport/key/存储/下载，没有独立 hover、指针坐标移动、触屏上下文、跨引擎或 DOM 几何观测。沙箱拒绝本机端口监听，且不能请求 sandbox 升权。未自行启动 Chromium/任意JS浏览器执行器、植入产品观测脚本、修改保护工具或把点击证据伪装为纯hover。

恢复需要 Runner 提供受控真实浏览器 hover/移入浮层/触屏能力及几何/存储写计数观测，或有记录的人工实测证据；再运行以下场景并补全部 AC：

1. 混合清单每个选中范围下，鼠标只进入每个入口、不点击并停留，三条提示正确、选中/list/实际产品键原值及写次数不变；空清单/两类无匹配同理。
2. 移入上方连续浮层保持可读，离开后隐藏；Escape后移出再入恢复。已完成的Escape点击路径不代替该指针路径。
3. 真实 hover:none/coarse 触屏一次点击筛选且无粘住提示；跨引擎记录实际支持，不虚报 Firefox/Safari。朗读实测为补充边界，不预设合规。
4. 相同数据/尺寸下对明确基线与本轮产品测按钮/列表几何及页面横向溢出；实际旧JSON含扩展字段核对原始值和 setItem 次数。
5. 在 Runner 允许端口的环境复验共享最终 verify 与部署 Python 套件，保留当前失败日志。无需修改产品设计。

检查通过后 T2/T3 转 In Review、里程碑 Ready for Review，依据自主策略展示证据并调用 submit_handoff(target_stage=qa)，不再问形式审批。目前未达到就绪条件，**本轮未调用交接工具、未启动 QA**，没有 run_id。不为补缺口而退回已接受设计，不扩大原需求。

## 自查

已按 Trellis 核对：变更只在单层静态 UI，不增加跨层数据流/新依赖/调试输出；新增函数行为有单元，旧测试未降低断言；CSS/DOM/Escape契约与批准原型一致；规范、LLD、计划、验证和发布声明一致。交付清单结论 **Blocked by Validation**，不是全部 AC 通过、G3 READY、QA通过或发布完成。
