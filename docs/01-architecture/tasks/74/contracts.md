# Issue #74 数据与界面契约

状态：承接已批准 PRD；完整设计及展示规格已获 A-001 批准。无新 HTTP API，不添加新存储结构。

## 1. 持久化事实

产品键仍为 `page-between-reading-list`。值是既有 JSON 数组，条目至少包含 `title: string` 与 `read: boolean`，保留当前未知字段的原处理，不新增 id、count、版本号或索引。

```json
[{"title":"Dune","read":true},{"title":"长安的荔枝","read":false}]
```

加载沿用当前实现：读取、JSON.parse；非数组或异常返回 []；数组仅保留非空对象且 title 为 string、read 为 boolean 的条目。不追加新的 trim、长度或去重加载规则；新增／编辑保持原校验规则。按钮数按实际恢复集合计算，不能按原始数组长度计算。

原型使用独立键 `page-between-reading-list-prototype-74`；不得将其或预置样例移入产品。

## 2. 派生契约

设 B 是当前页面成功恢复／成功保存的 books；count(all)=B.length；count(read)=B 中 read===true 的条目数；count(unread)=count(all)-count(read)。三者非负整数且相加不变量成立。无需保存派生数，也不在每个增删处理器手工累加。

`currentFilter` 保持 `all | unread | read`，仅控制可见列表和 aria-pressed，不参与计数输入。render 重复调用不产生数据写入，无异步刷新或轮询。完整精确十进制显示，不近似化；筛选按钮仍可在计数为 0 时操作。

## 3. 内部命令与错误契约

| 入口 | 保存成功的数量结果 | 校验／保存失败 |
|---|---|---|
| 新增未读 | all+1, unread+1；原返回全部和焦点流程 | 原提示与输入保留；数量不变 |
| 删除已读／未读 | all-1, 对应分类-1 | 原删除错误；条目及数量不变 |
| 未读→已读 | read+1, unread-1, all不变 | checkbox 回原值、原状态错误，数量不变 |
| 已读→未读 | read-1, unread+1, all不变 | 同上 |
| 编辑书名／取消编辑 | all/read/unread不变 | 原编辑错误／草稿行为；不改数量 |
| 筛选或 render | 数量不变，无写入 | 无新增错误契约 |
| 刷新 | 按加载后的 B 重新计算 | 按既有加载恢复行为展示 0 或有效子集 |

persist(candidate) 先尝试 setItem，成功才 books=candidate 并返回 true；失败返回 false 且 books 保持原集合。只有成功提交才对新 B 渲染。不新增错误码／失败弹窗；沿用现有“未能添加，请重试。”“未能删除，请重试。”“未能保存阅读状态，请重试。”等提示。

## 4. DOM 和兼容契约

保留三个 data-filter 值和按钮节点、监听、group 标签、aria-pressed、选中 class。新增内部 `.filter-count` span，只有其 textContent 更新；数字不 aria-hidden，不写覆盖数字的固定 aria-label；可访问名称应包含名称和数量。样例为“全部 3”“未读 2”“已读 1”。DOM 顺序不变；原按钮焦点和键盘行为不变。

摘要与按钮使用相同 B 和 readCount。计数更新发生在统一 render 中，筛选更新仅维护选中态。样式与视口规则由 [交互规范](../../../04-implementation/tasks/74/design/interaction.md) 负责，不复制另一份规范。数据键及 JSON 格式不版本化，不做迁移；回退界面代码不影响旧书单。

## 5. 验证责任

设计验证已覆盖的真实原型结果见 [验证报告](../../../05-validation/tasks/74/design-validation.md)。研发必须在正式 app 上重跑 AC-01～10，包括损坏／部分无效数据加载、实际存储异常、成功动作逐项刷新、空及两种单分类、无效新增／编辑、焦点与读屏检查。原型的模拟保存失败证明展示流程，不证明真实浏览器配额异常或产品验收完成。
