# Issue #71 LLD：DOM、草稿和快照提交

本轮细化已批准 HLD/contracts，未改变公共行为或存储格式。

## 状态与内部接缝

`books` 仅是最后成功写入的数组；`currentFilter` 与 `editor = null | {book, draft, error}` 仅在内存。`loadBooks()` 沿用旧加载；`persist(candidate)` 捕获 stringify/setItem 异常，返回 boolean，只有成功才替换 books。`validateTitle(rawTitle, target)` 返回空串或已批准错误文案。目标通过对象引用关联，不使用 title/筛选下标；改 read 的 replacement 成功后将 editor.book 重绑。

## DOM 与焦点

`createBookItem(book)` 保留 checkbox、标题 textContent 与删除，增加常显修改按钮和单条 `createEditor(book, index)` 表单。全清单 index 仅用于当次 DOM 的 id/data 属性，写入始终比较引用。原位表单显式 label、无 maxlength（超长草稿不能吞尾部）、aria-describedby 指向帮助和 role=alert 错误。成功/取消等使用 index.html 的独立 role=status；开始动作清掉旧成功消息，防止失败时显示过期成功。

`render()` 重建清单；重绘后调用对应目标按钮/checkbox 的 focus，找不到时回当前筛选。删除按操作前的可见位置选择相邻条目，若相邻仍编辑则回其输入；不会用全清单索引挑错过滤列表的邻居。其他条目的操作重绘保留草稿与错误；取消、保存、筛选、新增成功和目标移出筛选清除 editor。

## 改名事务

表单 submit preventDefault → composition guard → 目标存在 → validateTitle → 构造 `{...book, title: raw.trim()}` replacement 和候选 map → persist → 成功清 editor/render/focus/播报；失败只更新 editor.error/ARIA/alert/focus，存储、books、草稿、筛选与统计不变，不回滚写入。

## 其他命令

新增保留原有空/重名文案和 80 maxlength；校验/写失败不丢草稿，成功候选 append、切 all、清草稿/reset/focus。checkbox 候选只改 read，失败恢复 checked 并播报，成功重绑并按可见性保留/退出。删除候选只移除目标，失败不改清单/草稿；成功终止目标编辑或保留其他草稿。所有候选不含 draft/filter/id。

## 组合输入

输入的 compositionstart/end 控制局部 composing；keydown 的 isComposing、composing、keyCode===229 阻止候选 Enter 触发 submit，组合中的 Escape 不取消；非组合 Escape 取消。阻止默认 Enter 仅在 keyCode/isComposing 已指示的组合键上，普通 Enter 使用原生表单提交。submit 也检查 composing，不能靠按钮绕过正在组合的状态。测试必须注明合成浏览器事件不代表系统 IME 候选实测。

## 验证与回退

本任务 fixture 在原生浏览器中运行原产品 HTML/app.js/CSS；仅验证夹具提供预置旧 JSON 和 Storage.prototype.setItem 异常，产品无测试开关。逐条检查契约、长名溢出、引用重绑、深快照及 ARIA，另跑用户主线。无迁移：回退三份产品静态文件仍可读取改名后的旧格式；回退不恢复旧书名，不提供历史撤销。验证索引为本任务 validation.md，生产页面无测试入口。
