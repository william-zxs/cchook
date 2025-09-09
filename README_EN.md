# cchook - Claude Code Hook Management Tool

cchook is a hook management tool specifically designed for Claude Code, featuring a comprehensive notification system and command-line interface to keep you informed about Claude Code's working status.

## ✨ Features

- 🔔 **Smart Notification System** - Supports macOS system notifications and DingTalk robot notifications
- 🖥️ **Command-line Interface** - Clean and efficient CLI operations
- ⚙️ **Flexible Configuration Management** - Supports working mode switching and event filtering
- 🔧 **Automatic Hook Installation** - One-click Claude Code hooks configuration
- 🚀 **Plug & Play** - Simple installation and configuration process
- 🧪 **Complete Test Coverage** - Ensures stability and reliability

## 📦 Installation

```bash
# Install via npm (recommended)
npm install -g cchook
```

## 🚀 Quick Start

### 1. Initialize Configuration

```bash
cchook setup
```

This will:
- Create cchook configuration file (`~/.cchook/config.json`)
- Automatically configure Claude Code hooks (`~/.claude/settings.json`)
- Verify successful installation

### 2. View Status and Manage Configuration

```bash
# View system status
cchook status

# View detailed status
cchook status --verbose
```

### 3. Configure Notification Methods (Optional)

Configure DingTalk robot notifications:
```bash
cchook config dingtalk
```

Configure macOS system notifications:
```bash
cchook config macos
```

### 4. Test Notification Function

```bash
cchook test

# Test specific notification type
cchook test dingtalk
cchook test macos
```

## 📋 Command Line Usage

### Basic Commands

```bash
# Initialize configuration
cchook setup [--force]

# View status
cchook status [--verbose]

# Test notifications
cchook test [type] [--all] [--current]

# Configure notifications
cchook config <type>
```

### Mode Management

```bash
# View current mode
cchook mode

# Switch to normal mode (enable notifications)
cchook mode normal

# Switch to silent mode (disable notifications)
cchook mode silent
```

### Notification Configuration Management

```bash
# Configure DingTalk robot
cchook config dingtalk

# Configure macOS notifications
cchook config macos

# Show current configuration
cchook config show
```

### Event Management

```bash
# List all events
cchook config events list

# Enable event
cchook config events add <event>

# Disable event
cchook config events remove <event>
```

## 🔔 Supported Event Types

| Event | Description | When Triggered |
|-------|-------------|----------------|
| `Notification` | System notification | When Claude Code sends notifications |
| `Stop` | Task completion | When Claude completes main tasks |
| `SubagentStop` | Subtask completion | When subagent completes work |
| `UserPromptSubmit` | User input | When user submits new prompts |
| `PreToolUse` | Before tool execution | Before executing important tools (like Bash, Write) |
| `PostToolUse` | After tool execution | After important tools complete execution |
| `PreCompact` | Before compression | When context is about to be compressed |
| `SessionStart` | Session start | When new session starts |
| `SessionEnd` | Session end | When session ends |

## 🔔 DingTalk Robot Configuration

### 1. Create DingTalk Robot

Please refer to the official DingTalk documentation to create a custom robot:
**https://open.dingtalk.com/document/robots/custom-robot-access**

Key steps:
1. Add a robot to your DingTalk group chat
2. Select "Custom" robot type
3. Set robot name and avatar
4. Choose "Sign" method in security settings
5. Get the `access_token` and `secret`

### 2. Configure cchook

```bash
# Interactive configuration
cchook config dingtalk

# Or pass parameters directly
cchook notify --type dingtalk --token YOUR_ACCESS_TOKEN --secret YOUR_SECRET "Test message"
```

## ⚙️ Configuration Files

### cchook Configuration (`~/.cchook/config.json`)

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
      "subtitle": "Notification",
      "sound": true
    }
  },
  "projectConfigs": {}
}
```

### Configuration Options

- `mode`: Working mode
  - `"normal"` - Normal mode, enable notifications
  - `"silent"` - Silent mode, disable all notifications

- `enabledEvents`: Array of enabled events

- `notifications.type`: Primary notification type
  - `"dingtalk"` - DingTalk robot notifications
  - `"macos"` - macOS system notifications

- `notifications.defaultTypes`: List of default enabled notification types

- `notifications.dingtalk`: DingTalk robot configuration
  - `accessToken` - Robot webhook access_token
  - `secret` - Robot security signature secret

- `notifications.macos`: macOS system notification configuration
  - `title` - Notification title
  - `subtitle` - Notification subtitle
  - `sound` - Whether to play sound

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests and generate coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🛠️ Development

### Development Installation

```bash
# Clone the project
git clone <repository-url>
cd cchook

# Install dependencies
npm install

# Make cchook globally available
npm link

# Or use directly
npm run dev
```

### Project Structure

```
cchook/
├── bin/
│   └── cchook.js           # CLI entry point
├── src/
│   ├── cli/
│   │   └── commands/       # CLI command implementations
│   ├── config/            # Configuration management
│   ├── hook/              # Hook handling and installation
│   ├── notifications/     # Notification system
│   └── utils/            # Utility functions
├── test/                  # Test files
└── package.json
```

### Tech Stack

- **Node.js** - Runtime environment
- **Commander.js** - CLI argument parsing
- **Jest** - Testing framework
- **fs-extra** - File system operations
- **chalk** - Terminal color output

## 🔧 Troubleshooting

### DingTalk Notifications Not Working

1. **Check configuration**: Ensure accessToken and secret are correct
   ```bash
   cchook config show
   ```

2. **Check network**: Ensure DingTalk API is accessible
   ```bash
   cchook test dingtalk
   ```

3. **Check robot settings**: Ensure robot is in group chat and configured correctly

### Notifications Not Working

1. **Check mode**: Make sure you're not in silent mode
   ```bash
   cchook mode
   ```

2. **Check events**: Make sure relevant events are enabled
   ```bash
   cchook config events list
   ```

3. **Test notifications**: Run notification tests
   ```bash
   cchook test
   # Or test specific type
   cchook test dingtalk
   cchook test macos
   ```

4. **Check permissions**: On macOS, ensure terminal has permission to send notifications
   - System Preferences > Notifications > Terminal

### Hooks Not Triggering

1. **Verify installation**: Check Claude Code configuration
   ```bash
   cchook status --verbose
   ```

2. **Reinstall**: Force reinstall hooks
   ```bash
   cchook setup --force
   ```

3. **Check path**: Ensure cchook executable path is correct

### Configuration Issues

1. **Reset configuration**: Delete configuration file and reinitialize
   ```bash
   rm ~/.cchook/config.json
   cchook setup
   ```

2. **Check permissions**: Ensure you have read/write permissions for configuration files

## 📄 License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📝 Changelog

### v1.0.0
- Initial release
- Basic notification functionality
- Command-line interface
- Claude Code hooks integration
- Complete test coverage