# Issue #94 设计验证证据

日期2026-10-03；对象为 prototype，不是 app 产品实现。注册 check 实际执行；不调用shell Chromium、不调用GitHub。浏览器为项目检查器默认 Chromium 桌面上下文（1440×1000，viewport 动作高度844），最终另存390px截图；320px动作是缩小桌面视口，不是触屏模拟。没有Safari/Firefox/真实触屏通过声明。

## 执行记录

| 计划 | 结果 | 原始证据目录 | 覆盖 |
|---|---|---|---|
| check-hover.json首次 | FAIL，reload后visible等待超时 | browser/design-1-1/ | 刷新不保留CSS hover假设被证伪，不是最终机制通过 |
| check-hover.json修正 | PASS | browser/design-1-2/ | 三条浮层实际可见、可信pointerenter点击前读取可见性及filter、Escape、离开旧入口、筛选列表/存储 |
| check-states.json | PASS | browser/design-1-3/ | 空清单及两类无结果、三条文案、选中提示、存储不变、320px无横溢出 |
| check-keyboard.json | PASS | browser/design-1-4/ | Tab/Enter/Space、原名称、禁止setItem时筛选仍正常、原始存储不变、刷新保留 |
| check-core.json | PASS | browser/design-1-5/ | 复用Owner核心计划：添加/标记/刷新/三种筛选/删除 |
| check-edit-undo.json | PASS | browser/design-1-6/ | 改名/保存/删除/撤销/刷新 |

每个目录均有browser.json、screenshot.png、mobile.png。失败证据保留，不覆盖为成功。修正的是验证假设，不使用人为强制浮层显示：真实鼠标进入按钮时CSS自行显示，demo.js只是观察实际状态。

## 静态与一致性核验

实际退出码均为0：`git diff --check`；`node --check` 两份原型JS；本地Node断言扫描40份任务文件、33个本地Markdown链接无缺失，5份最终计划与各browser.json的performed数组完全相等、合计113个动作，检查首次失败仍保留、三条固定文案和AC-01～07追溯齐全。原型app.js完整保留产品逻辑前缀（仅替换隔离键），styles.css完整保留原样式前缀。未修改产品app/或Python代码，不涉及Python质量或产品release声明。上述是文档/源代码检查，不替代浏览器功能证据。

## 已查看的视觉证据

- [桌面提示截图](browser/design-1-2/screenshot.png)：已读选中、提示在按钮正上方，与既有下划线/列表分离，未遮挡按钮文字，浮层确实显示“只显示已读书籍”。
- [320px无结果截图](browser/design-1-3/screenshot.png)：已读无结果保留原文案，浮层仍在按钮上方，右边界未超出页面，原按钮仍可点。
- 桌面/320px均包含页尾演示工具，工具不是产品常态界面。

## 证据边界与后续退出标准

注册动作不提供独立hover/触屏配置；click是鼠标移动再激活，可信pointerenter观察发生在click前，直接读CSS display/实际宽度与选中filter，补充visible和截图，并非仅检查title属性。该证据确认真实进入即可显示；它不能替代纯悬停停留不点击、全部选中×悬停矩阵、鼠标进入浮层继续显示的独立手验。研发至少记录纯hover期间filter/list/storage不变、离开隐藏、移入浮层持续可读、Escape后移出再进入恢复。

键盘自动检查与精确原名称定位已通过；没有屏幕阅读器朗读实测。320/390px不等于真实触屏；研发在无hover触屏设备/获准触屏上下文验证直接一次点击切换，不显示粘住浮层。研发记录Firefox/Safari实际支持范围与结果，不凭Chromium结果扩张承诺。

原型存储使用隔离键。snapshot/unchanged与禁写时筛选检查不等于真实产品既有数据全面验收，也不能证明没有同值重复写入。研发对真实产品键观察写次数，准备中文混合清单及已有额外字段核对原始值；完整AC-01～07与#71/#82回归在app实现后执行。布局源代码复用且浮层绝对定位；原型截图不能代替产品基线几何比较。

上述为 NEXT STAGE，不阻断当前HLD方向；本阶段没有产品AC“全部通过”、上线、合并或用户产物审批声明。
