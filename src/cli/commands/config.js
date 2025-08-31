import { ConfigManager } from '../../config/manager.js';
import i18n from '../../utils/i18n.js';

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
        console.log(i18n.t('config.show.notification.type', config.notifications.type));
        
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
}