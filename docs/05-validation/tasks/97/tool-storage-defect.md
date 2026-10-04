# Issue #97 共享浏览器断言缺陷与返工输入

## 当前：已解除，以下保留历史缺陷与失败

用户提供上游修复提交eab78c2及runtime部署说明，design独立复验1-17零写通过、1-18实际1≠0负向检查成功、1-19原生能力/1-20～26原型计划/1-27四组矩阵通过，完整verify8项通过。当前不再Blocked；本轮恢复及研发再验责任见 [design-rework.md](design-rework.md)，旧工具参数错误和失败记录不删除、不改写为通过。

## 上轮返工输入（历史）

design本轮独立重现并核对：app四组原生布局/AX及原始值执行后在同一零写门禁失败（design-1-10），注册verify仍失败；原型修复前160 CSS px失败（1-11）、同步footer限制后原样8动作通过（1-12），原型既有空态计划零写仍失败（1-13）。未改上游工具、原门禁或产品决定，最新Owner修复/双向回归/同步及恢复条件见 [design-rework.md](design-rework.md)。不向QA转移相同缺口。

## 结论与责任边界

版本的160 CSS px布局缺陷已在产品CSS中修复；原样的version-layout.js及browser-native-capabilities.json复验通过。当前阻塞不再是zoom/AX能力缺失，而是升级后的共享浏览器工具有一个实际断言调用错误，连零写入计划也必定失败。研发不得改公共Harness、受保护配置或把原验收断言删掉；需要Owner在共享工具上游修复并同步受审查版本，再回到development完整复验，随后才交独立QA。

这属于验收能力依赖返工，接收目标design用于承接验证依赖与Owner协调，不要求更改页面设计、PRD或AC。授权为本轮Runner自主推进策略下基于真实缺陷的普通上游返工，非用户已审查批准或QA已证实。没有P0产品决策，无需再次形式审批。

## 可复现证据

- 共享工具准确位置：`/Users/zhaojiuzhou/work/agent_platform/examples/github/tooling/full_harness/browser/check.cjs` 的unchanged_storage_writes分支。只读取定位，没有修改。
- 当前调用形状为 `assert.equal(storageWrites, observations, writeSnapshot, "localStorage write attempts changed")`；升级后多传了observations数组，将writeSnapshot数字当作第三个message参数。
- Node断言的实际失败：`The "message" argument must be one of type string or function. Received type number (0)`；触屏计划则为number(2)。这不是书单真的新增写入的断言失败，而是比较函数参数错误。
- [独立最小复现](reproduce-tool-storage.cjs)：`node docs/05-validation/tasks/97/reproduce-tool-storage.cjs` 不启动浏览器、不读用户数据、不改工具；零写计数同样触发TypeError。正常三参数 `assert.equal(storageWrites, writeSnapshot, message)` 在相同零写计数通过。此处只作为上游修复建议，不在产品工作区改工具。
- [1-14](browser/development-1-14/browser.json)：四组缩放/布局/基线/AX断言已执行，最后unchanged_storage_writes报参数错，storageWrites=0，整体仍是Failed。
- [1-15](browser/development-1-15/browser.json)：产品主计划空态/刷新/原始值通过后，在第一次零写检查报同错；[1-16](browser/development-1-16/browser.json)：触屏筛选/显示通过后在零写区间报同错，计数2是此前正常添加和已读操作。
- 注册verify实际失败；[当前gate记录](delivery-checks/checks.json) 前5项exit_code=0，第6项feature exit_code=1，后续Node/Python gates未执行，不能沿用此前8项通过结论。

## 保留成果及最小解除方案

1. 保留当前产品修复：仅footer新增max-width:100vw，不动body min-width:320px、main布局、业务JS、存储或版本文案。不要回滚此修复来掩盖工具错误。
2. 上游修复unchanged_storage_writes调用签名，增加“无写入应通过”和“确实新增写入必须失败”的工具自身回归；由Owner同步已审查工具版本。本仓库不改Harness或工作流。
3. 不修改已有browser-plan.json、browser-touch.json、browser-fixture.json、tests/browser/core.json及version-layout.js断言。补充的browser-layout-regression.json也保留零写门禁。
4. 回到development重新运行核心、专项、触屏、旧数据fixture、原生能力原计划、四组布局/AX计划、共享fix/verify。检查零写观察、真实AX树及缩放数据，保存实际结果；重新声明release兼容性。
5. 原生版本文字原样可见/完整与AX能力已成立，参见1-12，但此前行为测试/旧数据及本轮失败计划不能当作当前全部验收已通过。只有全门禁实际通过才自动交独立QA。独立QA会复核AC；最终合并及高风险发布保持人工授权。
