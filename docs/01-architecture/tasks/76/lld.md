# Issue 76 LLD：呈现与事务边界

基线：[HLD](hld.md)、[契约](contracts.md)、[批准动效](../../../04-implementation/tasks/76/design/interaction.md)。仅细化实现，不改批准布局/行为。

- DOM 复用原 form/book-list/filter/editor 标识；增概览 total/read/ratio、visible-count、empty-action。ul/li、原生 checkbox/button/form，用户书名用 textContent/value。
- loadBooks/persist 与对象引用管理保持原事务路径；所有业务同步完成。read replacement 成功后重绑 editor.book；重绘再创建 editor 表单捕获最新引用。新增/编辑失败保持输入，状态失败还原 checkbox；操作错误切换 role=alert，成功 role=status，新增错误关联 aria-invalid/aria-describedby。
- render(transition="none") 取消持有的入场实例，派生当前快照、替换 DOM、更新统计及空入口；初开/筛选最多前 12 张，add 只最后一张，普通编辑/状态/删除无卡片入场。focusControl 保留原语义，不在动画回调移动焦点。
- Web Animations 可用时 animate opacity .6→1 / translateY 6→0，220ms、delay=min(index,4)*18，fill=backwards；intro 260ms/8px。所有实例只存于内存；新重绘取消旧实例。没有 animationend 业务逻辑。API 缺失或抛错即时显示；matchMedia 不可用不抛异常。CSS 只负责 hover/press/filter/统计 transition；减少偏好禁用全部非必要运动。
- 系统 change 取消实例；取消/枚举 API 都做可用性探测。输入组合键保护沿用 #71；新增同样防止候选 Enter 隐式提交。新增 >80 原始 UTF-16 长度拒绝，maxlength 维持 80；编辑不设 maxlength，不截历史长名。
- 不新增 debug API 或测试控制；测试仅在隔离夹具临时入口注入真实 Storage 故障和读取词法状态，恢复产品入口后运行核心及公开交互。

验证签名：node --check app/app.js；注册 check(root="app", plan=...)；完整成功/失败快照、reload、四宽度、键盘、100 本限额/中断、API 降级。系统事件合成、受控帧采样、真实操作与人工测试分别记证据等级。
