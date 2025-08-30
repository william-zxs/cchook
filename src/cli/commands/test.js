import { NotificationFactory } from '../../notifications/factory.js';
import { ConfigManager } from '../../config/manager.js';
import { Logger } from '../../utils/logger.js';

export function testCommand(program) {
  program
    .command('test [type]')
    .description('Test notification functionality')
    .option('-a, --all', 'Test all notification types')
    .option('-c, --current', 'Test currently configured notification type')
    .action(async (type, options) => {
      try {
        if (options.all) {
          await testAllNotifiers();
        } else if (options.current || !type) {
          await testCurrentConfig();
        } else {
          await testSpecificNotifier(type);
        }
      } catch (error) {
        Logger.error('Test failed:', error.message);
        process.exit(1);
      }
    });
}

async function testCurrentConfig() {
  Logger.info('🧪 Testing current notification configuration...');
  
  try {
    const configManager = new ConfigManager();
    const config = await configManager.loadConfig();
    
    if (config.mode === 'silent') {
      Logger.warning('🔕 Currently in silent mode, notifications are disabled');
      Logger.info('💡 Run `cchook mode normal` to enable notifications');
      return;
    }

    if (config.enabledEvents.length === 0) {
      Logger.warning('⚠️  No events are enabled');
      Logger.info('💡 Run `cchook events add Notification` to enable basic notifications');
      return;
    }

    const notificationConfig = config.notifications;
    const notifier = NotificationFactory.create(notificationConfig.type, notificationConfig);
    
    Logger.info(`Testing ${notificationConfig.type} notifications...`);
    
    const result = await notifier.notify({
      title: 'cchook Test',
      message: 'This is a test notification',
      subtitle: `Notification type: ${notificationConfig.type}`
    });
    
    if (result.success) {
      Logger.success(`✅ ${notificationConfig.type} notification test successful`);
      Logger.info('If you saw the notification, the configuration is working properly');
    } else {
      Logger.error(`❌ ${notificationConfig.type} notification test failed: ${result.error}`);
      
      // 提供故障排除建议
      if (notificationConfig.type === 'osascript' && process.platform !== 'darwin') {
        Logger.warning('💡 osascript is only available on macOS');
        Logger.info('Recommend switching to console notifications: cchook setup');
      }
    }

  } catch (error) {
    Logger.error('Testing current configuration failed:', error.message);
  }
}

async function testSpecificNotifier(type) {
  Logger.info(`🧪 Testing ${type} notifications...`);
  
  const supportedTypes = NotificationFactory.getSupportedTypes();
  
  if (!supportedTypes.includes(type)) {
    Logger.error(`Unsupported notification type: ${type}`);
    Logger.info(`Supported types: ${supportedTypes.join(', ')}`);
    return;
  }

  try {
    const result = await NotificationFactory.testNotifier(type);
    
    if (result.success) {
      Logger.success(`✅ ${type} notification test successful`);
    } else {
      Logger.error(`❌ ${type} notification test failed: ${result.error}`);
      
      // 针对不同类型提供建议
      if (type === 'osascript') {
        if (process.platform !== 'darwin') {
          Logger.warning('💡 osascript is only available on macOS');
        } else {
          Logger.info('💡 Please check if system notification settings allow terminal apps to send notifications');
        }
      }
    }
  } catch (error) {
    Logger.error(`${type} notification test error:`, error.message);
  }
}

async function testAllNotifiers() {
  Logger.info('🧪 Testing all notification types...');
  console.log('');
  
  const supportedTypes = NotificationFactory.getSupportedTypes();
  const results = [];
  
  for (const type of supportedTypes) {
    try {
      Logger.info(`Testing ${type}...`);
      
      const result = await NotificationFactory.testNotifier(type, {
        [type]: {
          title: 'cchook Comprehensive Test',
          subtitle: `Testing ${type} notifications`
        }
      });
      
      results.push({ type, success: result.success, error: result.error });
      
      if (result.success) {
        Logger.success(`✅ ${type} test successful`);
      } else {
        Logger.error(`❌ ${type} test failed: ${result.error}`);
      }
      
      // 在测试之间稍作延迟，避免通知过于密集
      if (supportedTypes.indexOf(type) < supportedTypes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      Logger.error(`${type} test error:`, error.message);
      results.push({ type, success: false, error: error.message });
    }
  }
  
  // 测试总结
  console.log('');
  Logger.info('📊 Test Summary:');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Successful: ${successful}/${total}`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} ${result.type}`);
    if (!result.success && result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  if (successful > 0) {
    Logger.success('🎉 At least one notification type works properly');
  } else {
    Logger.warning('⚠️  No notification types work properly, please check system settings');
  }
  
  // 推荐最佳通知类型
  const workingTypes = results.filter(r => r.success).map(r => r.type);
  if (workingTypes.length > 0) {
    const recommended = process.platform === 'darwin' && workingTypes.includes('osascript') 
      ? 'osascript' 
      : workingTypes[0];
    
    Logger.info(`💡 Recommended: ${recommended}`);
    Logger.info(`Setup command: cchook setup`);
  }
}