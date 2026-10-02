# Issue #76 设计原型验证

> 2026-10-02，注册 `mcp__registered_browser_design.check`，允许root：`docs/04-implementation/tasks/76/prototype`。未在shell启动Chromium、未修改共享检查器。本报告只描述原型，不表示app/产品完成。

## 实际结果

九份计划最终均通过，累计192个动作，成功回执均 `errors=[]`。9～16验证主要交互快照；其后仅追加原型诊断按钮与check-motion计划，17验证最终动画诊断，不改管理链路。

| 计划 | 成功回执目录（本目录下browser/） | 动作 | 内容 |
|---|---|---|---|
| check-desktop | design-1-9 | 28 | 三筛选、连续新增、trim改名、刷新、双向标记、连续删除 |
| check-mobile | design-1-10 | 33 | 320px重名/Escape、四类写失败、恢复重试、刷新；390px编辑 |
| check-states | design-1-11 | 25 | 三空状态、空名、编辑中删最后一本、768/320历史长名 |
| check-density | design-1-12 | 20 | 100本、320px筛选34/66、状态退出、连续删除后98本、1440溢出测量 |
| check-visual | design-1-13 | 27 | 320/390/768/1440真实DOM宽度测量；768管理流程；关闭动态样式的稳定截图 |
| check-keyboard | design-1-14 | 36 | 从新增输入起Enter/Tab/Space完成筛选、状态、编辑保存/Escape、删除；320px退出编辑 |
| check-empty | design-1-15 | 4 | 整清单空状态桌面/手机证据 |
| check-failure | design-1-16 | 8 | 保存失败，原书与草稿保留，原位错误证据 |
| check-motion | design-1-17 | 11 | 6本/100本动画实例6/12个，中间帧opacity插值、重绘取消、减少模式无实例 |

每个目录真实文件均为 `browser.json`、`screenshot.png`、`mobile.png`。检查器默认1440×1000，viewport动作height=844；结束时保存当前视口全页图，再切390px保存mobile.png；因此不是所有screenshot.png都等于桌面宽度，design-1-11为768，design-1-10为390。无浏览器版本／硬件参数回执，不虚构这些环境信息。

## 推荐查看的截图

- [1440px正常书架](browser/design-1-13/screenshot.png)、[390px正常书架](browser/design-1-13/mobile.png)：为了稳定审查关闭非必要动画；不以此证明动效。
- [390px编辑中](browser/design-1-10/mobile.png)：输入、保存／取消、阅读状态与删除常显。
- [768px历史长名](browser/design-1-11/screenshot.png)、[390px历史长名](browser/design-1-11/mobile.png)：无截断，管理操作未被文字覆盖。
- [98本桌面](browser/design-1-12/screenshot.png)、[98本手机](browser/design-1-12/mobile.png)：从100本夹具连续操作后的最终状态。
- [桌面空清单](browser/design-1-15/screenshot.png)、[手机空清单](browser/design-1-15/mobile.png)。
- [桌面保存失败](browser/design-1-16/screenshot.png)、[手机保存失败](browser/design-1-16/mobile.png)。

已实际查看正常桌面／手机、编辑、空态、768长名与手机失败图，未发现文字遮挡或页面横向裁切；四宽度无横向溢出另外由页面诊断按钮读取真实scrollWidth/clientWidth并通过visible断言，非仅CSS静态推断。100本图可查看，功能数量与删除结果由check回执验证。

## 失败与整改历史（保留，不掩盖）

- design-1-1：15动作后fill超时；计划期望具体书名输入可访问名称，实际仅通用label。为原型输入补目标书名aria-label，同计划在design-1-2通过，最终9再次通过。
- design-1-7：19动作后键盘计划定位超时。条目退出筛选后焦点正确回筛选，计划少一步Tab（checkbox后才是修改按钮）；修正计划，同计划8通过，最终14再通过。不是产品缺失字段或误改焦点。
- design-1-2～6/8为中间通过证据，1/7为失败证据；完整历史仍在browser/，最终推荐9～17。

## 动态证据与边界

正常入场／筛选／新卡片动画可在原型体验。motion诊断在浏览器中触发真实CSS动画，用getAnimations读取实例，主动pause并将第一实例currentTime置于一半，采样实际computed opacity位于0.6～1，再重绘确认旧实例playState全部idle。100本只产生12个卡片实例；减少演示后无实例。这是**受控动态插值与取消验证**，不是自然播放录屏、GPU性能或精确快速人工点击时序证明。

写失败在原型persist边界主动抛错，无业务提交；属于模拟，不是真实浏览器quota／产品存储方法注入。原型使用独立键，未读取产品保存数据。浏览器计划没有对localStorage前后快照、checkbox属性、活动焦点元素、GPU或帧率做任意脚本断言。

系统prefers-reduced-motion媒体查询和change取消已在代码核对；check没有系统偏好设置动作，本轮实测的是演示减少模式，不能声称系统偏好实际切换已验收。中文fill不等于真实IME，390px视口不等于真机触控，role查询不等于屏幕阅读器实测。仍待研发：原数据首次不写回、80/81边界、额外字段保留、四宽度完整产品流程、严格时序与最终存储断言、真实系统偏好、输入法／读屏、动画API降级及既有reading-core回归。

## 静态检查与快照

node --check prototype/app.js通过。源HEAD `bff9bb10eafb548783c8cb7b8adb0cfb9b6f0a8c`，任务分支 `codex/issue-76-platform`，仅只读查看，未提交／推送／切换分支。最终原型SHA-256：

```text
index.html 5615286b1bb0524dd4266187e957325674b6bc885de030cc4388facf5e4ff3fc
styles.css f175ad5805fcfb07effa4446530f9c84dfb80fd79f2848f3ecc9f74fbbe99789
app.js     87c93647d2cddbc5cda6e3cbed55000fcf1de68a33e463a9169d955affa3f714
```

文档链接、计划JSON和差异空白检查结果见G2自查。没有产品Python变更；未运行产品功能测试或声明产品AC已通过。

## 预览环境限制与导出

尝试python3静态服务绑定127.0.0.1:8076失败，PermissionError: Operation not permitted；未请求越权或假报服务在线。注册check由已授权服务运行，所有上述真实浏览器结果仍有效。补充prototype/preview.html为最终三源文件的内嵌导出，可下载后直接打开；file来源存储边界与HTTP验收不同，已在原型README说明。导出内容由静态等值核对保证一致，没有将未单独执行的file来源保存行为称为已验证。
