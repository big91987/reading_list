# Issue #100 数据与接口契约 v1

日期：2026-10-04；[HLD](hld.md)定义所有权，本文件是实现约束，不是已存在API。

## C-01 目录信封与只读接口

`GET /__recommendations/catalogue.json`同源绝对路径；200 UTF-8 application/json、no-store、nosniff，允许GET/HEAD，写方法405。只服务约定目录文件，根越界/隐藏文件/报告/配置不提供；无有效发布503；不存在404。不要求私人参数、cookie或密钥。前端不直接访问外部站；外部出处点击由用户发起。

```json
{
  "schemaVersion": 1,
  "revision": "sha256-of-canonical-envelope-content",
  "generatedAt": "2026-10-04T08:00:00Z",
  "status": "ok",
  "sources": [{"id":"fjlib","organisation":"福建省图书馆","status":"ok","lastSuccessAt":"2026-10-04T08:00:00Z","lastAttemptAt":"2026-10-04T08:00:00Z","errorCode":null}],
  "records": [{"id":"sha256-normalised-identity","title":"梅西传","author":"[阿根廷] 塞尔吉奥·莱文斯基","edition":null,"publisher":"作家出版社","types":["历史社科"],"summary":"一部介绍梅西个人经历与足球生涯的传记。","summaryOrigin":{"method":"factual-template-v1","evidenceSourceId":"fjlib"},"origins":[{"sourceId":"fjlib","organisation":"福建省图书馆","url":"https://www.fjlib.net/zy/xstj/202609/t20260917_481274.htm","recommendationStatus":"新书推荐栏目","sourceType":"K837.835.47/22","typeOrigin":"本产品映射","publishedAt":null,"collectedAt":"2026-10-04T08:00:00Z"}]}]
}
```

示例不是正式目录。status=ok/partial/failed，failed只有存在最后成功条目时200；首次全失败503。source.status=ok/failed/paused。paused不算采集失败，不使私人书籍消失。空且合法records表示有效空，前端区别于请求失败。初次ready检查两独立organisation/三个非空基本类型，后续退出可少于阈值但status报告coverage_insufficient，不能假装仍满足初始验收。

字段限值以Unicode code points计：title 1..80、author 1..120、publisher/edition ≤120、summary 1..300、url ≤2048，最多3个基本types，额外原始门类只在origin.sourceType表达。目录1000条/1MB限值；违规记录拒绝并使该源本轮失败，不截断书名/伪造简介。日期UTC RFC3339；原页无法证明发布时间为null并显示“来源日期未知”，不得用采集日期代替。errorCode来自固定集合：network、parse、policy、size_limit、schema、coverage_insufficient、disabled；不展示原站HTML/堆栈/绝对本机路径。revision计算时排除revision字段本身，对其余信封按键排序UTF-8无空白JSON取SHA256，避免自指哈希。

types基础枚举：古典文学、仙侠、现当代文学、历史社科、科普、其他；空私人types显示未分类。PoC细文学门类保留origin，不创建所有细分筛选。科幻属于现当代文学/原门类科幻而非仙侠。映射版本跟随解析器版本；每origin注明本产品映射或来源原文。

identity=去首尾空白+Unicode NFC+小写title/author/publisher/edition四元组序列化后SHA256；不要删除内部空白/标点、擅去作者国籍造成碰撞。作者/出版社缺失无法跨源安全合并时附sourceId+canonicalURL区分，身份不确定不强并。多源同ID origins按sourceId/url去重；首批按固定source优先顺序选择summary，同时每origin保留依据hash在私有运行记录。不允许把不同版次仅因同名合并。

## C-02 私人书单与元信息

保留`page-between-reading-list`数组及title/read；未知字段原样透传。新增可选`bookInfo`命名空间，已有同名非兼容字段检测冲突则拒绝元信息写入并提示，不默默覆盖；兼容定义schemaVersion=1且字段校验通过。

```json
{"title":"梅西传","read":false,"bookInfo":{"schemaVersion":1,"types":["历史社科"],"summary":"用户保存的简介","author":"作者","edition":null,"fieldOrigins":{"types":"catalogue","summary":"manual"},"catalogueLink":{"recordId":"catalogue-id","titleAtAdoption":"梅西传","verification":"verified","origins":[]}}}
```

summary可空、人工上限600；types至多3，author/edition可空，origin逐字段manual/catalogue；新增无元信息仍合法旧格式。纯加载不写、不补生成ID、不重排；异常条目沿用原产品读取策略，但备份原始字节，不把异常读空变成成功写空。保存前重新读取最新存储检测外部变更，冲突保草稿提示刷新/重试（新增推荐同名复查），避免另一标签页被静默覆盖。

加入推荐默认read=false，新增序位沿用现有append；去重全数组trim+toLocaleLowerCase（沿用基线，不改变为目录身份规则）。重复返回already_exists，不覆盖状态/信息/位置。bookInfo保存所采用目录的快照与origins；之后目录刷新仅更新公共缓存。

补全按私人title的既有去重规范匹配0/1/N候选，每个显示作者/出版社/版次/summary/origins。单候选仍须确认；多候选不预选，采用动作明确候选ID。只填空types/summary/author/edition，非空内容包括原有catalogue快照也不覆盖；无可填字段提示“没有可补的空缺”且零写。确认保存失败不改变books，选择和草稿保留。拒绝/关闭/仅查看零写。

改名成功后保留全部信息，有link则verification=needs_review；旧候选界面关闭，新建议按新title计算，绝不把titleAtAdoption同步成新名。再采用候选可更新link，非空人工内容保留；UI提示“保留已有信息，仅更新来源关联和空缺”，用户如要改已有内容走编辑。

删除快照深拷贝完整对象+原索引；撤销最近一次（刷新失效），同名冲突/写失败不消耗机会，恢复位置及read/未知字段/bookInfo。取消保原值，持久化成功后才变更内存；错误原子性沿用现有persist契约。

## C-03 公共缓存与显示状态

新键`page-between-recommendations-v1`只存通过校验的公共envelope，和私人键分离。非法缓存不覆盖私人记录；缓存setItem失败保内存且提示“推荐缓存未保存，书单仍可使用”。10秒网络超时、版本不支持/无效字段/503返回error，保持上次缓存。重试仅GET。加载/loading、有效空/empty、ok、过期/stale（各源>7天）、partial、failed_with_cache、failed_without_cache分别呈现；可叠加过期+部分失败，不把状态互斥化丢失信息。

## C-04 采集状态与发布事务

持久路径：`ROOT/recommendations/config.json`（维护者配置）、`state.json`（调度开关/lastAttempt/nextAttempt/每源lastSuccess）、`source-cache/<id>.json`、`catalogue.json`（唯一公开）、`reports/<UTC-runId>.json`。私有证据保留最近三次/30天，运行日志≤10MB轮转，失败保留最近一份；不存私人条目，不把原页正文混入公共文件。报告有runId、trigger=manual/tick、source结果、count、duration、errorCode、publishRevision、nextAttempt。

锁以单宿主进程文件锁而非永久pid旗标实现；争用返回busy/退出码3，不发请求，不自动清空锁文件。退出码0成功或due-no-op（报告区分），1失败/partial（有效源仍发布），2配置/schema错误，3busy。启用间隔7天：成功后nextAttempt=完成时刻+7天；失败/partial=完成时刻+1小时，连续重试遵守请求预算；disable时tick无网络，manual run仍可执行。配置启停需锁内原子更新，remove写入tombstone使旧源快照不再复活。

发布临时文件→校验→fsync→原子replace；generation内容hash作revision，动态generatedAt仅表示本轮成功发布，来源lastSuccess独立。崩溃不得让catalogue半写可见；报告失败不回滚有效catalogue，state恢复以catalogue内sources时间对账。重复同run输入不追加重复origins，重复调用不承诺exactly-once外网访问，只承诺幂等目录结果。禁止动态脚本/任意URL/HTTP/私网、限制重定向与响应大小、403/429停止重试，robots规则变化校验后暂停源。

## C-05 迁移与回滚

无启动时批量迁移；用户明确保存才增加字段。开发用已部署实际baseline样本以及未知字段/原始JSON零写比较验证旧版与新版加载/编辑/删除/撤销。旧版仍可能保留bookInfo但不展示；需实际往返测试，不以对象spread推断全部安全。新增独立缓存可删除恢复不涉及私人书单；uninstall只移除采集任务，保留个人与公共数据。

产品开发交付须提供支持的导出备份/恢复步骤和声明实测影响，使用local_deploy declare绑定app fingerprint；无法确认 deployed baseline则unknown进入人工审查，不能声称none。controller升级独立人工审查；最终合并与部署权限不由本设计授予。
