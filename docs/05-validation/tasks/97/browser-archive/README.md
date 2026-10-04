# 历史截图无损归档

注册工具导入整个工作区上限为60,000,000字节。本任务多轮历史证据及重复PNG达到限额；仅将本任务旧design轮次和development-1-1～16的PNG按SHA256去重压缩，未删除图像内容、未改像素、未改任何browser.json回执或验收。当前development-1-17及以后截图保留展开。本目录manifest.json保留每个原路径、原大小、原图哈希和pack位置，所有原PNG字节可恢复；每个压缩包小于单文件导入上限。

核验全部历史原图：`node docs/05-validation/tasks/97/archive-history.cjs verify`。

恢复单个旧报告引用的图片，例如：`node docs/05-validation/tasks/97/archive-history.cjs restore browser/development-1-12/zoom-6.png`。恢复的是原始PNG字节，不是重新生成或加工图片。直接旧PNG链接在恢复前不展开，应通过manifest定位；历史JSON与报告仍保持原路径，当前报告注明归档覆盖范围。按需恢复，不要为截图重跑旧测试或把历史回执当作本轮结果。归档非个人会话缓存，需与任务材料一并保存。
