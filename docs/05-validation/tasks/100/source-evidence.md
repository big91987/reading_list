# Issue #100 来源内容验证证据

日期：2026-10-04。用途：需求返工PoC与后续设计输入，不是产品交付/版权许可/周期运行证据。

## 原始记录

- [旧DNS失败](source-probe.json)、[原探测脚本](source-probe.py)、[恢复结果](source-probe-recovery.json)：原脚本直接复跑，两站HTTP200。
- [内容PoC脚本](source-poc.py)、[解析单测](source-poc-test.py)：Python标准库，固定公开HTTPS域名白名单，重定向也校验域名，响应上限2MiB，25秒超时，串行请求间隔1秒；不执行原网页脚本、不请求图片/豆瓣/OPAC外链，不接触用户数据。
- [成功报告](source-poc/report.json)、[请求响应manifest](source-poc/manifest.json)、[解析目录](source-poc/catalogue.json)：34条研究记录；完整简介只作核对依据，不是原样发布内容。来源和产品类型分别记录。
- [第一次失败](source-poc-attempt-1/failure.json)与[原始响应引用](source-poc-attempt-1/snapshots.json)：7份响应保留；当时未写请求manifest，不能声称有该次时间/headers。
- [第二次失败](source-poc-attempt-2/failure.json)、[原始请求manifest](source-poc-attempt-2/manifest.json)与[响应引用](source-poc-attempt-2/snapshots.json)：8份请求；题名/作者inline格式失败记录保留。

最终响应 `source-poc/response-01.html.gz` 至 `response-11.html.gz` 保存在共享工作区。SHA256/bytes指解压后的真实响应字节；gzip只是存储压缩，失败尝试相同字节的快照共享这些文件。交接工具只接收UTF-8文档，因此提交上述脚本/JSON/说明，压缩原始证据由manifest索引，供design在共享工作区读取；不把gzip或PNG当UTF-8文档提交。

## 响应索引与语义

| 编号 | 用途 | 状态与解析 |
|---|---|---|
| 01、02 | 中国作家网、福建省图书馆robots.txt | HTTP404，不表示获得抓取许可 |
| 03 | 中国作家网文学好书专题 | HTTP200，推荐项目说明、链接入围书单 |
| 04 | 2026第四期入围书单具体正文 | HTTP200，30条书名/作者/门类/文字推荐语；入围不是全部获选 |
| 05 | 福建馆首页新书推荐栏目 | HTTP200，发现实际详情页链接，不以首页内容替代书目解析 |
| 06–09 | 福建馆四个详情页 | HTTP200，4条题名/作者/索书号/文字简介 |
| 10 | 福建馆法律声明 | HTTP200，站点版权/公益声明；未取得再发布授权 |
| 11 | 国家图书馆版权声明 | HTTP200，内容使用/采集权益限制；默认自动源替换，不绕过限制 |

具体URL、时间、编码、响应hash和文件名以manifest为准，不在这里复制原文。实测三类产品类型为历史社科、现当代文学、科普；仙侠/古典文学筛选仍按PRD可为空，不伪造覆盖。library的科普来自B84-49分类映射，是Agent产品归类，不冒称源站直接标注。

## 复现与验证

```sh
python3 docs/05-validation/tasks/100/source-probe.py
python3 docs/05-validation/tasks/100/source-poc-test.py
python3 docs/05-validation/tasks/100/source-poc.py
python3 full_harness/quality.py fix
python3 full_harness/quality.py check
node --test tests/*.test.cjs
python3 -m unittest discover -s tests -p '*_test.py'
```

复跑live脚本会覆盖成功输出目录；历史失败与其共享快照必须先保留副本，或在独立复制的任务目录运行，不能破坏旧manifest的hash对应关系。解压可用Python `gzip.decompress(Path(snapshot).read_bytes())`；以manifest指定编码解码，不执行HTML内容。

本轮测试先失败再实现，后续针对真实inline简介与inline元信息加入回归；最终9项任务单测通过。既有Node16项、Python8项通过。质量包装命令初次因workspace超过60MB导入上限失败；没有改上限或共享Harness，以byte equality/SHA256去重重复响应并无损压缩后，按要求fix/check均通过。该初始失败不删除、不写成一开始即通过。

## 未验证范围

推荐产品UI、古典/仙侠内容覆盖、上线原创简介、定期调度、目录分发、缓存故障、数据升级/回滚和独立QA尚未完成；本报告不能令AC-01至12整体变为Passed。原有design浏览器能力探测仍只是能力证据。
