# 本轮工作区证据导入大小处理

真实失败：首轮原型check design-1-2因同名h3定位歧义失败，改为可访问heading定位后重跑；两次后续check返回`Workspace exceeds import limit`，没有运行浏览器，也没有对应passed JSON。此前requirements已记录工作区约59.59MB接近60MB上限，本轮新截图触发上限。

处理仅机械无损去重历史证据，不修改工具/保护配置/门禁/验收。原任务#82的14个设计截图路径及#94的87个历史截图路径，与同任务保留的canonical PNG逐字节相同；将这些重复路径归档为[原路径别名清单](evidence-aliases.json)，节省12,475,838字节。所有独有图像原字节保留，101项SHA256和长度均已验证；browser.json和历史失败/通过结果未改写。目录索引引用这些旧PNG时，按manifest canonical读取，不把别名缺失当作证据删除。

维护命令（无需网络或Git写）：

```sh
python3 docs/05-validation/tasks/100/evidence-deduplicate.py verify
python3 docs/05-validation/tasks/100/evidence-deduplicate.py restore
```

restore能精确恢复原PNG路径，重复运行不覆盖不同字节；恢复全部会重新增加工作区大小，不应在check前运行。该脚本是任务级证据处理，不是共享Harness修改。后续检查已能正常执行；研发如继续增加大量截图应保留hash与恢复机制，不可删除失败日志制造通过。

development补充：新增真实截图后工作区达到60,207,583字节，core check返回相同导入上限错误（未执行）。新增archive-all在任务证据树中仅去重逐字节相同PNG，保护旧manifest的所有canonical，避免别名链或失效；新增100项节省13,635,263字节，同一manifest现在共201项。独有失败截图、旧回执和全部原始字节继续保留。verify/restore统一覆盖设计及开发新增别名；不改任何验收、浏览器配置或质量门禁。
