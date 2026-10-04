# 可信宿主入口环境恢复记录

本轮指定入口为宿主 `examples/github/verify.py --config <Owner配置> --issue 100`，没有使用工作区旧版扫描器，没有修改共享工具。

1. 直接通过Agent终端调用完整入口，前4项通过，Chromium在core检查启动时MachPort permission denied / EPERM失败。完整stderr见[trusted-host.log](trusted-host.log)，失败[回执](checks-after-sandbox-failure.json)与[check-4原日志](check-4-sandbox-failure.log)保留。
2. 注册verify可在宿主外运行相同Owner质量配置；第一次调用被git diff --check拦住，原因是上述已跟踪滚动check-4.log末尾多一个空行。该结果来自实际工具调用，不是产品bug。
3. 原失败日志原样复制到本轮目录后，仅从运行前快照恢复固定滚动check-4.log，不修产品/测试/工具，也不删除失败事实。随后注册verify完整9项全部exit0，真实core16/feature48、全Python50、Node25和Python格式/lint均运行。见[稳定门禁快照](host-checks/checks.json)。

维护者建议：将失败输出固定保存为每次运行独立目录，避免滚动已跟踪日志的额外EOF空行触发下一次质量预检，也防止覆盖旧AX；不要跳过git diff检查或产品门禁。本轮通过合法宿主入口恢复，当前不阻塞产品放行。不把沙箱启动故障误归责development，不申请扩大执行/部署授权。
