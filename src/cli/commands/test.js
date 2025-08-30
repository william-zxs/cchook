import { NotificationFactory } from '../../notifications/factory.js';
import { ConfigManager } from '../../config/manager.js';
import { Logger } from '../../utils/logger.js';

export function testCommand(program) {
  program
    .command('test [type]')
    .description('测试通知功能')
    .option('-a, --all', '测试所有通知类型')
    .option('-c, --current', '测试当前配置的通知类型')
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
        Logger.error('测试失败:', error.message);
        process.exit(1);
      }
    });
}

async function testCurrentConfig() {
  Logger.info('🧪 正在测试当前配置的通知...');
  
  try {
    const configManager = new ConfigManager();
    const config = await configManager.loadConfig();
    
    if (config.mode === 'silent') {
      Logger.warning('🔕 当前为静音模式，通知被禁用');
      Logger.info('💡 运行 `cchook mode normal` 启用通知');
      return;
    }

    if (config.enabledEvents.length === 0) {
      Logger.warning('⚠️  没有启用任何事件');
      Logger.info('💡 运行 `cchook events add Notification` 启用基本通知');
      return;
    }

    const notificationConfig = config.notifications;
    const notifier = NotificationFactory.create(notificationConfig.type, notificationConfig);
    
    Logger.info(`测试 ${notificationConfig.type} 通知...`);
    
    const result = await notifier.notify({
      title: 'cchook 测试',
      message: '这是一个测试通知',
      subtitle: `通知类型: ${notificationConfig.type}`
    });
    
    if (result.success) {
      Logger.success(`✅ ${notificationConfig.type} 通知测试成功`);
      Logger.info('如果您看到了通知，说明配置正常工作');
    } else {
      Logger.error(`❌ ${notificationConfig.type} 通知测试失败: ${result.error}`);
      
      // 提供故障排除建议
      if (notificationConfig.type === 'osascript' && process.platform !== 'darwin') {
        Logger.warning('💡 osascript 仅在 macOS 上可用');
        Logger.info('建议切换到控制台通知: cchook 进入 TUI > 配置 > 通知类型');
      }
    }

  } catch (error) {
    Logger.error('测试当前配置失败:', error.message);
  }
}

async function testSpecificNotifier(type) {
  Logger.info(`🧪 正在测试 ${type} 通知...`);
  
  const supportedTypes = NotificationFactory.getSupportedTypes();
  
  if (!supportedTypes.includes(type)) {
    Logger.error(`不支持的通知类型: ${type}`);
    Logger.info(`支持的类型: ${supportedTypes.join(', ')}`);
    return;
  }

  try {
    const result = await NotificationFactory.testNotifier(type);
    
    if (result.success) {
      Logger.success(`✅ ${type} 通知测试成功`);
    } else {
      Logger.error(`❌ ${type} 通知测试失败: ${result.error}`);
      
      // 针对不同类型提供建议
      if (type === 'osascript') {
        if (process.platform !== 'darwin') {
          Logger.warning('💡 osascript 仅在 macOS 上可用');
        } else {
          Logger.info('💡 请检查系统通知设置是否允许终端应用发送通知');
        }
      }
    }
  } catch (error) {
    Logger.error(`${type} 通知测试异常:`, error.message);
  }
}

async function testAllNotifiers() {
  Logger.info('🧪 正在测试所有通知类型...');
  console.log('');
  
  const supportedTypes = NotificationFactory.getSupportedTypes();
  const results = [];
  
  for (const type of supportedTypes) {
    try {
      Logger.info(`测试 ${type}...`);
      
      const result = await NotificationFactory.testNotifier(type, {
        [type]: {
          title: 'cchook 全面测试',
          subtitle: `测试 ${type} 通知`
        }
      });
      
      results.push({ type, success: result.success, error: result.error });
      
      if (result.success) {
        Logger.success(`✅ ${type} 测试成功`);
      } else {
        Logger.error(`❌ ${type} 测试失败: ${result.error}`);
      }
      
      // 在测试之间稍作延迟，避免通知过于密集
      if (supportedTypes.indexOf(type) < supportedTypes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      Logger.error(`${type} 测试异常:`, error.message);
      results.push({ type, success: false, error: error.message });
    }
  }
  
  // 测试总结
  console.log('');
  Logger.info('📊 测试总结:');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`成功: ${successful}/${total}`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} ${result.type}`);
    if (!result.success && result.error) {
      console.log(`    错误: ${result.error}`);
    }
  });
  
  if (successful > 0) {
    Logger.success('🎉 至少有一种通知类型可以正常工作');
  } else {
    Logger.warning('⚠️  没有通知类型可以正常工作，请检查系统设置');
  }
  
  // 推荐最佳通知类型
  const workingTypes = results.filter(r => r.success).map(r => r.type);
  if (workingTypes.length > 0) {
    const recommended = process.platform === 'darwin' && workingTypes.includes('osascript') 
      ? 'osascript' 
      : workingTypes[0];
    
    Logger.info(`💡 推荐使用: ${recommended}`);
    Logger.info(`设置命令: cchook 进入 TUI > 配置 > 通知类型`);
  }
}