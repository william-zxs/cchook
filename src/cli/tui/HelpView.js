import React from 'react';
import { Box, Text } from 'ink';

export function HelpView() {
  const commands = [
    { cmd: 'cchook', desc: '启动交互式 TUI 界面' },
    { cmd: 'cchook setup', desc: '初始化配置并安装 hooks 到 Claude Code' },
    { cmd: 'cchook mode normal', desc: '切换到正常模式（启用通知）' },
    { cmd: 'cchook mode silent', desc: '切换到静音模式（禁用通知）' },
    { cmd: 'cchook events add <event>', desc: '启用特定事件的通知' },
    { cmd: 'cchook events remove <event>', desc: '禁用特定事件的通知' },
    { cmd: 'cchook events list', desc: '列出所有可用事件' },
    { cmd: 'cchook test', desc: '测试通知功能' },
    { cmd: 'cchook status', desc: '显示当前配置状态' }
  ];

  const supportedEvents = [
    { event: 'Notification', desc: 'Claude Code 发送的通知' },
    { event: 'Stop', desc: 'Claude 完成任务时' },
    { event: 'SubagentStop', desc: '子任务完成时' },
    { event: 'UserPromptSubmit', desc: '用户提交提示时' },
    { event: 'PreToolUse', desc: '工具执行前' },
    { event: 'PostToolUse', desc: '工具执行后' },
    { event: 'PreCompact', desc: '上下文压缩前' },
    { event: 'SessionStart', desc: '会话开始时' },
    { event: 'SessionEnd', desc: '会话结束时' }
  ];

  const tuiControls = [
    { key: 'S', desc: '查看系统状态' },
    { key: 'C', desc: '进入配置管理' },
    { key: 'T', desc: '测试通知功能' },
    { key: 'H', desc: '显示帮助信息' },
    { key: 'Q / ESC', desc: '退出程序' },
    { key: '← →', desc: '在配置页面切换部分' },
    { key: '↑ ↓', desc: '选择选项' },
    { key: 'Enter', desc: '确认选择' },
    { key: 'R', desc: '刷新配置（在配置页面）' }
  ];

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="blue" bold>📖 帮助信息</Text>
      
      {/* 命令行使用 */}
      <Box flexDirection="column">
        <Text color="green" bold>命令行使用:</Text>
        <Box marginLeft={2} flexDirection="column">
          {commands.map((item, index) => (
            <Box key={index}>
              <Text color="yellow">{item.cmd.padEnd(25)}</Text>
              <Text color="white"> - {item.desc}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* TUI 控制 */}
      <Box flexDirection="column">
        <Text color="green" bold>TUI 界面控制:</Text>
        <Box marginLeft={2} flexDirection="column">
          {tuiControls.map((item, index) => (
            <Box key={index}>
              <Text color="cyan">{item.key.padEnd(15)}</Text>
              <Text color="white"> - {item.desc}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 支持的事件 */}
      <Box flexDirection="column">
        <Text color="green" bold>支持的 Hook 事件:</Text>
        <Box marginLeft={2} flexDirection="column">
          {supportedEvents.map((item, index) => (
            <Box key={index}>
              <Text color="magenta">{item.event.padEnd(18)}</Text>
              <Text color="white"> - {item.desc}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 配置文件位置 */}
      <Box flexDirection="column">
        <Text color="green" bold>配置文件:</Text>
        <Box marginLeft={2} flexDirection="column">
          <Box>
            <Text color="blue">cchook 配置: </Text>
            <Text color="gray">~/.cchook/config.json</Text>
          </Box>
          <Box>
            <Text color="blue">Claude Code 配置: </Text>
            <Text color="gray">~/.claude/settings.json</Text>
          </Box>
        </Box>
      </Box>

      {/* 工作原理 */}
      <Box flexDirection="column">
        <Text color="green" bold>工作原理:</Text>
        <Box marginLeft={2} flexDirection="column">
          <Text color="white">1. cchook 会自动配置 Claude Code 的 hooks</Text>
          <Text color="white">2. 当触发事件时，Claude Code 会调用 cchook</Text>
          <Text color="white">3. cchook 根据配置决定是否发送通知</Text>
          <Text color="white">4. 支持 macOS 系统通知和控制台通知</Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          按 Q 键退出帮助 | 更多信息请查看项目 README
        </Text>
      </Box>
    </Box>
  );
}