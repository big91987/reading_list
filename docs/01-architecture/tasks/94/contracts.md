# Issue #94 数据与页面契约

## 持久化与 API：沿用、无变更

产品键 `page-between-reading-list`，值为 JSON 数组，既有记录至少含 `title: string`、`read: boolean`。不添加 ID、tooltip 属性、schema 版本、提示偏好、filter 持久化或新产品键。不迁移、清空或标准化已有数据；保留既有加载过滤和写入失败处理。当前没有网络业务 API，本任务不新增 HTTP/事件接口。书名编辑和单次内存撤销继续沿用 [#71契约](../71/contracts.md) 与 [#82契约](../82/contracts.md)，本文件不改写其语义。

原型键 `page-between-reading-list-prototype-94` 仅为隔离演示；不是产品迁移目标。演示重置写入该键，不算产品悬停写入。

## 页面接口

| data-filter | 原按钮名称 | 固定解释 | 匹配规则 |
|---|---|---|---|
| all | 全部 | 显示所有书籍 | 所有书籍 |
| unread | 未读 | 只显示未读书籍 | !book.read |
| read | 已读 | 只显示已读书籍 | book.read |

原生 type=button、filter-button/is-active、aria-pressed 布尔字符串与顺序不变，初始为 all。只追加 `.filter-tooltip` span 且 `aria-hidden=true`，避免把视觉解释混入按钮名称；无第二套 title 浮层，无 Tab 停靠。状态匹配与点击处理保持原样，提示不依赖 render 或当前书籍数量。

## 事件、错误、幂等与退出

- 输入：浏览器真实指针悬停状态、媒体能力、Escape、pointerleave。输出：当前提示可见/隐藏、本次 `tooltip-dismissed` 类；无业务输出。
- hover 不执行 click、不更新 books/currentFilter/aria-pressed、不调用 persist/localStorage；筛选点击只更新内存，不写存储。
- 重复 Escape 幂等；不阻止默认或冒泡行为，不干涉书名编辑取消。pointerleave 删除临时抑制；离开浮层后隐藏，刷新全部重置临时状态。
- 浮层规则适用于选中/未选中、空/非空和无匹配；粗指针或不支持 hover 时隐藏，无需触屏二次点击。
- 无同步/异步API、请求ID、鉴权、错误码、后台重试、去重、计量记录或监听 storage 事件。原持久化异常与撤销/编辑冲突仍由原契约处理。

## 研发断言

悬停及筛选前后比较实际产品键原始值，观察没有额外 setItem；三条解释实际可见、离开消失且按钮/列表几何不变。检查原名称可被 role=button/name 精确定位，Tab/Enter/Space可激活。新 tooltip 监听不得调用持久化、变更过滤器或在文案中插入书名；演示代码不进入产品。
