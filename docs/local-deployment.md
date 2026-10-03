# 本机持续预览

## 使用

访问 `http://127.0.0.1:5533`。PR 合并到 main 后，独立的 **Deploy reading list locally** Workflow 自动准备并发布最新版本。也可以在 Actions 中选择该 Workflow → Run workflow（main）；勾选 review 可主动要求人工审批。无需周期任务，也不改变产品阶段 Pipeline 或自动合并产品 PR。

服务由 macOS launchd 常驻运行，Actions Run 结束后仍可访问。Mac 必须开机且此用户已登录；睡眠、关机时无法访问。只绑定本机回环地址，不暴露到互联网。

当前产品的数据是浏览器 localStorage，键为 `page-between-reading-list`，没有服务端数据库。部署不清除它。请固定使用同一浏览器及 `127.0.0.1:5533`；`localhost`、其他端口、隐私窗口属于不同存储环境。清理浏览器站点数据仍会删除书单。服务目录中的预留 data 目录不是浏览器数据备份。

## 发布与审批

1. prepare 从 main 的完整 SHA 提取静态 app，检查 JavaScript 语法、运行现有 Node 测试，校验代码绑定的数据影响声明。
2. 无数据变化且声明有效的版本自动切换。缺失/过期声明、不确定影响、迁移/破坏性变化或部署基础设施变化进入 `local-data-review` 环境等待 Owner 审批。等待期间仍服务旧版本。
3. 在 Run 的 Summary 查看准确版本、影响和迁移方案，再通过 **Review deployments** 批准或拒绝。仅批准当前指定版本；等待期间 main 或已部署版本变化后，旧计划不能覆盖新版本，需要发起新的部署。
4. 切换后检查 HTTP 服务和版本号；失败恢复旧版本。只有当前及曾成功发布的版本可通过 HTTP 访问，待审批版本不可访问。版本目录保留，静态资源带版本路径，避免加载途中混用两版资源。

所有部署串行执行。若旧部署在等待审批而新 main 已到达，可取消旧 Run，让最新部署重新评估，不要批准过期版本。浏览器已打开的页面不会被强行刷新；刷新后使用新版本。

发布声明 `deploy/release.json` 记录整个 app 指纹、数据影响和已验证的兼容基线 `compatible_from`。基线默认取声明时的 HEAD；多次提交尚未部署时，应实际验证已部署版本的数据，再通过 `--compatible-from <sha>` 指定该基线。基线与当前已部署 app 内容不一致时必须审批（仅文档提交造成的 SHA 差异允许通过），避免后续普通改动夹带前一次未批准的迁移。修改 app 后执行：

```sh
python3 scripts/local_deploy.py declare --impact none --notes '说明存储键、字段及旧数据兼容性验证'
```

该命令仅记录开发者判断，不能证明任意代码安全；不可机械地填写 none。迁移/破坏性变化必须使用相应 impact 并提供 `--migration-plan deploy/<plan>.md`。方案需包含旧数据备份、迁移实现、旧样本验证和失败恢复。当前浏览器数据需要应用在转换前备份并保留原值；服务器无法备份用户浏览器数据。回退静态代码不能撤销已经执行的数据迁移。

新增后端或数据库属于部署架构变化，当前静态发布器不提供数据库迁移执行器。应先审查和实现对应迁移与运行支持，再批准发布，不得以删除数据绕过。

## 首次安装与维护

要求 macOS、Python 3.12+、Node.js、Git；同机 GitHub Runner 带 `self-hosted, macOS, ARM64, he-full` 标签。安装后 Runner 与服务使用同一个持久目录。

```sh
python3 scripts/install_local_preview.py
```

如果主机访问 GitHub 需要代理，安装时传入 `--git-proxy <proxy-url>`，会保存到部署缓存仓库配置，后续 Runner fetch 复用同一配置；不把本机地址提交到 Git。

默认持久目录为 `~/.local/share/reading-list-preview`。将打印的绝对目录配置为仓库 Actions variable `READING_LIST_DEPLOY_ROOT`。在发布 Workflow 前创建 GitHub Environment `local-data-review`，配置仓库 Owner 为 required reviewer，只允许 main。允许 Owner 审批自己发起的 Run；没有审批规则不能发布此 Workflow。

运行布局：controller（已安装发布器）、repository（主线缓存）、releases（版本）、current/previous（版本指针）、plans（审批计划）、logs（服务日志）。不要放进 Runner checkout 或 Actions 清理目录。发布器升级需要审查后重新运行安装器；产品部署不会自动替换正在执行的发布器。

服务标签 `com.reading-list.preview`，plist 位于用户 Library/LaunchAgents。使用 launchctl 查看/重启服务。`/__deployment.json` 返回当前 SHA 及 GitHub 版本链接。测试命令：

```sh
python3 -m unittest discover -s tests -p '*_test.py'
node --test tests/*.test.cjs
python3 full_harness/quality.py check
```

普通发布失败会自动恢复 previous。需要回退产品时，在 GitHub revert 对应产品变更并合入 main，由同一发布流程处理；不要手动清空数据或绕过迁移审批。已经执行过迁移时，按该版本的恢复方案处理。
