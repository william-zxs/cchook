import { ConfigManager } from '../../config/manager.js';
import { NotificationFactory } from '../../notifications/factory.js';
import { Logger } from '../../utils/logger.js';
import i18n from '../../utils/i18n.js';
import { eventsSubcommand } from './events.js';

/**
 * 将底层技术实现类型映射为用户友好的显示名称
 * @param {string} type 底层通知类型
 * @returns {string} 用户友好的显示名称
 */
function getDisplayNotificationType(type) {
  const typeMapping = {
    'osascript': 'macos',
    'dingtalk': 'dingtalk',
    'macos': 'macos'
  };
  
  return typeMapping[type] || type;
}

export function configCommand(program) {
  const configCmd = program
    .command('config')
    .alias('c')
    .description(i18n.t('config.description'));

  // 设置钉钉配置
  configCmd
    .command('dingtalk')
    .alias('dt')
    .description(i18n.t('config.dingtalk.description'))
    .requiredOption('--access-token <token>', i18n.t('config.dingtalk.access.token'))
    .requiredOption('--secret <secret>', i18n.t('config.dingtalk.secret'))
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        await configManager.setDingTalkConfig(options.accessToken, options.secret);
        console.log(i18n.t('config.dingtalk.saved'));
      } catch (error) {
        console.error(i18n.t('config.dingtalk.failed', error.message));
        process.exit(1);
      }
    });

  // 设置 macOS 配置
  configCmd
    .command('macos')
    .alias('mac')
    .description(i18n.t('config.macos.description'))
    .option('--title <title>', i18n.t('config.macos.title'), i18n.isChinese() ? '钉钉机器人通知' : 'DingTalk Robot Notification')
    .option('--subtitle <subtitle>', i18n.t('config.macos.subtitle'), '')
    .option('--sound [enabled]', i18n.t('config.macos.sound'), true)
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        const macosConfig = {
          title: options.title,
          subtitle: options.subtitle,
          sound: options.sound !== false
        };
        await configManager.setMacOSConfig(macosConfig);
        console.log(i18n.t('config.macos.saved'));
      } catch (error) {
        console.error(i18n.t('config.macos.failed', error.message));
        process.exit(1);
      }
    });

  // 显示当前配置
  configCmd
    .command('show')
    .alias('s')
    .description(i18n.t('config.show.description'))
    .action(async () => {
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        const config = configManager.getConfig();
        
        console.log('\n' + i18n.t('config.show.title'));
        console.log(i18n.t('config.show.separator'));
        
        // 钉钉配置
        const dingtalkConfig = configManager.getDingTalkConfig();
        console.log('\n' + i18n.t('config.show.dingtalk.title'));
        console.log(i18n.t('config.show.dingtalk.token', dingtalkConfig.accessToken ? i18n.t('config.show.dingtalk.configured') : i18n.t('config.show.dingtalk.not.configured')));
        console.log(i18n.t('config.show.dingtalk.secret', dingtalkConfig.secret ? i18n.t('config.show.dingtalk.configured') : i18n.t('config.show.dingtalk.not.configured')));
        
        // macOS 配置
        const macosConfig = configManager.getMacOSConfig();
        console.log('\n' + i18n.t('config.show.macos.title'));
        console.log(i18n.t('config.show.macos.title.value', macosConfig.title));
        console.log(i18n.t('config.show.macos.subtitle.value', macosConfig.subtitle || i18n.t('config.show.macos.subtitle.none')));
        console.log(i18n.t('config.show.macos.sound.value', macosConfig.sound ? i18n.t('config.show.macos.sound.enabled') : i18n.t('config.show.macos.sound.disabled')));
        
        // 默认通知类型
        const defaultTypes = configManager.getDefaultNotificationTypes();
        console.log('\n' + i18n.t('config.show.default.types.title'));
        console.log(`  ${defaultTypes.join(', ')}`);
        
        // 其他配置
        console.log('\n' + i18n.t('config.show.other.title'));
        console.log(i18n.t('config.show.mode', config.mode));
        console.log(i18n.t('config.show.enabled.events', config.enabledEvents.join(', ')));
        
        // 将底层技术实现类型映射为用户友好的显示名称
        const displayType = getDisplayNotificationType(config.notifications.type);
        console.log(i18n.t('config.show.notification.type', displayType));
        
        console.log(i18n.t('config.show.separator') + '\n');
      } catch (error) {
        console.error(i18n.t('config.show.failed', error.message));
        process.exit(1);
      }
    });

  // 重置配置
  configCmd
    .command('reset')
    .alias('r')
    .description(i18n.t('config.reset.description'))
    .option('--confirm', i18n.t('config.reset.confirm'))
    .action(async (options) => {
      if (!options.confirm) {
        console.log(i18n.t('config.reset.warning'));
        console.log(i18n.t('config.reset.instruction'));
        return;
      }
      
      try {
        const configManager = new ConfigManager();
        // 强制使用默认配置
        configManager.config = null;
        await configManager.loadConfig();
        console.log(i18n.t('config.reset.success'));
      } catch (error) {
        console.error(i18n.t('config.reset.failed', error.message));
        process.exit(1);
      }
    });

  // 设置默认通知类型
  configCmd
    .command('types')
    .alias('t')
    .description(i18n.t('config.types.description'))
    .requiredOption('--set <types>', i18n.t('config.types.set'))
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        const types = options.set.split(',').map(type => type.trim());
        await configManager.setDefaultNotificationTypes(types);
        console.log(i18n.t('config.types.success', types.join(', ')));
      } catch (error) {
        console.error(i18n.t('config.types.failed', error.message));
        process.exit(1);
      }
    });

  // 查看可用的通知类型
  configCmd
    .command('list-types')
    .alias('lt')
    .description(i18n.t('config.list.types.description'))
    .action(() => {
      console.log('\n' + i18n.t('config.list.types.title'));
      console.log(i18n.t('config.show.separator'));
      console.log(i18n.t('config.list.types.dingtalk'));
      console.log(i18n.t('config.list.types.macos'));
      console.log(i18n.t('config.show.separator'));
      console.log('\n' + i18n.t('config.list.types.usage.title'));
      console.log(i18n.t('config.list.types.usage.single'));
      console.log(i18n.t('config.list.types.usage.single.example'));
      console.log('\n' + i18n.t('config.list.types.usage.multiple'));
      console.log(i18n.t('config.list.types.usage.multiple.example'));
      console.log('\n' + i18n.t('config.list.types.usage.temporary'));
      console.log(i18n.t('config.list.types.usage.temporary.example'));
      console.log('');
    });

  // 测试当前配置
  configCmd
    .command('test')
    .description(i18n.t('config.test.description'))
    .option('-a, --all', i18n.t('config.test.all'))
    .action(async (options) => {
      try {
        if (options.all) {
          await testAllNotifiers();
        } else {
          await testCurrentConfig();
        }
      } catch (error) {
        console.error(i18n.t('config.test.failed', error.message));
        process.exit(1);
      }
    });

  // 添加 events 子命令
  eventsSubcommand(configCmd);
}

async function testCurrentConfig() {
  Logger.info('[TEST] Testing current notification configuration...');
  
  try {
    const configManager = new ConfigManager();
    const config = await configManager.loadConfig();
    
    if (config.mode === 'silent') {
      Logger.warning('Currently in silent mode, notifications are disabled');
      Logger.info('Run `cchook mode normal` to enable notifications');
      return;
    }

    if (config.enabledEvents.length === 0) {
      Logger.warning('No events are enabled');
      Logger.info('Run `cchook events add Notification` to enable basic notifications');
      return;
    }

    const notificationConfig = config.notifications;
    const defaultTypes = configManager.getDefaultNotificationTypes();
    
    Logger.info(`Testing default notification types: ${defaultTypes.join(', ')}`);
    
    const results = [];
    
    for (const type of defaultTypes) {
      try {
        const notifier = NotificationFactory.create(type, notificationConfig);
        
        Logger.info(`Testing ${type}...`);
        
        const result = await notifier.notify({
          title: 'cchook Test',
          message: 'This is a test notification',
          subtitle: `Notification type: ${type}`
        });
        
        results.push({ type, ...result });
        
        if (result.success) {
          Logger.success(`${type} notification test successful`);
        } else {
          Logger.error(`[FAILED] ${type} notification test failed: ${result.error}`);
        }
        
        // 测试间隔
        if (defaultTypes.indexOf(type) < defaultTypes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        Logger.error(`${type} notification test error:`, error.message);
        results.push({ type, success: false, error: error.message });
      }
    }
    
    // 显示测试结果总结
    const successful = results.filter(r => r.success).length;
    if (successful > 0) {
      Logger.success(`${successful}/${defaultTypes.length} notification types working`);
      Logger.info('If you saw the notifications, the configuration is working properly');
    } else {
      Logger.error('All notification tests failed');
    }

  } catch (error) {
    Logger.error('Testing current configuration failed:', error.message);
  }
}

async function testAllNotifiers() {
  Logger.info('[TEST] Testing all notification types...');
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
        Logger.success(`[SUCCESS] ${type} test successful`);
      } else {
        Logger.error(`[FAILED] ${type} test failed: ${result.error}`);
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
  Logger.info('=== Test Summary ===');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Successful: ${successful}/${total}`);
  
  results.forEach(result => {
    const status = result.success ? '[SUCCESS]' : '[FAILED]';
    console.log(`  ${status} ${result.type}`);
    if (!result.success && result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  if (successful > 0) {
    Logger.success('[SUCCESS] At least one notification type works properly');
  } else {
    Logger.warning('[WARNING] No notification types work properly, please check system settings');
  }
  
  // 推荐最佳通知类型
  const workingTypes = results.filter(r => r.success).map(r => r.type);
  if (workingTypes.length > 0) {
    const recommended = process.platform === 'darwin' && workingTypes.includes('osascript') 
      ? 'osascript' 
      : workingTypes[0];
    
    Logger.info(`[RECOMMENDATION] ${recommended}`);
    Logger.info(`Setup command: cchook setup`);
  }
}