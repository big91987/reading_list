# Issue #94 LLD

2026-10-03。依据自主策略落实已接受 HLD/契约，无新的产品取舍。

## 变更边界与接口

最小缺口是原筛选按钮没有点击前解释。HTML 三个原 button 内分别追加一个 `span.filter-tooltip[aria-hidden=true]`；标签、顺序、名称、aria-pressed、焦点和原有事件不变。CSS 绝对定位到按钮上方，继承原 position:relative；bottom:100% 无间隙，浮层为按钮后代，移入浮层仍匹配父按钮 :hover。无焦点/触屏长按提示、业务 API、数据转换、新依赖、演示控件或重构。

## 状态及事件

CSS `(hover: hover) and (pointer: fine)` 与 `.filter-button:hover:not(.tooltip-dismissed) .filter-tooltip` 派生可见性。隐藏默认 display:none；浮层几何/色彩与 [交互规范](../../../04-implementation/tasks/94/design/interaction.md) 一致。

`document` keydown：非 Escape 无操作；Escape 给当前 :hover 按钮添加 tooltip-dismissed；不 preventDefault/stopPropagation。原按钮 pointerleave 删除抑制类。重复 Escape 幂等、离开后重入恢复，刷新没有持久化抑制。书名编辑的 Escape 处理继续先按原契约取消，不被此监听消费。

## 数据与故障

三个监听不读写 books/currentFilter/localStorage，不调用 render/persist。筛选 click 原函数完整保留。既有键 `page-between-reading-list`、原始 JSON/扩展字段保持。无产品初始化夹具和调试 API。存储错误仍由原实现负责；媒体不匹配时隐藏但按钮一次激活正常。

## 可执行验证

`node --test tests/*.test.cjs` 覆盖 Escape 幂等/离开复位、非 Escape 不消费、无存储写及全筛选矩阵/扩展字段；注册 check 运行 `tests/browser/core.json` 和本任务 browser-plan.json，复用 #71/#82 真实产品计划。CSS/DOM结构检查不是纯 hover 及触屏的可见性实测；验证报告必须区分工具可支持与尚未支持的项目。

2026-10-03恢复验证：同一正式工具已支持hover/pointer/tap/first-step device、selector、几何及跨刷新存储写调用观察。主计划升级为72动作纯hover，原67动作保留为browser-click-keyboard.json；补三筛选×三入口、空及两类无结果、浮层进入停留/Escape、390px独立Chromium触屏模拟、320/390/1440px按钮/列表几何与实际零新增写。16份计划851动作通过，产品代码无需进一步修改。具体支持范围、宿主机成功gate和历史失败保留见 [验证报告](../../../05-validation/tasks/94/validation.md)，不宣称物理手机/跨引擎/朗读认证。
