# Issue #82 隔离交互原型

> 原生 HTML/CSS/JS，无 npm 安装或构建依赖；用户已批准修订交互和设计，不是产品实现。2026-10-02。

## 运行与审查

在项目根目录运行：

```sh
python3 -m http.server 8080 --directory docs/04-implementation/tasks/82/prototype
```

浏览器打开 `http://localhost:8080`，点页面底部“重置演示数据”开始。初始样本为未读《长安的荔枝》、已读《活着》、未读 Atomic Habits，顺序固定。刷新只读最后成功保存书单，撤销机会失效。停止预览按终端 Ctrl+C。运行时只需浏览器；本阶段实际浏览器验证使用注册 check，不在 shell 启动 Chromium。

文件依赖：index.html → styles.css、app.js。沿用本任务读取的 app/ 页面基线制作，仅原型新增撤销 UI 和状态。产品键 `page-between-reading-list` 不读写；原型仅使用 `page-between-reading-list-prototype-82`。重置/诊断/故障 checkbox 仅演示工具，重置不是产品正常动作。

## 推荐审查旅程

1. 删《活着》→提示准确书名→撤销恢复已读和原序位。删两本后只恢复最后一本；只剩最后一本再删除，空态仍可撤销。
2. 删除《活着》→切未读→撤销：不改筛选，显示恢复但当前不可见；点已读可查看。
3. 删除《活着》→新增同名《活着》→撤销失败→把新书改名→再次撤销，旧已读书和新未读书均保留。
4. 删除 Atomic Habits→把其他书改名为 atomic habits→选已读使冲突书隐藏→撤销仍拒绝；回全部改名再重试。
5. 删除一本→编辑另一本并输入草稿→撤销：草稿仍在，继续保存或取消。编辑将被删除的书后删除→撤销只恢复保存版本。
6. 删除《活着》→勾“注入实际存储写入失败”→删除另一书及撤销均失败；诊断显示实际写入失败计数，清单/统计/持久化/机会不变；取消勾选后重试并刷新。
7. 320px 与 1280px 检查长书名、冲突/失败和空态；Tab/Enter/Space 可完成删除、改名排冲突、撤销和筛选。原有新增、编辑、阅读状态仍可操作。

## 可复现浏览器计划

注册工具 `check(root="docs/04-implementation/tasks/82/prototype", plan="对应项目相对 JSON 路径")`。每组计划先重置自己的样本，不依赖上一次运行的存储。七份计划：

| 文件 | 验证内容 |
|---|---|
| check-core.json | 删除/撤销状态统计、完整序位、连续删除、空态、刷新、筛选隐藏恢复 |
| check-conflicts.json | 新增和改名两类冲突、全清单/大小写、草稿保留与继续保存 |
| check-failure.json | 实际 Storage.prototype.setItem 抛错、清单/统计/存储/机会不变、重试/刷新 |
| check-keyboard.json | Tab/Enter/Space 删除、冲突、改名、重试，桌面→320px |
| check-keyboard-filter.json | 320px 仅键盘导航筛选及隐藏恢复，最终焦点在当前筛选 |
| check-states.json | 普通操作/校验失败保留机会，长书名桌面及窄屏 |
| check-empty.json | 320px 空清单、Space 恢复、撤销焦点及无横溢出 |

键盘计划的样本重置和起始书名输入由工具 click/fill，随后导航与激活为真实键盘；修改书名文本由 fill 注入，不声称操作系统 IME 实测。工具不支持 Shift+Tab，本轮改用完整向前 Tab 路径，没有修改共享工具。

运行结果、历史失败和截图见 [设计验证](../../../../05-validation/tasks/82/design-validation.md)。本次通过只证明隔离原型交互与故障路径，不证明 app/ 产品实现或最终 AC 全部验收通过。

本轮新增正式工具路径：[product-storage-failure-plan.json](../../../../05-validation/tasks/82/product-storage-failure-plan.json)。对本原型 root 执行已通过 69 动作，不使用演示故障 checkbox/诊断；研发完成后直接改 root 为 app 执行同一计划。正式产品验证说明见 [精简故障方案](../../../../05-validation/tasks/82/fault-validation-plan.md)，无需复制实现或替换首页。
