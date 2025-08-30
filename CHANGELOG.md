# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-30

### Added
- 初始版本发布
- Claude Code hooks 自动配置和管理
- 现代化 TUI 界面（基于 Ink）
- 智能通知系统（支持 macOS osascript 和控制台通知）
- 灵活的配置管理系统
- 工作模式切换（normal/silent）
- 事件过滤和管理
- 完整的 CLI 命令接口
- 通知功能测试
- 完整的测试覆盖
- 详细的文档和使用指南

### 支持的 Hook 事件
- `Notification` - 系统通知
- `Stop` - 任务完成通知
- `SubagentStop` - 子任务完成通知
- `UserPromptSubmit` - 用户输入提示
- `PreToolUse` - 工具执行前通知
- `PostToolUse` - 工具执行后通知
- `PreCompact` - 上下文压缩前通知
- `SessionStart` - 会话开始通知
- `SessionEnd` - 会话结束通知

### 核心功能
- 🔔 实时通知系统
- 🎨 交互式 TUI 界面
- ⚙️ 智能配置管理
- 🔧 一键 Hook 安装
- 🧪 通知功能测试
- 📊 系统状态监控

### 技术特性
- ES Modules 支持
- 现代 Node.js 架构
- 模块化设计
- 全面测试覆盖
- 跨平台兼容性（主要支持 macOS）