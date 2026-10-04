# Issue #100 LLD

权威边界：[HLD](hld.md)、[C-01..05](contracts.md)。实现计划见[implement](../../../04-implementation/tasks/100/implement.md)。

采集与网络模块在产品recommendations.py；固定两源配置、严格HTML适配、身份hash、确定性原创摘要，完整源快照通过才发布。HTTPS请求按每次重定向重新检查目标，拒绝私网；单源预算与整轮截止限制。flock保护所有配置和发布事务；临时文件fsync/replace，状态可从已发布目录恢复时间。关闭调度不禁止手动run。全局启停保留due，来源变更触发新检查；首次ready需两组织/三类型，initialReady保留合法来源退出后的重启资格，coverage不足明确显示。remove为不可静默复活的tombstone，合并记录从剩余来源快照重建简介及证据；报告写失败不回滚已经原子发布的有效目录。

controller仅暴露catalogue.json，GET/HEAD，拒绝写方法和其他recommendations路径，不随app版本base改变。安装器只在Owner显式调用时复制受审查产品脚本并安装独立launchd plist，不由普通app release替换controller。

QA返工后的网络边界：`remaining()`在剩余预算≤0时拒绝；`bounded(operation)`用daemon worker/Event限制DNS、连接、TLS、发送、响应头和读取每阶段等待为min(20秒,剩余轮次预算)，进入/结束都复查截止，晚到结果不得继续发送；晚到socket结果关闭。系统DNS调用不能强制取消，超时只停止等待并丢弃其结果，不等待worker退出持锁。保留受检查公网IP与原hostname TLS验证；复制底层socket句柄，超时shutdown共享连接，即使TLS已转移fd所有权或HTTPResponse持有buffer也能中断，finally关闭复制句柄。实际发送前而不是DNS前计算1秒间隔，等待不超剩余预算；真正request调用才更新previous。运行报告requestedAt为发送前取时，completedAt/startedMonotonic/durationSeconds分别区分完成及单调起点/时长，不把响应时间差冒充节流证明。复用原HLD预算，不增加产品取舍或放宽约束。

app保留既有app.js单脚本入口和title/read语义；独立可测函数承担schema、缓存和元信息表单。最初拆成两个经典脚本时Owner ESLint识别到未声明跨文件全局，已合并为同一词法作用域，未添加全局豁免或改质量配置。所有写入通过persist，原字节比较后写入再提交内存；异常原值拒绝覆盖。推荐只能补空字段，改名将link标为needs_review；实际旧版改名保留link但无该标记，新版额外通过titleAtAdoption与当前title不符只读显示待核对，不启动改写。未知bookInfo命名空间（含null）拒绝覆盖。删除深拷贝完整对象。目录网络输入不得流到HTML解释或私人持久化，除非用户明确操作。

接口测试由产品单元/HTTP测试、注册浏览器和受控存储夹具分别验证；不安装真实launchd、不宣称物理触屏或读屏语音。安装权限、QA判断和最终发布相互独立。
