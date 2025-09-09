# cchook - Claude Code Hook 管理工具

[English](README_EN.md) | 中文

cchook 是一个专为 Claude Code 设计的 hook 管理工具，提供完整的通知系统和命令行界面，让您能够及时了解 Claude Code 的工作状态。

## ✨ 特性

- 🔔 **智能通知系统** - 支持 macOS 系统通知、钉钉机器人通知和控制台通知
- 🖥️ **命令行界面** - 简洁高效的 CLI 操作
- ⚙️ **灵活配置管理** - 支持工作模式切换和事件过滤
- 🔧 **自动 Hook 安装** - 一键配置 Claude Code hooks
- 🚀 **即插即用** - 简单的安装和配置过程
- 🧪 **完整测试覆盖** - 确保稳定性和可靠性

## 📦 安装

```bash
# 通过 npm 安装（推荐）
npm install -g cchook
```

## 🚀 快速开始

### 1. 初始化配置

```bash
cchook setup
```

这将：
- 创建 cchook 配置文件 (`~/.cchook/config.json`)
- 自动配置 Claude Code hooks (`~/.claude/settings.json`)
- 验证安装是否成功

### 2. 查看状态和管理配置

```bash
# 查看系统状态
cchook status

# 查看详细状态
cchook status --verbose
```

### 3. 配置通知方式（可选）

配置钉钉机器人通知：
```bash
cchook config dingtalk
```

配置 macOS 系统通知：
```bash
cchook config macos
```

### 4. 测试通知功能

```bash
cchook test

# 测试特定通知类型
cchook test dingtalk
cchook test macos
```

## 📋 命令行使用

### 基本命令

```bash
# 初始化配置
cchook setup [--force]

# 查看状态
cchook status [--verbose]

# 测试通知
cchook test [type] [--all] [--current]

# 配置通知
cchook config <type>
```

### 模式管理

```bash
# 查看当前模式
cchook mode

# 切换到正常模式（启用通知）
cchook mode normal

# 切换到静音模式（禁用通知）
cchook mode silent
```

### 通知配置管理

```bash
# 配置钉钉机器人
cchook config dingtalk

# 配置 macOS 通知
cchook config macos

# 显示当前配置
cchook config show
```

### 事件管理

```bash
# 列出所有事件
cchook config events list

# 启用事件
cchook config events add <event>

# 禁用事件
cchook config events remove <event>
```

## 🔔 支持的事件类型

| 事件 | 描述 | 何时触发 |
|------|------|----------|
| `Notification` | 系统通知 | Claude Code 发送通知时 |
| `Stop` | 任务完成 | Claude 完成主要任务时 |
| `SubagentStop` | 子任务完成 | 子代理完成工作时 |
| `UserPromptSubmit` | 用户输入 | 用户提交新提示时 |
| `PreToolUse` | 工具执行前 | 执行重要工具前（如 Bash、Write） |
| `PostToolUse` | 工具执行后 | 重要工具执行完成后 |
| `PreCompact` | 压缩前 | 上下文即将压缩时 |
| `SessionStart` | 会话开始 | 新会话启动时 |
| `SessionEnd` | 会话结束 | 会话结束时 |

## 🔔 钉钉机器人配置

### 1. 创建钉钉机器人

请参考钉钉官方文档创建自定义机器人：
**https://open.dingtalk.com/document/robots/custom-robot-access**

关键步骤：
1. 在钉钉群聊中添加机器人
2. 选择“自定义”机器人类型
3. 设置机器人名称和头像
4. 安全设置中选择“加签”方式
5. 获取 `access_token` 和 `secret`

### 2. 配置 cchook

```bash
# 交互式配置
cchook config dingtalk

# 或直接传参数
cchook notify --type dingtalk --token YOUR_ACCESS_TOKEN --secret YOUR_SECRET "测试消息"
```

## ⚙️ 配置文件

### cchook 配置 (`~/.cchook/config.json`)

```json
{
  "version": "1.0.0",
  "mode": "normal",
  "enabledEvents": [
    "Notification",
    "Stop",
    "UserPromptSubmit"
  ],
  "notifications": {
    "type": "dingtalk",
    "defaultTypes": ["dingtalk", "macos"],
    "dingtalk": {
      "accessToken": "YOUR_ACCESS_TOKEN",
      "secret": "YOUR_SECRET"
    },
    "macos": {
      "title": "Claude Code",
      "subtitle": "通知",
      "sound": true
    }
  },
  "projectConfigs": {}
}
```

### 配置选项

- `mode`: 工作模式
  - `"normal"` - 正常模式，启用通知
  - `"silent"` - 静音模式，禁用所有通知

- `enabledEvents`: 启用的事件数组

- `notifications.type`: 主通知类型
  - `"dingtalk"` - 钉钉机器人通知
  - `"macos"` - macOS 系统通知

- `notifications.defaultTypes`: 默认启用的通知类型列表

- `notifications.dingtalk`: 钉钉机器人配置
  - `accessToken` - 机器人 webhook 的 access_token
  - `secret` - 机器人安全设置的加签 secret

- `notifications.macos`: macOS 系统通知配置
  - `title` - 通知标题
  - `subtitle` - 通知副标题
  - `sound` - 是否播放声音

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监视模式
npm run test:watch
```

## 🛠️ 开发

### 从源代码安装（开发）

```bash
# 克隆项目
git clone <repository-url>
cd cchook

# 安装依赖
npm install

# 使 cchook 全局可用
npm link

# 或者直接使用
npm run dev
```

### 项目结构

```
cchook/
├── bin/
│   └── cchook.js           # CLI 入口
├── src/
│   ├── cli/
│   │   └── commands/       # CLI 命令实现
│   ├── config/            # 配置管理
│   ├── hook/              # Hook 处理和安装
│   ├── notifications/     # 通知系统
│   └── utils/            # 工具函数
├── test/                  # 测试文件
└── package.json
```

### 技术栈

- **Node.js** - 运行时环境
- **Commander.js** - CLI 参数解析
- **Jest** - 测试框架
- **fs-extra** - 文件系统操作
- **chalk** - 终端颜色输出

## 🔧 故障排除

### 钉钉通知不工作

1. **检查配置**: 确保 accessToken 和 secret 正确
   ```bash
   cchook config show
   ```

2. **检查网络**: 确保可以访问钉钉 API
   ```bash
   cchook test dingtalk
   ```

3. **检查机器人设置**: 确保机器人在群聊中且配置正确

### 通知不工作

1. **检查模式**: 确保不在静音模式
   ```bash
   cchook mode
   ```

2. **检查事件**: 确保相关事件已启用
   ```bash
   cchook config events list
   ```

3. **测试通知**: 运行通知测试
   ```bash
   cchook test
   # 或测试特定类型
   cchook test dingtalk
   cchook test macos
   ```

4. **检查权限**: 在 macOS 上，确保终端有发送通知的权限
   - 系统偏好设置 > 通知 > 终端

### Hook 未触发

1. **验证安装**: 检查 Claude Code 配置
   ```bash
   cchook status --verbose
   ```

2. **重新安装**: 强制重新安装 hooks
   ```bash
   cchook setup --force
   ```

3. **检查路径**: 确保 cchook 可执行文件路径正确

### 配置问题

1. **重置配置**: 删除配置文件重新初始化
   ```bash
   rm ~/.cchook/config.json
   cchook setup
   ```

2. **检查权限**: 确保有读写配置文件的权限

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 基础通知功能
- 命令行界面
- Claude Code hooks 集成
- 完整测试覆盖