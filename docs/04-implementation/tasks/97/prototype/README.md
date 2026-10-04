# Issue #97 可运行设计原型

从仓库根运行 `python3 -m http.server 8097 --directory docs/04-implementation/tasks/97/prototype`，打开 `http://localhost:8097/`。无构建、安装或网络资源依赖。`index.html`、`styles.css`、`app.js`、`demo.js`均需一起提供。

本原型以初次设计的 `app/` 为快照，业务app.js原样复用，增加页脚文字与样式。版本为“版本 0.1.0 rc2”，保留原文，独立一行、14px、muted色、自然文档流。返工同步产品既有修复：footer限制 `max-width:100vw`，避免原生200%下160 CSS px视口中文字越界；不改body/main或书单行为。本轮design未修改产品源，产品实现来自development。

上方“原型演示工具”不是产品功能。预置/清空会覆盖当前演示origin的书单键，请在独立端口/浏览器上下文预览，不在产品origin运行。原型仍使用原存储键以便验证格式兼容；正式产品不得复制演示栏、diagnostics或demo.js。

可演示空清单、已读/未读混合、筛选无结果、添加/改名/删除/撤销。写入错误通过注册check的 `storage_write_failure` 注入，按既有错误文案检查版本可见。200%按钮仅给main和footer设置CSS zoom=2，明确是布局模拟，不是浏览器原生缩放。

注册检查计划：`check-states.json`、`check-layout.json`、`check-core.json`、`check-touch.json`、`check-error.json`、`check-zoom.json`、`check-empty.json`。必须通过当前注册check调用，不在shell自行启动Chromium。真实结果、截图、失败重试和人工边界见 [验证报告](../../../../05-validation/tasks/97/design-validation.md)。

返工使用现有 [原样原生缩放及AX计划](../../../../05-validation/tasks/97/browser-native-capabilities.json)，对prototype root执行check，复用原样version-layout.js。不以CSS模拟替代zoom，不删除零写门禁。最新状态与上游工具解除条件见 [返工报告](../../../../05-validation/tasks/97/design-rework.md)，历史7计划通过不代表升级后门禁已通过。
