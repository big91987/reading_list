# Issue #100 设计交付索引

2026-10-04新一轮设计，G2 HLD READY，按Runner自主策略交development；不是用户逐项批准、产品AC/QA/上线通过。具体交接以本轮工具回执为准。旧[rework](rework.md)保留为失败历史，网络恢复已由[最新上游记录](../network-recovery.md)与本轮具体原页复核闭环，不沿用旧放行。

## 原型与交互

- [运行/交互说明](../prototype/README.md)、[入口HTML](../prototype/index.html)、[样式](../prototype/styles.css)、[交互JS](../prototype/prototype.js)、[6条真实来源子集/原创简介](../prototype/catalogue.json)：完整可运行静态原型，无API密钥/npm依赖，独立演示存储。
- 推荐桌面/320、触屏长信息、原生200%及书单截图索引在[设计验证](../../../../05-validation/tasks/100/design-validation.md)。PNG保留共享工作区，不作为UTF-8交接文件上传。

## 架构与评审

- [HLD](../../../../01-architecture/tasks/100/hld.md)：全景、能力/责任、部署/故障、采集运营CLI、调度与分发、比较/风险。
- [数据/接口契约](../../../../01-architecture/tasks/100/contracts.md)：C-01..05，目录身份/schema/摘要/日期、私人快照、用户确认/改名/撤销、缓存/状态、原子更新、兼容/回滚。
- [架构决策台账](../../../../01-architecture/tasks/100/architecture-decisions.md)：A-001..06，来源/依赖/验证/可逆退出，Runner授权推荐而非用户答案。
- [11R/12AC追溯](../../../../01-architecture/tasks/100/traceability.md)：保留来源、验证方法与开发/QA责任，不豁免后端或发布检查。
- [G2自查](g2-review.md)：本轮评审依据、整改闭环、剩余非阻断开发事项，无范围裁剪。

## 真实验证集合

- [design-validation](../../../../05-validation/tasks/100/design-validation.md)为本轮验证权威说明；[audit脚本](../../../../05-validation/tasks/100/design-audit.py)与[快照报告](../../../../05-validation/tasks/100/design-audit.json)。
- [两源具体原页复核脚本](../../../../05-validation/tasks/100/design-source-recheck.py)、[报告](../../../../05-validation/tasks/100/design-source-recheck/report.json)；3个HTTP200、32解析条目、2组织/3非空类型，原响应gzip/hash由报告引用，不推断许可或生产服务通过。
- [运行机制测试](../../../../05-validation/tasks/100/runtime-feasibility-test.py)、[4项日志](../../../../05-validation/tasks/100/runtime-feasibility.log)，不是生产tick安装测试。
- 最终计划：[main](../../../../05-validation/tasks/100/browser-main.json)、[touch](../../../../05-validation/tasks/100/browser-touch.json)、[keyboard](../../../../05-validation/tasks/100/browser-keyboard.json)、[security](../../../../05-validation/tasks/100/browser-security.json)、[failures](../../../../05-validation/tasks/100/browser-failures.json)、[layout](../../../../05-validation/tasks/100/browser-layout.json)。任务级page_script由计划精确引用，全部路径在`docs/05-validation/tasks/100/browser-scripts/`。
- 原始结果：[main 1-9](../../../../05-validation/tasks/100/browser/design-1-9/browser.json)、[touch 1-10](../../../../05-validation/tasks/100/browser/design-1-10/browser.json)、[keyboard 1-11](../../../../05-validation/tasks/100/browser/design-1-11/browser.json)、[security 1-12](../../../../05-validation/tasks/100/browser/design-1-12/browser.json)、[failures 1-7](../../../../05-validation/tasks/100/browser/design-1-7/browser.json)、[layout 1-8](../../../../05-validation/tasks/100/browser/design-1-8/browser.json)；每目录包含executed-plan、截图，有AX/zoom动作的目录另有相应证据。
- [失败及导入大小处理](../../../../05-validation/tasks/100/evidence-archive.md)、[历史截图别名/hash](../../../../05-validation/tasks/100/evidence-aliases.json)、[可恢复脚本](../../../../05-validation/tasks/100/evidence-deduplicate.py)：101个字节相同历史截图原字节保留；未改回执、门禁或独有图像。

## 新建、更新、复用与未完成

新建：本轮prototype/5文件、架构4文件、G2报告、设计验证/任务级测试/浏览器6计划及脚本、来源重核与证据快照、audit、可恢复截图别名。更新：本索引、任务README与docs/README；仅因实际导入上限对#82/#94字节相同历史PNG进行别名归档，所有canonical字节及旧JSON回执保留。完整本轮设计依赖与hash集合见audit报告。

复用未改：PRD、需求台账、G1及网络恢复/源PoC脚本/34条目录/原响应、现有app与部署脚本/规范。未修改app/release/保护配置、未安装任何服务/调度、未发布或Git写/直接GitHub调用。

开发继续：正式采集/原创摘要、公共目录只读路由/受审查controller升级、tick与启停/恢复、生产app元信息/兼容/安全/完整核心回归、部署基线与数据声明及所有必需质量门禁。QA独立放行；正式Owner安装/最终合并/高风险部署人工授权。无需用户普通确认问题。
