import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { ConfigManager } from '../../config/manager.js';
import { ConfigValidator } from '../../config/validator.js';

export function ConfigView() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  const sections = ['mode', 'events', 'notifications'];
  const configManager = new ConfigManager();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const loadedConfig = await configManager.loadConfig();
      setConfig(loadedConfig);
      setLoading(false);
    } catch (error) {
      setMessage(`❌ 加载配置失败: ${error.message}`);
      setLoading(false);
    }
  };

  useInput((input, key) => {
    if (editing) {
      if (key.escape) {
        setEditing(false);
      }
      return;
    }

    if (key.leftArrow || key.rightArrow) {
      setSelectedSection(prev => {
        const newSection = key.leftArrow 
          ? Math.max(0, prev - 1)
          : Math.min(sections.length - 1, prev + 1);
        setSelectedItem(0); // 重置选中项
        return newSection;
      });
    }

    if (key.upArrow || key.downArrow) {
      const currentSection = sections[selectedSection];
      let maxItems = 0;
      
      switch (currentSection) {
        case 'mode':
          maxItems = ConfigValidator.VALID_MODES.length - 1;
          break;
        case 'events':
          maxItems = ConfigValidator.VALID_EVENTS.length - 1;
          break;
        case 'notifications':
          maxItems = ConfigValidator.VALID_NOTIFICATION_TYPES.length - 1;
          break;
      }

      setSelectedItem(prev => {
        return key.upArrow 
          ? Math.max(0, prev - 1)
          : Math.min(maxItems, prev + 1);
      });
    }

    if (key.return) {
      handleItemSelect();
    }

    if (input === 'r') {
      loadConfig();
      setMessage('🔄 配置已刷新');
      setTimeout(() => setMessage(''), 2000);
    }
  });

  const handleItemSelect = async () => {
    if (!config) return;

    const currentSection = sections[selectedSection];

    try {
      switch (currentSection) {
        case 'mode':
          const newMode = ConfigValidator.VALID_MODES[selectedItem];
          await configManager.setMode(newMode);
          setMessage(`✅ 模式已切换为: ${newMode}`);
          break;

        case 'events':
          const eventName = ConfigValidator.VALID_EVENTS[selectedItem];
          const isEnabled = config.enabledEvents.includes(eventName);
          
          if (isEnabled) {
            await configManager.removeEvent(eventName);
            setMessage(`🔕 已禁用事件: ${eventName}`);
          } else {
            await configManager.addEvent(eventName);
            setMessage(`🔔 已启用事件: ${eventName}`);
          }
          break;

        case 'notifications':
          const notificationType = ConfigValidator.VALID_NOTIFICATION_TYPES[selectedItem];
          await configManager.setNotificationType(notificationType);
          setMessage(`🔔 通知类型已设置为: ${notificationType}`);
          break;
      }

      // 重新加载配置
      await loadConfig();
      
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(`❌ 操作失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">⏳ 正在加载配置...</Text>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ 无法加载配置</Text>
      </Box>
    );
  }

  const renderModeSection = () => (
    <Box flexDirection="column">
      <Text color="blue" bold>工作模式</Text>
      {ConfigValidator.VALID_MODES.map((mode, index) => (
        <Box key={mode}>
          <Text color={selectedSection === 0 && selectedItem === index ? "blue" : "white"}>
            {config.mode === mode ? "🔘" : "⚪"} {mode}
            {selectedSection === 0 && selectedItem === index ? " ← " : ""}
          </Text>
        </Box>
      ))}
    </Box>
  );

  const renderEventsSection = () => (
    <Box flexDirection="column">
      <Text color="blue" bold>事件管理</Text>
      {ConfigValidator.VALID_EVENTS.map((event, index) => {
        const isEnabled = config.enabledEvents.includes(event);
        return (
          <Box key={event}>
            <Text color={selectedSection === 1 && selectedItem === index ? "blue" : "white"}>
              {isEnabled ? "✅" : "❌"} {event}
              {selectedSection === 1 && selectedItem === index ? " ← " : ""}
            </Text>
          </Box>
        );
      })}
    </Box>
  );

  const renderNotificationsSection = () => (
    <Box flexDirection="column">
      <Text color="blue" bold>通知类型</Text>
      {ConfigValidator.VALID_NOTIFICATION_TYPES.map((type, index) => (
        <Box key={type}>
          <Text color={selectedSection === 2 && selectedItem === index ? "blue" : "white"}>
            {config.notifications?.type === type ? "🔘" : "⚪"} {type}
            {selectedSection === 2 && selectedItem === index ? " ← " : ""}
          </Text>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="blue" bold>⚙️ 配置管理</Text>
      
      {message && (
        <Box>
          <Text>{message}</Text>
        </Box>
      )}

      <Box flexDirection="row" gap={4}>
        {renderModeSection()}
        {renderEventsSection()}
        {renderNotificationsSection()}
      </Box>

      <Box marginTop={2}>
        <Text color="gray" dimColor>
          ← → 切换部分 | ↑ ↓ 选择项目 | Enter 确认 | R 刷新 | Q 退出
        </Text>
      </Box>
    </Box>
  );
}