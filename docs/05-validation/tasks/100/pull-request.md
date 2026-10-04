# 书籍推荐、类型与简介

## 背景

用户希望从权威官方来源自动获取各类推荐书籍，并在推荐与已有私人书单中查看类型和简介，避免只有书名、无法判断书籍内容。关联 [Issue #100](https://github.com/big91987/reading_list/issues/100)。

## 实现内容

- 新增“书籍推荐”视图，展示类型、原创事实短简介、机构、推荐依据及具体官方出处；类型是产品映射，不冒称官方分类。没有某类型的推荐时显示真实空态。
- 使用固定中国作家网及福建省图书馆页集，采集器支持七天到期更新、小时tick、失败重试/保旧、原子发布、源退出治理；同源只读目录GET/HEAD与app release独立。需要Owner显式安装启用，不是已运行的生产调度，也不是全网最新搜索。
- 固定公网IP与TLS hostname验证、受控重定向/robots、限长与锁；实际HTTP发送至少隔1秒，各阶段受整轮5分钟预算约束，晚到结果丢弃/socket清理。
- 推荐主动加入私人书单，全范围空白/大小写去重；旧书可手动编辑类型/简介，0/1/N候选明确选择且只补空缺，人工信息不被公共更新覆盖。改名待核对、异常原值拒绝覆写、失败保草稿、完整对象撤销与重试。
- 保持原origin/key、未知字段及旧书单兼容；release声明对实际已部署基线验证，不进行启动迁移、数据删除或controller自动升级。

## 验证结果

- **通过：** 返工后独立QA全部12AC、Python47、Node25、10份真实浏览器209动作、注册宿主8门禁；真实CLI采集32条/两机构/三类型，另对每机构一具体原页抽查。实际旧源码与新版往返、部署基线hash及release指纹核对通过。
- **原失败已关闭：** QA-100-01慢DNS后实际GET间隔0秒；QA-100-02超整轮截止后仍发送GET。原复现本轮重新执行为1秒间隔与超时零GET，另真实墙钟等待探针通过；没有删除旧失败或沿用开发自测作为QA结果。
- **未测：** 物理手机、跨浏览器引擎、读屏器朗读、系统IME、生产多标签/真实私人书单、正式launchd安装及七天无人值守、真实源超时事故。受控网络与浏览器缓存注入不冒称实时外站端到端验证。
- [完整QA与逐项证据](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/qa.md)、[本轮审计](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/qa-recheck/audit.json)、[真实采集](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/qa-recheck/real-run.json)、[共享门禁](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/delivery-checks/checks.json)。

## 风险与限制

固定官方页集需长期维护；200/robots404不是内容许可，permissionGranted=false，不复制长评或封面，不称入围为获奖/全站最新。OS DNS不能强制取消，超时停止等待并丢弃晚到结果。没有账号登录，登录验收不适用。自动化触屏与AX不等于物理设备或语音认证；原生200%缩放和DOM已验证，裁切截图不作为完整可读性认证。未部署、未安装生产调度；最终合并和高风险部署保留人工授权。

## 界面效果

以下是本轮独立QA实际截图，展示真实采集目录的历史社科书籍及受控网络失败时保留缓存的状态，非正常采集失败。此前已断言完整32条及类型分布。GitHub链接使用当前仓库/任务分支，由Runner发布本轮文件后可访问，不表示已创建PR或部署。

![桌面推荐页面](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/browser/qa-1-18/screenshot.png?raw=true)

![移动推荐页面](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/browser/qa-1-18/mobile.png?raw=true)

## 本轮独立QA复验

2026-10-04新一轮重新执行全部12AC、Python47、Node25、10份真实浏览器209动作与注册宿主8门禁，均通过；原两项失败边界重新复验通过，实际部署基线与声明重新核对。此次正式采集于12:47:20.107861Z开始，12:47:26.070553Z生成32条/两组织/三类型，发送间隔均至少1秒；完整目录浏览器计划使用本次目录。前轮记录原文保留，不作为本轮通过依据；不修改已存在PR的正文。

[本轮报告](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/qa.md)、[本轮审计](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/qa-refresh/audit.json)、[本轮采集](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/qa-refresh/real-run.json)。此前说明的未测范围仍适用，不新增放行豁免或声称已部署。

证据限制：共享门禁滚动输出使前轮一份AX树原字节无法恢复，旧hash与校验失败保留；本轮门禁及独立AX证据完整，详见报告。此为历史归档缺口，不是产品缺陷或本轮验收失败。

![本轮桌面推荐页面](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/browser/qa-1-28/screenshot.png?raw=true)

![本轮移动推荐页面](https://github.com/big91987/reading_list/blob/codex/issue-100-platform/docs/05-validation/tasks/100/browser/qa-1-28/mobile.png?raw=true)
