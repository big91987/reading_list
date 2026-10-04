# 推荐功能运行、来源治理与恢复

## QA返工后的当前预览与监控

本轮只修复采集网络限流/截止，不改变推荐交互、私人存储schema或产品release指纹。本机最新未发布预览`http://127.0.0.1:5535`，使用临时`/private/tmp/reading-list-100-rework`的真实32条目录；调度disabled，原5533服务不变，不含原origin私人书单。复现：`python3 docs/05-validation/tasks/100/preview.py --root /private/tmp/reading-list-100-rework --port 5535`。

报告requestedAt现在是实际发送前时刻，completedAt为响应读取完成，startedMonotonic/durationSeconds用于同轮发送间隔与耗时核查；旧报告requestedAt曾在完成时取时，不应跨版本混用。DNS/连接/TLS/发送/读取全部受剩余300秒预算约束，耗尽即size_limit并沿用保旧与一小时失败due。DNS底层OS解析可能晚返回，但其结果被丢弃，不再发HTTP；socket超时shutdown中断在途TLS/读取，不等待阻塞线程结束才释放业务锁。正式安装及controller/collector更新仍需Owner显式审查。

这是产品运维说明，不是安装或部署授权。默认根为Owner的`~/.local/share/reading-list-preview`；开发演示只使用`/private/tmp/reading-list-100-development`，不改既有5533服务。

## 开发预览（已运行）

```sh
python3 scripts/recommendations.py init --root /private/tmp/reading-list-100-development
python3 scripts/recommendations.py run --root /private/tmp/reading-list-100-development
python3 scripts/recommendations.py validate --root /private/tmp/reading-list-100-development
python3 docs/05-validation/tasks/100/preview.py --root /private/tmp/reading-list-100-development --port 5534
```

在本机打开`http://127.0.0.1:5534`。这是未发布的工作树应用和真实采集公共目录，不是生产release。不同端口是不同origin，**不含5533上的私人书单**；不得把它误当成原origin迁移完成。首次我的书单为空，推荐页可查看32条；类型、简介可手动保存，官方来源链接由用户主动打开。没有目录时推荐显示失败，本地书单仍可用。

## Owner审查后的正式安装

仅Owner执行；本轮没有调用安装器、launchctl或切换current release。

1. 审查当前产品controller/collector改动，备份现有controller文件。普通app发布不会替换controller；不要只更新app就宣称推荐后端就绪。
2. 明确接受固定两源的使用边界：没有概括性授权；公开目录只有原创事实短概述、身份、归属和原页链接，不能放研究长评/封面。中国作家网摘要根据来源介绍中出现的受控内容词生成，不复制原句；福建馆使用两个经证据验证的句式。未知/缺失证据使该源整轮失败，不编造简介。
3. `python3 scripts/install_local_preview.py --recommendations --root ROOT`审查后安装现有预览controller和独立小时tick。安装不会发布app，也不会启用采集；新worker plist不写无限增长stdout日志，结构化报告是诊断入口。
4. 执行init→run→validate。validate给出schema和ready；首次至少两个独立组织、三个非空类型且完整目录才ready。抽查出处/短概述，然后`enable`。
5. `tick`为RunAtLoad+每小时唤起；七天due，到期一次采集，睡眠/关机恢复补检查，不逐个补跑错过的周期；partial/failed一小时后再尝试。关闭tick零外网请求；manual run不受关闭状态限制。

## 正式CLI

所有命令都接受`--root ROOT`，根不是recommendations子目录。固定source ID为writer/fjlib。

| 命令 | 行为 |
|---|---|
| init | 幂等创建配置/关闭调度，不清空既有数据 |
| validate | 配置/schema/链接/身份/来源说明约束校验，ready是初次覆盖门槛，不等于许可或QA |
| run / tick | 手动执行 / 到期检查；报告区分not_due/disabled |
| enable / disable | 启停调度，保留due及已发布目录；初次未ready拒绝启用 |
| status | 状态、来源配置、当前公共目录；不访问浏览器私人数据 |
| source list | 查看固定来源 |
| source enable/disable --id ID | 启停特定来源；policy导致暂停后必须Owner审查原因再启用 |
| source remove --id ID | tombstone；立即用剩余源快照重建内容/出处，未来run不复活旧源；私人已采用快照不动 |
| uninstall | 停调度、bootout并删除本产品worker plist；保留全部目录/配置/报告与预览服务 |

退出码：0成功或due无动作，1failed/partial，2配置/schema，3锁busy且零请求。报告保存ROOT/recommendations/reports，最近三次/30天及最近一次失败；含请求时间、状态/长度/hash、短概述依据hash、来源结果、revision和nextAttempt。没有私人书名/简介作为网络参数。

现有配置页是**固定推荐页集**，周期重新读取这些页；不是全站爬虫、全网搜索或“最新全部榜单”。Owner需要扩展/替换具体pages时，编辑config.json中既有source的pages，仍只接受固定host/path和预算；先validate/run/抽查再启用。writer必须含文学好书入围语义和完整记录；fjlib只支持已审查事实句式，未覆盖的新书证据将拒绝发布并保旧，必须先评审/扩充句式和测试。remove不可被source enable撤销；恢复来源需Owner明确重建配置，不属于无人值守自动行为。

## 故障与回滚

403/429或robots拒绝暂停源且不重试，robots404并非许可；超时/5xx最多重试一次。白名单HTTPS、DNS全局IP检查及实际连接IP固定，重定向重新校验；50请求/源、2MB/响应、500记录/源、整轮5分钟。单个字段或必需简介无效则源整轮失败。有效源与最后成功缓存合并原子发布；首次全失败不发布空目录（HTTP503）。源退出显示coverage_insufficient，不伪称首版覆盖仍完整。首次ready状态记录在state，不因合法退出而禁止之后恢复调度。

锁争用不清锁；进程退出自动释放。catalogue临时文件fsync/replace，报告失败不删除有效发布，下一次tick从公共时间对账恢复state。停用前先`disable`，备份整个recommendations目录；恢复时停worker，保留原副本后恢复目录、validate、检查revision和各源时间，再Owner授权启用。只读服务仅公开catalogue.json，配置/报告不经HTTP公开。

撤回新版app后旧版看不到bookInfo，但实际部署10c5e03基线加载/阅读/改名/删除/撤销保留扩展字段，见验证及baseline快照。旧版改名不会设置needs_review；新版重进时按titleAtAdoption与当前title差异显示待核对，加载仍零写。代码回滚不会恢复用户主动更改的信息。不要清空私人键作为回滚步骤。

## 私人书单原值备份和恢复

在**原本使用的origin**，先关闭其他正在写书单的标签页。在浏览器开发者工具Application→Local Storage中选择`page-between-reading-list`，复制原始Value到本机文本文件（保留空白/未知属性，不上传到Issue）。也可在该origin控制台读取`localStorage.getItem("page-between-reading-list")`并复制完整返回字符串；不要执行陌生网页提供的控制台代码。备份后确认文件可解析为数组，title/read有效；异常原值也保留原文件供人工修复，不把异常读空视为成功。

恢复是用户主动操作：先另存当前原值，检查要恢复的备份，使用Application面板把原始Value完整贴回同一键并刷新；不改存储键/origin，不添加或删除未知字段。恢复旧备份会撤回备份后的主动编辑，应先确认。浏览器专项已测试原始空白/未知字段、写失败保护及恢复后的零写刷新；Node测试实际旧新版往返。独立公共键`page-between-recommendations-v1`可单独删除重试，不能连带清空私人键。
