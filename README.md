# cchook - Claude Code Hook 管理工具

cchook 是一个专为 Claude Code 设计的 hook 管理工具，提供了现代化的 TUI 界面和完整的通知系统，让您能够及时了解 Claude Code 的工作状态。

## ✨ 特性

- 🔔 **智能通知系统** - 支持 macOS 系统通知和控制台通知
- 🎨 **现代 TUI 界面** - 基于 Ink 的美观交互界面
- ⚙️ **灵活配置管理** - 支持工作模式切换和事件过滤
- 🔧 **自动 Hook 安装** - 一键配置 Claude Code hooks
- 🚀 **即插即用** - 简单的安装和配置过程
- 🧪 **完整测试覆盖** - 确保稳定性和可靠性

## 📦 安装

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

## 🚀 快速开始

### 1. 初始化配置

```bash
cchook setup
```

这将：
- 创建 cchook 配置文件 (`~/.cchook/config.json`)
- 自动配置 Claude Code hooks (`~/.claude/settings.json`)
- 验证安装是否成功

### 2. 启动 TUI 界面

```bash
cchook
```

使用键盘导航：
- `S` - 查看系统状态
- `C` - 配置管理
- `T` - 测试通知
- `H` - 查看帮助
- `Q` 或 `ESC` - 退出

### 3. 测试通知功能

```bash
cchook test
```

## 📋 命令行使用

### 基本命令

```bash
# 启动 TUI 界面
cchook

# 初始化配置
cchook setup [--force]

# 查看状态
cchook status [--verbose]

# 测试通知
cchook test [type] [--all] [--current]
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

### 事件管理

```bash
# 列出所有事件
cchook events list

# 启用事件
cchook events add <event>

# 禁用事件
cchook events remove <event>
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
    "type": "osascript",
    "osascript": {
      "title": "Claude Code",
      "subtitle": "通知",
      "sound": "default"
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

- `notifications.type`: 通知类型
  - `"osascript"` - macOS 系统通知
  - `"console"` - 控制台通知

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

### 项目结构

```
cchook/
├── bin/
│   └── cchook.js           # CLI 入口
├── src/
│   ├── cli/
│   │   ├── commands/       # CLI 命令实现
│   │   └── tui/           # Ink TUI 组件
│   ├── config/            # 配置管理
│   ├── hook/              # Hook 处理和安装
│   ├── notifications/     # 通知系统
│   └── utils/            # 工具函数
├── test/                  # 测试文件
└── package.json
```

### 技术栈

- **Node.js** - 运行时环境
- **Ink + React** - TUI 界面框架
- **Commander.js** - CLI 参数解析
- **Jest** - 测试框架
- **fs-extra** - 文件系统操作
- **chalk** - 终端颜色输出

## 🔧 故障排除

### 通知不工作

1. **检查模式**: 确保不在静音模式
   ```bash
   cchook mode
   ```

2. **检查事件**: 确保相关事件已启用
   ```bash
   cchook events list
   ```

3. **测试通知**: 运行通知测试
   ```bash
   cchook test
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
- TUI 界面
- Claude Code hooks 集成
- 完整测试覆盖