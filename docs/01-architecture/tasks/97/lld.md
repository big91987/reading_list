# Issue #97 LLD

2026-10-04，本轮恢复复验。沿用 [HLD](hld.md)、[契约](contracts.md)；需求追溯为 PRD AC-01～AC-06。

## 呈现与维护

app/index.html 原 footer 内改为 p.footer-motto（原文不变）和 p.app-version；后者仅一个 span#app-version 保存精确字面值 `0.1.0 rc2`。完整普通文本为“版本 0.1.0 rc2”。没有按钮、tabindex、title、aria-label、aria-live，避免冗余读出和无用途焦点。未来维护者只更新该产品节点及期望断言。

app/styles.css 为原文清除段落默认边距，版本设 margin:8px 0 0、color:var(--muted)、font-size:0.875rem、line-height:1.5、letter-spacing:0.02em。保留footer居中及padding，自然文档流；不使用fixed、nowrap或ellipsis。footer新增max-width:100vw，防止既有body最小宽度320px在原生200%/160 CSS px下把版本居中到视口外。不改body/main最小宽度或业务布局。无产品JS修改。

## 数据、故障及回退

无函数/API签名变化，无version状态/键/事件/网络。现有 localStorage `page-between-reading-list` 与数组字段保持，版本不执行任何写入或解析；书单加载/写入错误不会移除静态footer。HTML加载失败沿用既有行为。回退仅删除新增节点及样式，不清除数据。发布兼容声明须在本轮测试后生成，compatible_from明确为实际已验证仓库基线，不冒称部署基线。

## 可执行契约

静态测试断言单节点、大小写/空格、原文、无新增脚本/ARIA/焦点，以及样式/视口宽度规则；注册产品浏览器计划断言空/混合/筛选/无结果/错误/刷新可见。保留Owner核心计划，加改名/撤销、中文存储及零写区间。320px、桌面、键盘和触屏上下文分别检查。原生zoom及AX已由升级工具提供，使用原样version-layout.js和browser-native-capabilities.json，不改变原断言；补充四组100%/200%原生矩阵与基线宽度比较。AX普通文本分为同一段落内的“版本 ”与span的“0.1.0 rc2”，分别断言、按树结构核对，不添加ARIA副本。AX树不是读屏语音实测；CSS模拟仍不是原生证据。共享零写门禁旧参数缺陷已由上游修复。本轮原样零写正例通过、新增写负例实际Failed（1 !== 0），产品6计划159动作及完整8项verify通过；历史失败保留在验证报告，不修改或绕过门禁。原生160 CSS px整体文档320宽与HEAD基线相同，仅本次版本文字完整性修复。
