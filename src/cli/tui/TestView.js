import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { NotificationFactory } from '../../notifications/factory.js';
import { ConfigManager } from '../../config/manager.js';

export function TestView() {
  const [selectedTest, setSelectedTest] = useState(0);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const testItems = [
    { name: '系统通知 (osascript)', type: 'osascript' },
    { name: '控制台通知', type: 'console' },
    { name: '当前配置通知', type: 'current' },
    { name: '所有通知类型', type: 'all' },
    { name: '清除结果', type: 'clear' }
  ];

  useInput((input, key) => {
    if (testing) return;

    if (key.upArrow) {
      setSelectedTest(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedTest(prev => Math.min(testItems.length - 1, prev + 1));
    } else if (key.return) {
      handleTest();
    }
  });

  const handleTest = async () => {
    if (testing) return;

    const selectedItem = testItems[selectedTest];
    
    if (selectedItem.type === 'clear') {
      setResults([]);
      return;
    }

    setTesting(true);

    try {
      if (selectedItem.type === 'all') {
        await testAllNotifiers();
      } else if (selectedItem.type === 'current') {
        await testCurrentConfig();
      } else {
        await testSpecificNotifier(selectedItem.type);
      }
    } catch (error) {
      addResult(`❌ 测试失败: ${error.message}`, 'error');
    }

    setTesting(false);
  };

  const testSpecificNotifier = async (type) => {
    addResult(`🧪 正在测试 ${type} 通知...`, 'info');
    
    try {
      const result = await NotificationFactory.testNotifier(type);
      
      if (result.success) {
        addResult(`✅ ${type} 通知测试成功`, 'success');
      } else {
        addResult(`❌ ${type} 通知测试失败: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ ${type} 通知测试异常: ${error.message}`, 'error');
    }
  };

  const testCurrentConfig = async () => {
    addResult('🧪 正在测试当前配置的通知...', 'info');
    
    try {
      const configManager = new ConfigManager();
      const config = await configManager.loadConfig();
      
      if (config.mode === 'silent') {
        addResult('🔕 当前为静音模式，通知被禁用', 'warning');
        return;
      }

      const notificationConfig = config.notifications;
      const notifier = NotificationFactory.create(notificationConfig.type, notificationConfig);
      
      const result = await notifier.testNotification();
      
      if (result.success) {
        addResult(`✅ 当前配置 (${notificationConfig.type}) 通知测试成功`, 'success');
      } else {
        addResult(`❌ 当前配置通知测试失败: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ 测试当前配置失败: ${error.message}`, 'error');
    }
  };

  const testAllNotifiers = async () => {
    addResult('🧪 正在测试所有通知类型...', 'info');
    
    const supportedTypes = NotificationFactory.getSupportedTypes();
    
    for (const type of supportedTypes) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 延迟避免通知过快
      await testSpecificNotifier(type);
    }
    
    addResult('🎯 所有通知类型测试完成', 'info');
  };

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [
      ...prev,
      { message, type, timestamp, id: Date.now() }
    ]);
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'warning': return 'yellow';
      default: return 'blue';
    }
  };

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="blue" bold>🧪 通知测试</Text>
      
      {/* 测试选项 */}
      <Box flexDirection="column">
        <Text color="white">选择测试类型:</Text>
        {testItems.map((item, index) => (
          <Box key={index} marginLeft={2}>
            <Text color={selectedTest === index ? "blue" : "white"}>
              {selectedTest === index ? "▶ " : "  "}
              {item.name}
            </Text>
          </Box>
        ))}
      </Box>

      {testing && (
        <Box>
          <Text color="yellow">⏳ 正在执行测试...</Text>
        </Box>
      )}

      {/* 测试结果 */}
      {results.length > 0 && (
        <Box flexDirection="column">
          <Text color="white">测试结果:</Text>
          <Box 
            flexDirection="column" 
            marginLeft={2} 
            maxHeight={8}
            overflow="hidden"
          >
            {results.slice(-8).map(result => (
              <Box key={result.id}>
                <Text color="gray">[{result.timestamp}] </Text>
                <Text color={getResultColor(result.type)}>
                  {result.message}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          ↑ ↓ 选择测试 | Enter 执行测试 | Q 退出
        </Text>
      </Box>
    </Box>
  );
}