import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { ConfigManager } from '../../config/manager.js';
import { FileSystemUtils } from '../../utils/fs.js';

export function StatusView() {
  const [status, setStatus] = useState({
    loading: true,
    mode: 'unknown',
    enabledEvents: [],
    notificationType: 'unknown',
    claudeConfigExists: false,
    cchookConfigExists: false,
    error: null
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      const configManager = new ConfigManager();
      const config = await configManager.loadConfig();

      const claudeConfigExists = await FileSystemUtils.fileExists(
        FileSystemUtils.getClaudeSettingsPath()
      );

      const cchookConfigExists = await FileSystemUtils.fileExists(
        FileSystemUtils.getCchookConfigPath()
      );

      setStatus({
        loading: false,
        mode: config.mode,
        enabledEvents: config.enabledEvents || [],
        notificationType: config.notifications?.type || 'unknown',
        claudeConfigExists,
        cchookConfigExists,
        error: null
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  if (status.loading) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">⏳ 正在加载状态...</Text>
      </Box>
    );
  }

  if (status.error) {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ 加载状态失败: {status.error}</Text>
        <Text color="gray">请检查配置文件是否正确</Text>
      </Box>
    );
  }

  const getModeColor = (mode) => {
    switch (mode) {
      case 'normal': return 'green';
      case 'silent': return 'yellow';
      default: return 'gray';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'normal': return '🔔';
      case 'silent': return '🔕';
      default: return '❓';
    }
  };

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="blue" bold>📊 系统状态</Text>
      
      {/* 工作模式 */}
      <Box>
        <Text color="white">工作模式: </Text>
        <Text color={getModeColor(status.mode)}>
          {getModeIcon(status.mode)} {status.mode.toUpperCase()}
        </Text>
      </Box>

      {/* 通知类型 */}
      <Box>
        <Text color="white">通知类型: </Text>
        <Text color="blue">{status.notificationType}</Text>
      </Box>

      {/* 启用的事件 */}
      <Box flexDirection="column">
        <Text color="white">启用的事件 ({status.enabledEvents.length}):</Text>
        <Box marginLeft={2} flexDirection="column">
          {status.enabledEvents.length > 0 ? (
            status.enabledEvents.map(event => (
              <Box key={event}>
                <Text color="green">✓ </Text>
                <Text>{event}</Text>
              </Box>
            ))
          ) : (
            <Text color="gray">暂无启用的事件</Text>
          )}
        </Box>
      </Box>

      {/* 配置文件状态 */}
      <Box flexDirection="column">
        <Text color="white">配置文件状态:</Text>
        <Box marginLeft={2} flexDirection="column">
          <Box>
            <Text color={status.cchookConfigExists ? "green" : "red"}>
              {status.cchookConfigExists ? "✓" : "✗"}
            </Text>
            <Text> cchook 配置文件</Text>
            <Text color="gray"> (~/.cchook/config.json)</Text>
          </Box>
          <Box>
            <Text color={status.claudeConfigExists ? "green" : "yellow"}>
              {status.claudeConfigExists ? "✓" : "!"}
            </Text>
            <Text> Claude Code 配置文件</Text>
            <Text color="gray"> (~/.claude/settings.json)</Text>
          </Box>
        </Box>
      </Box>

      {/* 系统信息 */}
      <Box flexDirection="column">
        <Text color="white">系统信息:</Text>
        <Box marginLeft={2} flexDirection="column">
          <Box>
            <Text color="blue">平台: </Text>
            <Text>{process.platform}</Text>
          </Box>
          <Box>
            <Text color="blue">Node.js: </Text>
            <Text>{process.version}</Text>
          </Box>
          <Box>
            <Text color="blue">工作目录: </Text>
            <Text color="gray">{process.cwd()}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}