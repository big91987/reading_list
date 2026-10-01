# Issue #71 设计阶段验证证据

> 2026-10-02（本地 Asia/Shanghai）· 对象：独立设计原型，不是 app 产品验收。

## 方法与结果

通过已注册 `mcp__registered_browser_design.check` 运行项目内 JSON 数据计划，root 为 `docs/04-implementation/tasks/71/prototype`。没有在 shell 启动浏览器，没有任意 JS 注入计划。累计实际 8 次运行：7 组最终通过、1 次历史工具按键能力失败；7 组通过共 192 个动作，全部 errors=[]。无后台或 GPU，未声称相关验证。

| 计划 | 真实执行报告 | 结果／动作数 | 主要证据与截图 |
|---|---|---|---|
| check-desktop.json | [browser.json](browser/design-1-1/browser.json) | Pass / 34 | 1280px，三筛选、trim、DUNE、隐藏重名、取消、刷新；[桌面编辑](browser/design-1-1/screenshot.png)、[自动手机截图](browser/design-1-1/mobile.png) |
| check-mobile.json | [browser.json](browser/design-1-2/browser.json) | Pass / 33 | 320px 动作：失败保留、关闭故障后重试、刷新、换条／筛选、目标删除、长名；[320px编辑](browser/design-1-2/screenshot.png)、[自动手机截图](browser/design-1-2/mobile.png) |
| check-errors 初次 | [browser.json](browser/design-1-3/browser.json) | Fail / 11已完成 | 工具不支持 Escape；[失败现场](browser/design-1-3/screenshot.png)、[自动手机截图](browser/design-1-3/mobile.png)；不是页面 JS 错误 |
| check-errors 修正后 | [browser.json](browser/design-1-4/browser.json) | Pass / 21 | 同一工具，将不支持的 Escape 改为点击取消；80可保存、81拒绝、刷新草稿丢弃、空名；[320px错误及长名](browser/design-1-4/screenshot.png)、[自动手机截图](browser/design-1-4/mobile.png) |
| check-keyboard.json | [browser.json](browser/design-1-5/browser.json) | Pass / 30 | 用支持的 Tab/Enter 进入、保存、取消、错误修正，退出焦点可再次 Enter 编辑；[桌面结果](browser/design-1-5/screenshot.png)、[自动手机截图](browser/design-1-5/mobile.png) |
| check-coordination.json | [browser.json](browser/design-1-6/browser.json) | Pass / 32 | 320px 新增失败保留草稿、新增成功丢弃、标记移出未读结束编辑、删除其他书与刷新；[320px结果](browser/design-1-6/screenshot.png)、[自动手机截图](browser/design-1-6/mobile.png) |
| check-failure.json | [browser.json](browser/design-1-7/browser.json) | Pass / 7 | 本地写入入口主动抛错；[桌面写失败](browser/design-1-7/screenshot.png)、[自动手机截图](browser/design-1-7/mobile.png) |

| check-escape.json（本轮补测） | [browser.json](browser/design-1-8/browser.json) | Pass / 35 | 1280px草稿／空名失败后Escape取消、焦点回入口可Enter重进；320px写失败后Escape取消、刷新保持Dune与已读统计；[320px最终状态](browser/design-1-8/screenshot.png)、[自动手机截图](browser/design-1-8/mobile.png) |

测试计划原文件在 [原型索引](../../../04-implementation/tasks/71/prototype/README.md)。失败计划的旧状态由 design-1-3/performed 保存；当前 check-errors.json 是重跑后的版本。截图文件名 screenshot.png 表示计划最后视口：1-2、1-4、1-6、1-8 的 screenshot.png 是 320px，不应误称桌面截图。mobile.png 是工具额外生成的手机截图，不代表全流程在该额外视口重跑。

## 已查看的真实截图

已用 view_image 打开 design-1-1/screenshot.png、design-1-2/screenshot.png、design-1-4/screenshot.png、design-1-7/screenshot.png 和本轮 design-1-8/screenshot.png：分别核对桌面原位编辑、320px输入与常显操作、长名换行与空名错误、原型写失败反馈。显示沿用纸色和暖色，320px 截图中无可见横向裁切，输入、保存、取消、删除可见。此为截图观察，不是 DOM scrollWidth 数值断言或真实设备软键盘测试。

## 静态与跨文档检查

- `node --check docs/04-implementation/tasks/71/prototype/app.js` 成功：只证明语法，不证明行为。
- 原型引用本地 index/styles/app，零外部运行依赖；源文件和契约核对草稿不持久化、校验全清单、候选先写后提交、原生 label/alert/status、组合态保护。
- 首轮Node本地文档检查实际输出PASS：扫描44个文件，79个本地Markdown链接均存在，13项AC映射完整，18个设计／运行文件均在索引；六份计划与各最终通过报告逐动作deepEqual，共157动作；历史失败记录保留；文本无行尾空白。此历史检查不替代语义评审，本轮追加后的检查结果见下文。
- `git diff --check` 无输出、退出码 0，用于已跟踪差异；新建文件另外用上述文本检查。没有修改 app/ 或 Python 产品代码，不适用 Python quality 编辑后要求。

## 尚未证明、研发必须完成

1. 原型模拟开关是在写入入口抛错，没有令浏览器真实 quota 或 SecurityError 发生；研发应在产品 setItem 边界注入失败，深比较原内存、JSON、read、顺序、其他条目，确认失败后取消／重试行为。
2. 原型复用旧结构，但使用隔离演示键；不是修改前真实产品键或旧 fixture 的兼容测试。研发检查旧有效／重复／超长数据、原名保存、UTF-16 emoji边界和 target 关联重绑定。
3. 原型 Escape 已由修复后的注册 check 补跑通过；产品实现后仍须回归取消及焦点行为。中文 fill 不等同真实中文输入法组合确认；屏幕阅读器未运行。
4. 未完成真实设备软键盘、关闭浏览器、多浏览器覆盖、数值溢出断言；本轮布局用指定视口动作和截图验证，产品需按 AC-11/12 补齐。
5. 产品 `app/` 尚无编辑实现。本轮未运行正式产品固定 `.harness/reading-core.json`，也未声称 AC-01～13 全通过；研发对照批准设计执行全部 AC 与既有主线。

这些是有明确契约与验证责任的后续事项，不是静默缩减需求。G2 自查只检查设计完整性与一致性；用户明确设计批准已记录；追加 Escape 证据不改变设计，不需再次批准。实际交接结果以注册工具返回为准。

## 本轮追加与人工审查

用户明确报告已在真实网页操作空名、Escape取消、保存后刷新保留已读、失败恢复重试和320px布局，并审查HLD／contracts／G2，批准A-001～003全部推荐方案。该人工审查来自用户本人报告，未冒充Agent执行。共享检查器修复后，Agent通过注册check运行新增check-escape.json，35动作全部通过、errors=[]；查看design-1-8/screenshot.png确认已读筛选下Dune仍为已读且无编辑表单。保留历史Unsupported key失败，未修改检查器或原型行为，不需要重新审批设计。

追加后Node检查实际输出PASS：48个文件、85个本地链接、13项AC映射、19个索引内设计／运行文件；七份最终计划与真实报告逐动作一致，共192动作；三项决策为Accepted，无未回答项。node --check与git diff --check再次通过。该检查和审批同步只更新证据与状态，不改变设计行为。

交接传输补充：注册工具首次拒绝包含PNG的提交，约定只快照UTF-8文档。新增[screenshot-manifest.json](screenshot-manifest.json)，记录共享工作区16张原始PNG的实际路径、字节数及SHA-256；改交文本文件和校验索引，原始图片仍由研发在共享工作区直接访问。本补充仅解决传输格式，不改变设计或已有验证结果，也不宣称原始图片已被工具快照。
