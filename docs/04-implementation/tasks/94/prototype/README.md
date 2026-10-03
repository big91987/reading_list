# Issue #94 可运行原型

2026-10-03。原型不是产品实现或上线版本。

## 运行

在仓库根目录执行 `python3 -m http.server 8094 --directory docs/04-implementation/tasks/94/prototype`，浏览器打开 `http://localhost:8094`。也可直接打开本目录 index.html（建议 HTTP，避免 file 协议存储差异）。仅依赖同目录 index.html、styles.css、app.js、demo.js，无安装、构建或外网依赖。

主体基于任务开始时 app/ 三文件快照，原筛选、书名编辑和撤销逻辑保留。原型只使用 `page-between-reading-list-prototype-94`，不会读取/覆写真实产品键。页尾演示工具可建立混合、空、仅已读、仅未读清单，并输出真实指针进入时的可见性、点击前筛选及横向溢出。演示会替换原型数据，不影响产品数据；不得移植到 app/。

## 查看关键状态

- 混合清单：逐一把鼠标移到全部/未读/已读，无需点击即可看到固定解释；再点击切换，核对选中线和列表。选中与未选中入口均有提示。
- 空清单：三个解释不变，保留“清单还是空的”。仅已读→未读和仅未读→已读保留原无结果文字。
- 提示置于按钮上方，不进入布局；离开按钮及其浮层后立即隐藏。Escape 隐藏当前浮层，移出后再次进入恢复。无焦点提示、动画、原生 title 或新增 Tab 停靠。
- 320px 窄屏：按钮仍按原顺序伸展；浮层不越出页面。触屏无需额外一步关闭提示，真实触屏验证由研发补齐。

## 已运行检查

通过注册 check 执行 check-hover.json、check-states.json、check-keyboard.json、check-core.json、check-edit-undo.json。运行结果、截图及一次失败重试见 [验证报告](../../../../05-validation/tasks/94/design-validation.md)。

注册动作没有 hover。hover 计划使用真实鼠标 click 的“移动到按钮→pointerenter→click”次序：原型观察器在可信 pointerenter 事件中读取实际 CSS 可见性与点击前选中值；随后 DOM visible 与截图确认真实浮层，而非只检查属性。此证据证明浮层在点击前已出现，但不是独立停留不点击动作；研发仍须纯 hover 的人工或获准工具验证。首次尝试以 reload 保持鼠标位置失败，已保留失败记录并改用真实 pointerenter 观察，没有模拟 hover 或让演示工具控制浮层。
