# Issue #74 设计验证

日期：2026-10-02。对象为独立原型 `docs/04-implementation/tasks/74/prototype/`，不是产品 app。通过注册 `check` 工具运行真实浏览器，没有在 shell 启动 Chromium。

## 最终结果

最终源文件快照下 8 份计划通过，共 222 个动作；每份结果 passed=true、errors=[]、failure=null。结果和截图分别在下表目录的 `browser.json`、`screenshot.png`、`mobile.png`。screenshot.png 使用计划结束时视口宽度，mobile.png 由检查器另外生成 390px 截图；不把文件名当作 320px 证据。

| 计划（prototype/ 下） | 结果目录（本目录 browser/ 下） | 动作数 | 覆盖 |
|---|---|---|---|
| check-flow.json | design-1-9 | 64 | 1280px 样例、分类不改数、双向状态移出分类、新增、删除两类、改名、刷新、零分类 |
| check-failure.json | design-1-10 | 43 | 320px 三种模拟保存失败不计数、恢复重试、刷新、空集合、零按钮可选 |
| check-layout.json | design-1-11 | 68 | 320/430/431/640/641/650/651/1280px 样例和全量四位数条目计数可见 |
| check-keyboard.json | design-1-12 | 21 | 原生 Tab/Enter/Space 三分类操作、正确列表、末尾320px焦点截图 |
| check-layout-states.json | design-1-13 | 6 | 空、样例、四位数紧凑状态面板，1280px桌面与390px手机截图 |
| check-states.json | design-1-14 | 8 | 删除保存失败后仍3/2/1，失败反馈截图 |
| check-empty.json | design-1-15 | 7 | 三个0，已读0可选，原空态截图 |
| check-layout-320.json | design-1-16 | 5 | 320px空／样例／四位数状态，整按钮换行截图 |

## 截图审查

已实际打开检查：design-1-9/screenshot.png（1280px产品式样例）、design-1-11之前相同样例的design-1-3/screenshot.png（320px）、design-1-12/screenshot.png（320px已读焦点）、design-1-13/mobile.png（390px状态面板）、design-1-14/screenshot.png（失败）、design-1-15/screenshot.png（空）、design-1-16/screenshot.png（320px四位数）。

可见结果：沿用纸色、字体与红色底线；数字紧随名称。320px样例三个按钮同排；320px四位数时第三按钮移到下一行，名称与精确数字一起保留，无截图可见的横向越界或截断。390px四位数仍可同排。键盘焦点红色框可见。实际断点430/650与PRD要求的640两侧均执行可见性检查。

自动 visible 仅证明元素可见，不证明所有断点的 DOM 几何无溢出；上述布局结论限实际打开的截图与源码布局核对。没有使用任意 JS 做几何断言，不声称已自动量测全部视口。产品阶段仍应测无新增横向溢出并补真实触摸及屏幕阅读器验证。

## 失败与修正记录

- 最初尝试单独 layout 子目录作为 browser root，被注册工具拒绝：“Browser root is not configured by the repository owner”。没有结果文件，不修改Owner配置；将布局面板移回已获配置的 prototype 根，在同一入口切换，随后检查通过。
- design-1-6 的 check-states 失败：隐藏布局面板提前创建了与主页面同名“全部 3”按钮，严格定位器匹配两个元素。修正为进入审查面板才挂载、退出移除；design-1-7及最终design-1-14重跑同一计划通过。失败结果与截图保留，不包装为初次通过。
- design-1-1～5、7～8 是迭代中通过的早期结果；design-1-6是已闭环失败。最终有效快照使用design-1-9～16，不混合统计历史动作数。

## 其他实际检查与边界

- `node --check` 对 prototype/app.js、layout.js 均通过。
- `git diff --check` 通过；`git diff --exit-code -- app/index.html app/app.js app/styles.css` 通过，正式产品文件没有变更。
- 本地HEAD：bff9bb10eafb548783c8cb7b8adb0cfb9b6f0a8c；任务分支 codex/issue-74-platform。只读检查，未联网更新远端、未提交／推送／操作GitHub。
- 可访问名称含数量由原生按钮文本和角色定位验证；选中状态有代码契约及截图，未执行真实读屏朗读、物理触摸或完整可访问性审计。
- 保存失败是原型persist内部注入，不证明真实配额／安全异常；未测试产品 app、后端或 GPU。本产品本轮不涉及后两者。
- AC-01～10的正式产品完整验证、损坏/部分无效存储、每个成功动作刷新、无效新增/编辑、单一已读集合、Issue #71完整回归及Owner原主线由研发承接。

原型行为验证足以提供本轮可审查设计证据，不等于产品功能完成或最终验收。用户现已明确批准完整设计（A-001），并表示已实际操作原型验证筛选、新增、状态切换、刷新、保存失败和手机四位数布局。此次仅更新审批文档，运行代码及计划未改变，原浏览器证据不变；未新增真实触摸或读屏证据。用户授权研发交付待审草稿PR，缺失人工证据必须如实保留，不伪称通过，也不作为形成草稿的阻碍。
