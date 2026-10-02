# Issue #76 需求—设计—验证追溯

> 设计承接全部16条AC；Covered只指设计覆盖，不代表产品验收。具体设计已获A-001批准；用户「ok 继续推进吧」授权交接研发。

H=本目录hld.md；C=contracts.md；I=任务design/interaction.md；V=docs/05-validation/tasks/76/design-validation.md。LLD Owner均为研发；视觉批准为Owner。

| requirement_ref | architecture_driver / hld_mapping | decision_refs | validation_ref | lld_owner / status |
|---|---|---|---|---|
| AC-01 / FR-01 | H§2/7、I§1：区域、卡片、字体层次变化 | D-001/02→A-001 | V：visual截图；Owner审查已批准 | 前端呈现 / Covered（批准Accepted） |
| AC-02 / QR-01 | I§2/3、H§7：四宽度、入口与长名 | A-001 | desktop/mobile/states/visual，四宽度溢出测量；产品逐宽回归待做 | 布局/焦点 / Covered |
| AC-03 / FR-02 | C§3/4：追加未读、切all、刷新、连续新增 | D-002 | desktop/states；严格动画内提交时序与存储断言待做 | 清单/保存 / Covered |
| AC-04 / FR-02 | C§2/3/5、I§3：单编辑、字段隔离、草稿／组合输入 | D-002 | desktop/mobile/keyboard；真实中文输入法待做 | 编辑/输入法 / Covered |
| AC-05 / FR-02 | H§4/5、C§3：全局统计、双向状态、筛选退出 | D-002 | desktop/states/density/keyboard；原存储断言待做 | 清单/派生 / Covered |
| AC-06 / FR-02 | C§3/4：先保存再删除、目标退出不复活 | D-002 | desktop/states/density/keyboard；刷新删除回归待做 | 删除/焦点 / Covered |
| AC-07 / FR-02/04 | C§1/3：trim、全局去重、80长度、历史长名 | D-002 | mobile/states；80/81及隐藏重复产品fixture待做 | 校验/兼容 / Covered |
| AC-08 / FR-02/04 | C§1/4/6、H§6：失败不提交、旧数据不首开写回 | D-002 | mobile/failure原型抛错；正式存储快照断言待做 | 保存/恢复 / Covered |
| AC-09 / FR-03 | I§4、H§7、C§5：全部候选取舍与实例取消 | A-001 | motion中间帧采样、动画实例及静态截图；产品时序／GPU不已验收 | 动效 / Covered |
| AC-10 / QR-02 | H§4、C§4/5：事件同步、无业务完成回调 | A-001 | desktop/density快速动作与motion主动取消；严格实际时序待做 | 动效/并发 / Covered |
| AC-11 / QR-02 | I§4、C§5：媒体查询、运行时取消、静态反馈 | A-001 | visual/density/motion演示减少模式；系统偏好实际测试待做 | 动效/可访问性 / Covered |
| AC-12 / QR-03 | I§3、C§5：原生语义、焦点、读屏反馈 | D-002/A-001 | keyboard主要链路；读屏/真机待做 | 可访问性 / Covered |
| AC-13 / QR-01/02 | I§2/4/5、H§7：空/单/混合/长名/100本 | A-001 | states/density/motion；无帧率/容量承诺，性能观察待做 | 布局/性能 / Covered |
| AC-14 / FR-04 | I§5、H§6、C§4：三个空态、成功/失败，无假加载 | A-001 | states/mobile/empty/failure | 呈现/异常 / Covered |
| AC-15 / QR-04 | H§1/8、原型README和完整设计索引 | A-001 | V与九计划、原型三运行文件 | 设计/研发承接 / Covered（批准Accepted） |
| AC-16 / QR-04 | H§8：产品浏览器、证据与草稿PR由Runner | D-002/A-001 | 明确后续阶段，不宣称当前已发布 | 研发/Runner / Covered（NEXT STAGE） |

反向核对：装饰图形属于PRD允许的可选呈现，比例线是现有统计派生；演示工具与诊断只服务原型验收，不成为新增产品能力。没有搜索、真实封面、云端、账号、主题或新存储字段。HLD三个责任区与来源表、流程图、契约所有者一致，没有虚构服务／事实源。

## 研发证据接续

以上表保留设计阶段当时的证据范围，历史“待做”不代表当前研发状态。2026-10-02产品实现、[LLD](lld.md)与[逐AC验证](../../../05-validation/tasks/76/validation.md)已形成，26组集成与四宽度/核心/键盘公开动作通过；AC-11/12的系统偏好、IME/读屏及真机仍待人工，AC-16 Runner正式门禁/草稿PR待执行。无布局/业务/动效取舍偏差，不改上游批准。
