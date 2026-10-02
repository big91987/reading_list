# 数据与本地操作契约 v1

> 继承已批准PRD BR-01～10与Issue #71契约；布局／动效引用A-001已批准设计。无新增HTTP API。本文件是本轮研发的兼容与交互契约入口，不是产品测试通过声明。

## 1. 持久事实

产品键严格保持 `page-between-reading-list`；UTF-8可序列化JSON数组，基本条目：

```json
[{"title":"长安的荔枝","read":false},{"title":"Dune","read":true}]
```

title为字符串，read为boolean；书籍顺序即数组顺序，新增末尾追加，不引入id/cover/作者/时间戳，不按字母排序。已有条目额外字段遵循当前spread更新保留，不借改版清洗。读取只过滤title/read类型不合法条目；非数组、解析／读取失败沿用空数组容错。**首次读取不得setItem**，不得截断／trim历史书名。无来源迁移、跨设备或多标签页冲突契约。

原型使用隔离键 `page-between-reading-list-prototype-76` 和仅无自身数据时的六本内存示例；正式实现不复制原型键／示例／工具。

## 2. 内存与呈现对象

| 对象 | 字段／所有者 | 保存／退出 |
|---|---|---|
| books | 已提交条目数组；清单管理持有，本地保存负责提交成功事实 | setItem成功才替换；刷新从存储恢复 |
| filter | all/unread/read；清单管理 | 不保存；刷新all |
| editor | book对象引用、draft字符串、error字符串 | 最多一条，不保存草稿；取消、切筛选、换编辑对象、刷新退出 |
| 派生统计 | total=books.length；readCount按全数组；visible按filter | 不写存储；比例为0或readCount/total |
| 动画实例 | 仅当前节点的浏览器呈现实例 | 重绘／偏好变更取消，不能修改books/editor |

名称不是稳定主键；内部用当前对象引用确认目标仍存在。重命名／状态更新创建替换对象，编辑引用与焦点定位随之更新；删除后的引用不能复活书。DOM数组下标仅当前重绘定位，不持久化ID。

## 3. 操作接口（本地语义，不要求新公共函数签名）

| 命令 | 成功候选与副作用 | 失败 |
|---|---|---|
| add(rawTitle) | trim书名，追加read=false；提交后清草稿、切all、清输入、focus新增 | 空／重名／>80按既有口径拒绝；写失败保留输入和旧视图 |
| beginEdit(book) | 丢弃旧草稿，预填完整原名、选中文本 | 目标已不存在：不进入失效编辑 |
| saveEdit(rawTitle) | 只spread目标并改title；状态、位置、筛选、其他记录不变；结束草稿、focus修改 | 原始rawTitle.length>80、trim空、全数组大小写同名（排除自身）；错误保留草稿；写失败原名不变 |
| cancelEdit | 不写存储；退出草稿、focus修改、播报取消 | 无自动保存 |
| setRead(book, boolean) | 只改read；保留filter；目标仍可见则保留编辑，退出可见则清目标编辑；focus checkbox或当前filter | 写失败恢复checkbox与旧数据，保留草稿，不播报成功 |
| deleteBook(book) | 候选过滤目标；成功清目标编辑，focus相邻有效入口或当前filter | 写失败不移除，保留编辑，可重试 |
| setFilter(value) | 仅改内存filter，清草稿，立即派生视图；focus当前filter | 不触发保存，无延时切换 |

长度口径沿用JavaScript UTF-16长度单位，input新增maxlength=80；编辑不静默截断历史长名，提交校验rawTitle.length。trim不折叠内部空格；大小写判定沿用toLocaleLowerCase。原名保存或仅改大小写允许。原输入限制与浏览器行为不能被改成未批准的新“80个汉字”规则。

## 4. 提交／并发／错误

```text
读取当前目标 → 校验 → candidate
  → localStorage.setItem(key, JSON.stringify(candidate))
    → 成功：books=candidate → render最新快照 → 焦点／文字 → 可选动画
    → 失败：books不变 → 保留输入／草稿、恢复勾选 → 错误
```

每次用户事件同步完成提交，不在animationend、timeout或旧动画Promise中重放命令；无异步业务队列。动画结束不是幂等键或成功判据。连续删除按每次当前数组确定目标，连续筛选取最后事件，状态反复切换只提交当次明确目标。候选JSON序列化或setItem失败都视为写失败。

失败文案应表达动作未完成，而非仅“网络异常”；新增「未能添加，请重试。」、编辑「未能保存，原书名未改变。请重试或取消。」、状态「未能保存阅读状态，请重试。」、删除「未能删除，请重试。」。成功提示仅在写成功后产生；同一操作不同时宣布失败与成功，新动作清理旧无关消息。

## 5. 动态与可访问性边界

动效时长／封顶／取舍以 [interaction.md](../../../04-implementation/tasks/76/design/interaction.md) §4为唯一规范。每次重绘先取消旧实例；偏好切换取消在途运动。减少模式保留所有业务与静态反馈。研发对API做可用性探测，缺少动画API则即时渲染，不让加载／管理抛错。

输入组合期间Enter不提交、Escape不取消（isComposing/组合态/229保护）；普通Enter明确提交、Escape取消。原生input/button/form，显式label、目标可辨名称、:focus-visible、aria-pressed、checkbox原生checked、role=status与role=alert，并关联输入错误。焦点契约见interaction §3；不在动画结束后再次移动焦点。

## 6. 兼容与验证责任

研发用原格式混合状态、长名和额外字段fixture验证首次getItem无setItem、成功修改仅目标字段变化；注入真实产品存储边界抛错，比较前后存储和books，随后恢复重试并reload。回归所有BR与AC；原型工具只模拟candidate写失败，不能代替正式边界验证。安全检查用户字符串仅textContent/value，书籍管理不请求外部服务。数据契约不需要迁移文件；回退视觉代码仍读取相同JSON。
