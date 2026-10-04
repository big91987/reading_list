# Issue #100：书籍推荐、类型与简介

## 最新开发交付（2026-10-04）

当前为独立QA退回后的修复版本：[本轮返工验证](../../../05-validation/tasks/100/development-rework/README.md)。QA-100-01/02发送限流和截止预算已修复，Python47/Node25、10份真实浏览器208动作、真实两源32条及8项共享门禁重新通过。当前预览`http://127.0.0.1:5535`；待新一轮独立QA，不沿用下面首次开发的通过结论，也不表示正式服务已安装或发布。

### 首次开发（历史证据）

已实现正式安全采集、独立公共目录/同源只读分发、推荐加入、类型/简介编辑与候选补全、完整对象撤销；保留原书单存储键及未知字段。研发就绪，等待独立QA，不表示QA通过或正式发布。

- [实施计划及公共进度](implement.md)、[LLD](../../../01-architecture/tasks/100/lld.md)、[运行/来源治理/备份恢复](operations.md)。
- [逐AC验证报告](../../../05-validation/tasks/100/validation.md)：真源32条，两组织/三类型；Python37、Node25、7份真实产品浏览器计划173动作、8项Owner完整门禁通过。
- [兼容基线](../../../05-validation/tasks/100/compatibility/baseline.json)：实际已部署10c5e03；旧新版往返、原始字节与备份恢复验证后更新产品release声明为none。
- 可运行本机工作树预览：`http://127.0.0.1:5534`；未安装正式launchd/升级生产controller，未部署、提交或合并。新origin不含原5533私人书单。

## 已接受设计交付（历史阶段）

[设计索引](design/README.md)：本轮可运行推荐/元信息原型、HLD/数据契约、架构决策与11R/12AC追溯齐备；[G2自查](design/g2-review.md)与[真实验证](../../../05-validation/tasks/100/design-validation.md)区分设计就绪与产品/QA放行。当前G2 HLD READY，按Runner自主策略交development，以新工具回执为准；旧网络/G2失败记录只保留历史，不沿用旧结论。未修改app、安装服务或发布。

原始 Issue：<https://github.com/big91987/reading_list/issues/100>。

## 本轮需求基线（历史阶段记录）

- [PRD / User Story / AC](prd.md)：产品结果与完整验收契约。
- [决策与续接台账](requirements-decisions.md)：用户要求、项目约束和自主推荐默认分别记录。
- [来源与验证能力调研](research.md)：公开来源、代码事实、真实调用和能力边界。
- [G1 自查](g1-review.md)：需求就绪结论、设计输入和非阻断依赖。
- [需求返工与依赖补齐](requirements-rework.md)：当前阻断、推荐运行责任、D-008联网入口请求和恢复条件。
- [最新联网恢复与内容PoC](network-recovery.md)：管理员修复后原会话实测、两源34条解析、失败历史、内容边界和重新交接条件。

本轮新建上述五份任务文档，更新 `docs/README.md`；复用现有产品代码、部署规范和既有任务验证，仅作为基线证据，没有变更产品、共享 Harness 或受保护配置。设计须新增本次交互原型、HLD、契约、决策与追溯文件，并以 `design/README.md` 索引，不能用旧产品截图替代。

当前状态：Ready for Architecture（本轮管理员修复后重新验证与自查），网络/内容前置已解除；不是沿用旧结论、用户逐项批准或产品AC通过。11项R/12项AC保留，首批来源等价替换为福建省图书馆与中国作家网；无需用户形式确认，交接以新工具回执为准。

## 2026-10-04 设计检查点

[设计索引](design/README.md)与[返工报告](design/rework.md)：本会话注册check的原生缩放、AX树和page_script五动作能力验证通过；两源本机HTTPS探测仍DNS失败，web无可引用结果。G2 HLD NOT READY，按自主策略退回requirements协调真实联网验证条件，保留所有AC。尚未完成推荐原型、HLD或契约，未进入研发；返工以注册工具回执为准。

本轮requirements核对上述原始证据，并新增需求返工记录；推荐复用现有Owner管理的本机宿主，但没有擅自授权、部署或认定宿主已联网。需要Runner/Owner提供可实际调用的入口（D-008），收到后继续，不重复派发同样无网的设计执行。

## 2026-10-04 最新恢复检查点

以上阻断描述为历史。用户明确平台已允许本任务原requirements/design联网，本轮直接终端/Python首页探测及具体荐书获取/解析完成，无需另配远程Runner。任务9项解析测试、既有Node16/Python8、Python质量fix/check通过；两次解析失败、DNS失败及质量体积失败/恢复均有记录。

新建network-recovery.md、source-evidence.md、任务级PoC/测试与请求/响应/目录/失败恢复证据；更新本PRD/台账/G1/研究/项目索引，格式化原source-probe.py，不改产品app、保护配置或共享Harness。压缩响应在共享工作区由manifest引用，交接仅提交UTF-8文档；原浏览器能力证据复用，不声称本轮推荐原型已完成。设计须重新完成原型、HLD、契约和G2。
