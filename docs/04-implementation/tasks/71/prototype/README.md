# Issue #71 可运行设计原型

本目录是修改书名的独立交互原型，不是正式产品。入口 `index.html`，运行依赖仅浏览器和静态 HTTP 服务；`styles.css` 沿用原产品样式并补充编辑／手机布局，`app.js` 实现演示交互。无 npm 包、构建步骤、后台或 CDN。

## 预览

在仓库根运行：

```sh
python3 -m http.server 8071 --bind 127.0.0.1 --directory docs/04-implementation/tasks/71/prototype
```

打开 `http://127.0.0.1:8071/`。也可由编辑器用静态服务器打开本目录；建议同源 HTTP 预览以测试刷新持久化，不以 file:// 存储行为作为验收。浏览器验证由注册的 check 工具运行，不在 shell 启动 Chromium。

首次预置「长安的荔枝」（未读）、「Dune」（已读）、「也许你该找个人聊聊」（未读）。存储键为 `page-between-reading-list-prototype-71`，不会读取或覆写产品键。页底「重置演示数据」和「模拟本地保存失败」仅是原型验证工具。

审查建议：修改一条并刷新；空格／dune／超长保存；取消和换筛选；编辑中新增／标记／删除；模拟失败后恢复开关重试；分别在 1280px 和 320px 操作。详情见 [交互规范](../design/interaction.md)。

## 实际检查计划

- `check-desktop.json`：三筛选、trim、大小写、空名、隐藏重名、取消、刷新，结尾桌面编辑状态。
- `check-mobile.json`：320px 保存失败与重试、换条与筛选、目标删除、长名，结尾手机编辑状态。
- `check-errors.json`：80/81 边界、取消、刷新草稿丢弃，结尾空名错误。
- `check-keyboard.json`：重置后定位新增输入，Tab/Enter 进入编辑、保存、取消、失败修正；文本通过 fill 录入，不等同操作系统输入法。
- `check-coordination.json`：320px 新增失败保留编辑、新增成功丢弃、标记移出筛选、其他删除与刷新。
- `check-failure.json`：桌面保留写失败状态供截图审查。
- `check-escape.json`：1280px 普通草稿／空名错误后 Escape 取消及焦点回入口；320px 写失败后 Escape 取消、刷新保持原名和已读状态。

真实结果和全部截图见 [设计验证报告](../../../../05-validation/tasks/71/design-validation.md)。首次检查器不支持 Escape 的失败及点击取消重跑证据均保留。用户通知共享检查器已修复后，本轮通过注册 check 补跑 check-escape.json，35 个动作全部通过，无页面错误；未修改共享检查器或原型代码。真实中文组合事件与屏幕阅读器仍待研发验收，产品实现后也须回归 Escape。
