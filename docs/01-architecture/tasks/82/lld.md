# Issue #82 LLD

2026-10-02 · 承接批准 contracts.md，不增加设计决定。

## 状态与接缝

app/app.js 新增 `undoRecord = null | {book, index}` 与 `undoError`，仅内存。沿用 persist(candidate)，成功写入后才提交 books。DOM独立 #undo-panel / #undo-message（role=status）/ #undo-error（role=alert）/ #undo-button；render更新栏但不重建按钮，以保留失败焦点。

## 事件实现

- deleteBook(book)：先 books.indexOf 缺失守卫；浅快照与完整index；候选过滤；persist失败只一般错误、不动editor/undo。成功替换undo、清undoError、仅退出被删editor、render并聚焦撤销。
- undoLatestDelete()：空记录无副作用；在完整books上toLocaleLowerCase冲突判断（不读取草稿），冲突只设置栏内错误。候选复制数组，在Math.min(index,length)插book；persist失败保留记录、books、草稿和筛选。成功清记录/错误并render，优先editor输入，否则恢复书修改入口或当前筛选；一般反馈说明隐藏恢复。
- 既有其他事件不修改undo。新增输入不会由撤销重置。持久数组内保留现存对象引用，删除快照保留未知字段。

## 验证边界

真实产品browser计划验证public UI与Storage；内部守卫/越界/旧JSON扩展字段使用独立node测试，不作为真实用户旅程。系统IME/屏幕阅读器需要人工实测，脚本不冒称。无异步、API、跨标签同步、迁移、调试入口或额外故障模式。回退只移除本轮UI/内存逻辑，持久格式仍与旧版兼容，不还原既往删除。
