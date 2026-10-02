# Issue #74 可运行设计原型

状态：完整设计已获用户批准（A-001）。入口 `index.html`；仅浏览器、静态 HTTP 服务，无 npm、构建、CDN 或后端。产品 `app/` 未修改。

## 运行与审查

在仓库根执行：

```sh
python3 -m http.server 8074 --bind 127.0.0.1 --directory docs/04-implementation/tasks/74/prototype
```

打开 `http://127.0.0.1:8074/`。使用同源 HTTP 测试刷新，不以 file:// 的存储行为作为验收。注册 check 工具自行提供浏览器环境，不在 shell 启动 Chromium。

首次预置「长安的荔枝」（未读）、「Dune」（已读）、「也许你该找个人聊聊」（未读），按钮为“全部 3 / 未读 2 / 已读 1”。独立键 `page-between-reading-list-prototype-74` 不触及产品存储。重置只作用于演示集合；清空可查看 0；保存失败开关可验证不提前计数；四位数演示生成 2468 本真实演示条目（两类各 1234），用于布局验证，不表示容量性能承诺。

“计数布局审查”切换到独立的空／样例／四位数筛选区，数值由对应内存集合计算，复用同一 CSS；仅便于紧凑截图，不替代主原型的增删与持久化验证。再次点击返回主原型。演示工具、默认样例及布局审查区均不进入正式产品。

## 文件与计划

- `index.html`、`app.js`、`styles.css`：基于实际产品拷贝形成的独立原型，增加全量计数及演示控制。
- `layout.js`：截图用关键状态面板，不读写书单。
- `check-flow.json`：分类、双向状态切换、增删、改名、刷新、零分类。
- `check-failure.json`：320px 新增／状态／删除保存失败、恢复重试、空态与刷新。
- `check-layout.json`：320/430/431/640/641/650/651/1280px 的样例及四位数全书单。
- `check-keyboard.json`：Tab、Enter、Space 操作与筛选结果。
- `check-layout-states.json`、`check-states.json`、`check-empty.json`：紧凑关键状态、失败、空集合截图。
- `check-layout-320.json`：保留320px四位数整按钮换行截图；其他检查器自动mobile.png为390px，不混淆视口。

真实结果见 [设计验证](../../../../05-validation/tasks/74/design-validation.md)，交互规则见 [交互规范](../design/interaction.md)。原型验证不等于正式产品验收。
