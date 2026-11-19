# dsh-session-span

**简体中文** | [English](README.en.md)

一个 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件：在侧边栏会话行的悬停卡片里显示**这个会话从第一条消息到现在已经过了多久**。

```
会话标题
C:\Users\Administrator
3 分钟前                        ← DSH 原有：最后活动时间
已持续 3 小时 12 分              ← 本插件：从第一条消息到现在
首条消息 2026年11月19日 10:57     ← 以及起点时间
● 运行中
```

## 安装

应用内：**设置 → 插件 → 添加插件**，填 `dsh-session-span`，然后启用 **会话历时** 这个 bundle。

命令行（面向 `web` 等由 shell 管理的 profile）：

```sh
dsh plugin --profile web add dsh-session-span
```

Desktop 的 profile 由应用独占管理，请在应用内的插件页安装。

要求 DSH `>=0.2.2-rc.3`、Node `>=22.6`。本包没有依赖，也没有安装脚本。

## 显示什么

- `已持续` / `Elapsed` — 从会话第一条消息到现在的**墙钟时间**，会话空闲时也继续累计；悬停卡片打开期间每 30 秒刷新一次。
- `首条消息` / `First message` — 起点时间，按设备时区和应用语言格式化（英文界面显示 `2026-11-19 09:12`）。

## 起点怎么定

- 起点取会话日志中第一条 `user/message`，来源为 `user` 或 `schedule`，所以**定时任务拉起的会话也有起点**。
- Fork 会话不继承父会话的第一条消息，而从自己的创建时间算起。
- 该值是 Host 侧的一个 Session 投影（`sessionSpan`），一次折叠完整持久日志后随会话摘要下发，侧边栏读取它不会激活会话，分页、压缩、重启都不会改变。
- 插件装好之前就已存在的旧会话没有缓存值；首次悬停这类行时会做一次非激活的投影读取，之后该值就被缓存。因此大日志旧会话的第一次悬停，这一段可能稍晚出现。

## 说明

- 墙钟意味着空闲时间也计入。如果你要看"真正在跑的时间"，DSH 输入框下方的统计条显示的是模型用时加工具用时。
- 不向模型注入任何内容，不向外发送任何数据；除折叠出的投影外不保存自己的状态。
- 在 **设置 → 插件** 里停用或卸载即可，悬停卡片会恢复为默认内容。

## 开发

本包按原样发布，没有构建步骤：Host 侧是普通 ESM，客户端是一个注册进 `sidebar.session.row.hover` 插槽的浏览器模块。

```sh
# 让某个 profile 指向这份检出
dsh plugin --profile web add /absolute/path/to/this/directory
```

MIT License。
