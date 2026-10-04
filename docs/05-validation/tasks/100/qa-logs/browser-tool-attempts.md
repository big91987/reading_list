# QA 注册浏览器调用记录

本轮工具真实返回，2026-10-04。下列错误是执行准备/工作区导入故障，不是产品缺陷，没有browser passed回执。

| 顺序 | 计划/动作 | 真实返回与处理 |
|---|---|---|
| 1 | main，包含上游inline source | `Expected action data; inline source is not accepted`；删除QA计划内source，保持script路径，后续工具自动加载原文件 |
| 2..8 | main/network/candidates/touch/keyboard/storage/core | qa-1-1..qa-1-7全部passed，回执/执行步骤原字节独立保存 |
| 9 | catalogue | qa-1-8 passed，32条全量分类/来源/布局/AX |
| 10 | manual第一次 | `Workspace exceeds import limit`；尚未执行 |
| 11 | manual第二次 | 去重15张QA重复图后仍`Workspace exceeds import limit`；尚未执行 |
| 12 | manual第三次 | 无损gzip大AX并去重5张本輪verify重复图后qa-1-9 passed，16动作 |
| 13 | dedup第一次 | `Workspace exceeds import limit`；尚未执行 |
| 14 | dedup第二次 | 无损gzip另3份AX后qa-1-10 passed，11动作 |

注册verify另一次真实返回`Product checks passed. Current records: docs/05-validation/tasks/100/delivery-checks/checks.json`，八项均exit0。报告明确其原门禁通过并不覆盖QA新增已证实的运输层边界失败。

原PNG别名20项、4份AX gzip均经本轮qa-audit核对长度/hash和解压字节；回执JSON未改。所有独有截图保留；工具准备故障不被改成产品失败或功能通过。
