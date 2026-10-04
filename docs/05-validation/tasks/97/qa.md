# Issue #97 独立 QA：页面版本号显示

日期：2026-10-04（本轮工作区本地日期）。阶段：QA。结论：AC-01～06 全部通过，可交 report；不等于已创建 PR、合并或部署。Runner 授权自主推进，不代表用户逐项审查批准。当前没有需要用户回答的问题。

## 基线、范围和责任

- 用户明确要求：页面显示版本值 `0.1.0 rc2`。[PRD 与 AC](../../../04-implementation/tasks/97/prd.md)、[设计索引](../../../04-implementation/tasks/97/design/README.md)、[HLD](../../../01-architecture/tasks/97/hld.md)、[契约 C-01～05](../../../01-architecture/tasks/97/contracts.md)为放行依据。
- 页脚位置、原文保留、普通只读文本、320px/200%可读及无新增副作用为上游已接受的 Agent 推荐默认；既有业务、键盘/触屏及数据兼容为项目约束。未新增产品要求或专项阻塞门槛。
- 本轮重新核对实际实现与原型，不沿用 development 的通过结论。仓库基线为 `4a54b10f8acad8f74a167693194c397b93db9adc`；这是已测仓库 HEAD，不声明它是线上部署基线。
- 已读取项目入口和适用规范；仓库未配置单独 QA Skill，按当前 QA 指令及已配置 review 的 `trellis-check` 方法进行变更、规范、质量与跨层适用性核查。静态 HTML/CSS 单层变更，无新增后端、API 或跨层数据流。
- 产品修改仅 HTML 页脚与 CSS；业务 JS 与 HEAD 逐字节相同、原型业务 JS相同、诊断用产品快照三文件与实际产品逐字节相同。资源引用与 HEAD 相同，核心计划与 Owner 门禁计划逐字节相同。QA未修改产品、既有测试、Harness或保护配置，未执行Git写操作。

## 逐项验收

所有条款由 development 必需验证、QA 本轮独立复核；设计对呈现及方法负责。来源细分沿用契约 C-05。

| AC | 条款来源 | 本轮方法与实际结果 | 证据 | 结论 |
| --- | --- | --- | --- | --- |
| AC-01 | 用户版本值；Agent 推荐唯一页脚/保留原文/只读 | 产品浏览器精确可见文本；单节点计数；无需点击或悬停，滚动可读；桌面及320触屏截图检查原文与版本 | qa-1-2、3、5、8；Node版本契约测试 | Passed |
| AC-02 | Agent 推荐状态独立；既有筛选/错误/刷新约束 | 空清单、已读/未读混合、三筛选、筛选无结果、刷新、添加保存失败及重试；加载异常后空态与恢复；版本值不变 | qa-1-2、3、5、7 | Passed |
| AC-03 | Agent 推荐320px/200%可读及无新增溢出 | 原生100%/200%四组视口；Range与滚动后的上下左右边界、中心点遮挡检查、main/footer非重叠、旧页脚基线文档宽对比；30本长清单滚动可读 | qa-1-4、5、6、8；下表几何 | Passed |
| AC-04 | Agent 推荐普通文本/无新增焦点；项目键盘/触屏约束 | 10份真实AX树标签和值同一非ignored paragraph祖先；无新增focus节点；Tab/Enter操作筛选与改名；hasTouch/isMobile均true的320px上下文实际tap新增、状态、筛选、刷新 | qa-1-2、3、4、6；qa-evidence.json | Passed |
| AC-05 | 项目兼容/错误恢复；Agent 推荐原始值及零写 | 实际app预置30本中文/已读未读/扩展字段/缩进空白共3570字符；仅打开、查看、筛选及刷新保持原始存储且零新增setItem；非法JSON加载仍保留原值，恢复预置后加载正确；保存失败提示与重试不变 | qa-1-2、5、7；共享零写断言 | Passed |
| AC-06 | 项目既有主线；Agent 推荐无新增网络 | 原样核心旅程及专项覆盖添加、已读、三筛选、刷新、改名、删除、撤销；仅读取版本观察无fetch/XHR，产品资源引用及业务JS与HEAD相同 | qa-1-1、2、5、8；源码哈希审计与verify | Passed |

## 本轮真实浏览器记录

通过注册 `check` 执行，不在shell启动浏览器。每份独立上下文重新加载；以下均 `passed=true`、errors为空、failure=null，执行动作数与executed-plan一致。

| 回执 | root / plan | 动作 | 覆盖 |
| --- | --- | --- | --- |
| [qa-1-1](browser/qa-1-1/browser.json) | app / tests/browser/core.json | 16 | 原样主线 |
| [qa-1-2](browser/qa-1-2/browser.json) | app / browser-plan.json | 64 | 版本状态、保存失败/重试、改名/撤销、键盘、320/1440 |
| [qa-1-3](browser/qa-1-3/browser.json) | app / browser-touch.json | 20 | 真实触屏能力上下文与tap |
| [qa-1-4](browser/qa-1-4/browser.json) | app / browser-layout-regression.json | 26 | 四组原生缩放、无新增溢出/遮挡、8份AX、零写 |
| [qa-1-5](browser/qa-1-5/browser.json) | app / qa-data-plan.json | 36 | QA自编实际产品旧数据、30本长清单、非法JSON/恢复、原始值与零写、网络观察 |
| [qa-1-6](browser/qa-1-6/browser.json) | app / browser-native-capabilities.json | 8 | 原样native计划、2份AX |
| [qa-1-7](browser/qa-1-7/browser.json) | prototype / browser-fixture.json | 25 | 经字节核对的产品快照中文旧数据/扩展字段/空白/异常恢复；CSS倍率仅补充模拟 |
| [qa-1-8](browser/qa-1-8/browser.json) | app / qa-readable-plan.json | 10 | QA补充四组原生缩放后滚动与中心点遮挡、网络观察 |

共8计划205动作。业务和QA预置写入不冒充零写：qa-1-1总写4、qa-1-2总写8、qa-1-3总写2；qa-1-5总写3为三次QA故障/恢复预置，qa-1-7总写3为fixture控制；各快照后的只读区间按原始共享断言均零写。qa-1-4/6/8总写0。

### 原生缩放与可读性

| 窗口宽 / 原生倍率 | 实际CSS视口 | 版本文字水平边界 | 滚动后垂直边界 / 视口高 | 产品/基线文档宽 |
| --- | --- | --- | --- | --- |
| 1440 / 1 | 1440 | 679.1875～760.796875 | 789.34375～809.34375 / 844 | 1440 / 1440 |
| 1440 / 2 | 720 | 319.1953125～400.796875 | 367.5546875～387.5546875 / 422 | 720 / 720 |
| 320 / 1 | 320 | 119.1875～200.796875 | 788.703125～808.703125 / 844 | 320 / 320 |
| 320 / 2 | 160 | 39.1953125～120.796875 | 367.71875～387.71875 / 422 | 320 / 320 |

200%实际倍率为2、DPR为2，非CSS模拟。页脚在160 CSS px时范围0～160；版本文字完整且中心点未被覆盖。既有body min-width:320px使160 CSS px时整体页面仍宽320；产品与HEAD页脚基线相同，没有新增横向溢出，不声称修复旧业务布局。

### 截图与AX

- 已打开检查[桌面业务及页脚](browser/qa-1-2/screenshot.png)、[320px触屏页面](browser/qa-1-3/screenshot.png)、[手机补充截图](browser/qa-1-3/mobile.png)、[30本长清单完整页面](browser/qa-1-5/screenshot.png)。这些截图包含页脚原文及正确版本；mobile.png自动补充截图不是证明touch的依据，真实touch看qa-1-3 device和tap回执。
- 原生缩放截图见[桌面200%](browser/qa-1-8/zoom-4.png)、[320窗口200%](browser/qa-1-8/zoom-9.png)。zoom动作截图在滚动检查前，不能单独证明底部版本；版本可读性由之后真实Range、上下边界、遮挡与AX提供。
- [320窗口200%的AX树](browser/qa-1-4/accessibility-22.json)及其余9份AX在qa-evidence索引：标签StaticText与值StaticText共享paragraph祖先，值可经generic span节点到该paragraph。不把树当作人工朗读或屏幕阅读器语音实测。

## 质量、兼容与复现

- 本轮亲自调用注册 `verify` 返回 `Product checks passed`；[checks.json](delivery-checks/checks.json)8项exit0：diff、Prettier、ESLint、JS语法、core、feature、[Node 16项](delivery-checks/check-6.log)、[Python部署8项](delivery-checks/check-7.log)。门禁日志为本轮重新运行，不引用研发自测替代QA。
- [QA字节/回执/AX审计](qa-evidence.json)由 `node docs/05-validation/tasks/97/qa-audit.cjs`产生：当前三文件哈希、仓库基线、产品快照相同、原资源引用相同、原样core、8计划完整动作、10AX共同paragraph与8gate。
- release的data_change=none、compatible_from=已测HEAD；app_sha256与当前实际文件按既有算法计算相符，无JS/存储结构变化或数据转换/删除。没有修改release，也未执行发布。
- 标准复现：在注册check以app root运行上述计划；预置/故障仅发生在隔离测试上下文。qa-data-plan先以qa-seed设置旧JSON，快照→刷新→筛选→只读断言→非法JSON→快照/刷新→恢复→只读断言。qa-readable-plan以原生zoom后qa-inspect滚动和DOM命中检查；基线脚本临时还原旧footer后恢复，不写持久数据。

## 环境事件、保留证据与未测边界

- qa-readable首次调用返回 `Workspace exceeds import limit`，没有浏览器回执或已执行动作；记录为环境失败，未计入205通过动作，不归因产品或退回研发。
- 自主采用可逆的证据去重恢复：当前QA及development-1-17～24截图中23个完全相同PNG别名释放2,566,798字节，保留原始PNG字节/像素及全部browser.json。映射和SHA256见[qa-image-aliases.json](qa-image-aliases.json)，[恢复日志](qa-import-recovery.log)，工具为[qa-deduplicate.cjs](qa-deduplicate.cjs)。映射的历史PNG路径需按retained打开，或 `node docs/05-validation/tasks/97/qa-deduplicate.cjs restore <映射中的原路径>`逐字节恢复；`verify`验证所有23映射。原development更早截图的gzip归档仍沿用[旧manifest](browser-archive/manifest.json)。本轮qa-1-2/3/5展示截图保留展开。恢复后同一qa-readable计划成功，未修改公共工具限额或产品。
- QA审计首次误以为版本标签和值必须同一直接父节点，实际AX的span产生generic中间节点；依据真实AX链修正任务级审计为契约要求的同一paragraph祖先并通过。不是产品缺陷，不调整AC或共享门禁。
- 登录/错误凭据/退出/未登录权限：不适用。已核对实际app.js、HTML和项目现状，无账号、登录、服务端或权限路由；不虚构账号或登录通过证据。
- 未测：物理手机、Safari/Firefox、人工屏幕阅读器语音、真实线上部署/缓存升级、额外性能/安全专项。上述未被承诺为本任务必需专项，不升级为阻塞，也不写成通过。
- 非阻断风险：页脚需要正常滚动才能发现；版本由维护者手工更新，未来可能陈旧；160 CSS px旧业务布局的既有溢出未改。无已证实产品缺陷、无当前环境阻塞，无REQUIRED/BLOCKER。

## 本轮产物与交接

新增QA报告、qa-data/qa-readable计划、qa-seed/qa-corrupt/qa-inspect浏览器脚本、qa-audit及qa-evidence、截图去重映射/恢复工具/日志；生成8套QA浏览器回执、执行计划、截图及10份AX。复用PRD、设计、契约、产品、既有core/专项/native/fixture计划和baseline/layout脚本，重新生成共享verify证据。未编辑任何产品实现或既有测试。

全部已接受必需检查通过，依据Runner自主推进策略自动交 `report`，不追加形式审批；工具成功前不声称交接完成。最终PR合并与高风险部署仍由人授权。
