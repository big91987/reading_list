# 历史研发验证档案（不是当前结论）

本文件仅保留恢复前的原报告及真实失败。当前结论见 [validation.md](validation.md)。历史PNG已无损归档，见 [恢复说明](browser-archive/README.md)；JSON回执未修改。

# Issue #97 development 验证记录

## design恢复接续（当前覆盖说明）

用户通知上游修复并要求继续；design已重新执行零写正反回归、原型/native能力、产品四组layout/AX及注册verify，8项门禁全部退出0，详见 [当前设计恢复实测](design-rework.md)。共享工具阻断现已解除。本段仅记录design实际运行结果，后续development接收后仍须全量复验core/feature/touch/fixture/native/layout、fix/verify，更新本研发报告和发布声明，再交独立QA，不把design Ready当作QA验收。下文为上一轮development返工历史，包括真实失败，不再代表当前runtime故障。

## 前次development返工记录（历史）

## 当前结论

版本展示及本次原生缩放缺陷已修复；原生200%和AX验证能力缺口已解除，不沿用上一轮“工具不支持”的当前结论。当前为 **Blocked by shared validation defect**：升级工具的unchanged_storage_writes把数字计数错传为Node断言的message，零新增写也报TypeError；注册verify真实失败，因此不能宣称全门禁通过或交独立QA。依据本轮自主推进策略形成[上游工具返工输入](tool-storage-defect.md)，需Owner修复共享工具、design重核受影响验证依赖、development完整复验后再交QA。交接执行以工具回执为准。

验证对象为工作区app；兼容基线为仓库HEAD `4a54b10f8acad8f74a167693194c397b93db9adc`，不冒称线上部署基线。没有Git写操作、直接GitHub调用、PR、合并或发布，没有伪造人工批准。

## 可运行成果、根因与最小修复

预览命令：`python3 -m http.server 8000 --directory app`。原页脚“一本一本，慢慢读完。”保留，新增唯一普通文本“版本 0.1.0 rc2”。产品仍只修改app/index.html和app/styles.css，无业务JS、存储、API、配置或资源请求变化。

用户提供[1-9失败证据](browser/development-1-9/browser.json)，本轮原样重测[1-10](browser/development-1-10/browser.json)稳定复现：320px窗口原生200%成为160 CSS px视口，既有body min-width:320px让footer宽320px，文字右边界200.796875超出160。任务级[诊断1-11](browser/development-1-11/browser.json)临时只给footer设max-width:100vw后，footer变160，版本文字范围39.1953125～120.796875落入视口，整页宽仍320，与旧body/main行为相同。诊断恢复样式，不写数据。

因此只在footer新增 `max-width:100vw`，不改body/main、书单组件或tooltip。新静态回归先失败、加此规则后3项版本测试通过；全套Node16项通过。原样version-layout.js和browser-native-capabilities.json均保留，没有修改失败断言或降低AC。[原计划1-12](browser/development-1-12/browser.json)8动作全部通过：桌面/窄屏原生200%、完整版本边界和AX，storageWrites=0。

## 条款来源、验证方式与负责阶段

所有已接受AC继续保留。下表说明来源，而不是重新批准或新增产品承诺；产品最终放行由独立QA复核，研发自己负责的检查不能转移来绕过失败。

| AC | 来源 | 验证与责任 | 本轮状态 |
| --- | --- | --- | --- |
| AC-01 | 用户明确版本0.1.0 rc2；保留原文/只读页脚为Agent推荐默认，已纳入上游基线 | development：唯一值、文本/样式Node、实际产品可见；QA复核 | 当前版本单元及原生实际产品通过；旧桌面/触屏截图保留 |
| AC-02 | Agent推荐状态独立规则及项目既有书单约束，已纳入基线 | development：空/混合/三筛选/无结果/错误/刷新；QA复核 | 上轮1-6通过；本轮1-15在第一次零写检查因工具错停，完整重跑待上游修复 |
| AC-03 | Agent推荐可读性/320px/200%/无新增溢出，已纳入基线 | development：native zoom、原样version-layout.js、新增基线/遮挡断言；QA复核 | 1-12原样计划通过；1-14四组几何及无新增溢出断言已执行通过，但计划整体因共享零写门禁Failed |
| AC-04 | Agent推荐普通可访问文本/无无用途焦点；项目既有键盘/触屏交互约束，已纳入基线 | development：真实AX树或朗读二选一、焦点断言、键盘/touch；QA复核，不要求凭空新增人工语音门禁 | 1-12及1-14实际AX、无版本焦点通过；本轮触屏1-16在共享零写门禁停止，键盘主计划未执行到末段。AX树不代表语音已测 |
| AC-05 | 项目既有存储兼容及错误恢复；Agent推荐精确原始值/零新增写，已纳入基线 | development：中文/扩展字段/异常加载/恢复、原始值及写入观察；QA复核 | 上轮1-5/6/7通过；当前app.js字节不变，1-14几何脚本存储值保持/总写0；完整故障/旧数据重跑待修复共享断言 |
| AC-06 | 项目既有核心、改名、删除撤销约束；Agent推荐版本无新网络入口，已纳入基线 | development：核心/专项/资源引用/JS字节；QA复核 | 当前verify核心通过，资源引用/JS字节相同；专项被公共工具错截断，不宣称全套当前通过 |

新增断言仅细化AC-03/04的版本边界、遮挡及无新增文档宽；不是新增业务要求。page_script权限为隔离DOM环境，已实际执行，无宿主命令。没有新增人工设备/语音门禁，物理设备、跨引擎和语音不冒称已测。

## 原生缩放与AX实测

[1-12](browser/development-1-12/browser.json)原样用户计划通过；[1-14](browser/development-1-14/browser.json)包含下列实测观察，四组所有几何/AX断言通过，但最后零写工具报TypeError，整体仍记录为Failed：

| 物理窗口 / 原生zoom | 布局视口 / DPR | 版本文字左右边界 | 页脚左右边界 | 产品文档宽 / 移除本次footer变更的基线宽 |
| --- | --- | --- | --- | --- |
| 1440 / 100% | 1440 / 1 | 679.1875 / 760.796875 | 0 / 1440 | 1440 / 1440 |
| 1440 / 200% | 720 / 2 | 319.1953125 / 400.796875 | 0 / 720 | 720 / 720 |
| 320 / 100% | 320 / 1 | 119.1875 / 200.796875 | 0 / 320 | 320 / 320 |
| 320 / 200% | 160 / 2 | 39.1953125 / 120.796875 | 0 / 160 | 320 / 320 |

基线方法为临时还原HEAD footer原文和max-width:none，保留相同body/main/业务JS，再恢复原节点；不是声称线上基线或全面旧版重放。160 CSS px下整页仍有旧min-width造成的横向宽度320，**不宣称整页完全无滚动**；新版本不超出视口、不增加基线宽度且不遮挡main。这个边界符合“无新增横向溢出”，没有扩大范围去改既有书单布局。

AX真实文件为[桌面200%](browser/development-1-12/accessibility-4.json)、[160 CSS px](browser/development-1-12/accessibility-8.json)及1-14八个accessibility文件，包含未忽略的StaticText“版本 ”及“0.1.0 rc2”，沿parent链归于同一paragraph。树结构与产品span一致，不添加ARIA重复文字或live region，不声称实际读屏器语音。

已打开检查1-10/12 zoom-6.png及1-12 screenshot.png；这些工具截图在该浏览器缩放条件下只捕获上部内容，不能据图宣称底部版本可见。版本完整性依据实际页面Range/元素边界断言、native zoom指标和AX树，不把截图覆盖不足隐藏。待共享工具修复后可继续补充可用的版本区域截图。

## 本轮检查、证据与失败处理

- [Node日志](unit-tests.log)：16项全部通过，0跳过，新增版本视口规则回归；产品app.js与HEAD字节相同。
- [fix日志](quality-fix.log)：Runner指定格式fix完成，三个app文件未改。
- [当前verify](delivery-checks/checks.json)：前5项（diff、Prettier、ESLint、node语法、核心浏览器）exit_code=0；第6项专项exit_code=1。后面的Node/Python gates本轮未执行，**不能写8项当前全通过**。16项Node为另行本地执行；8项Python仅是上一轮历史通过，不当作本轮verify成功。
- [1-15](browser/development-1-15/browser.json)主计划及[1-16](browser/development-1-16/browser.json)触屏因相同公共参数错误停止。原计划动作和断言不改、不删除、不重排来跳过错误。
- [工具缺陷报告](tool-storage-defect.md)、[最小复现](reproduce-tool-storage.cjs)、[复现日志](tool-storage-reproduction.log)定位具体根因。只读共享源码，未修改公共Harness/受保护配置，未用shell重启Chromium或换旧工具冒充升级后的门禁通过。
- [产品快照hash](fixture/source-hashes.json)已按当前修复重建；三文件来自app字节，HTML/CSS资源引用与HEAD相同。诊断源码fixture/为事实源，prototype/product-validation/仅是Owner允许根内生成测试载体，不交付产品。
- [本轮审计](evidence-audit.json)：55个本地链接、3个产品快照hash、核心计划字节及原样version-layout.js源码均核对通过；两份真实AX树label/value确属同一paragraph。任务脚本与构建脚本node --check、git diff --check通过；类型检查不适用，没有TS或编译构建步骤。
- 发布兼容声明仅记录app无业务/数据转换及实际仓库基线；本轮重声明须明确共享验证尚未通过，不是部署或QA放行。

历史1-1核心、1-5触屏、1-6专项、1-7旧数据diagnostic通过证据仍保留；早期1-2焦点计划错误、1-3文案错误、1-4不支持Shift+Tab、1-8旧工具不支持zoom也保留，但不是当前阻塞。1-9/10证明本次实际布局缺陷，1-11诊断、1-12修复后原样通过闭环。新增1-13失败来自补充AX计划把两个StaticText误认为一个连续name；按实际树核验后分开断言“版本 ”与value，原样用户计划/AC未改，1-14全部AX断言通过。1-14最后的公共零写错误仍未解决，不能将其整体标通过。

## 交付自查及后续

Trellis/Delivery自查已执行：静态单层改动，没有API/存储签名变化、debug入口、无关重构或重复产品事实源；新视口契约写入LLD及frontend/page-version.md。全部AC来源、责任和验证方法明确；当前状态、真实成功/失败/未执行及最小复现都有证据。没有删AC以换放行，也没有用AX树伪造人工语音。

当前T01完成；T02因共享工具缺陷Blocked；T03 QA交接不可领取。建议按自主策略返工design承接Owner共享工具修复，保留产品修复和既有产品决定，仅重开受影响验证能力及G2就绪结论。同步已审查工具后重新进入development，重跑当前所有计划/共享verify，更新兼容声明与本报告，再自动交独立QA。不沿用本轮未达标结论作放行依据，不把同一个公共缺陷原样交给同样会失败的QA。

