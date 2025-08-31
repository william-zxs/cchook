import { NotificationManager } from '../../notifiers/manager.js';
import { ConfigManager } from '../../config/manager.js';
import i18n from '../../utils/i18n.js';

export function notifyCommand(program) {
  program
    .command('notify')
    .alias('n')
    .description(i18n.t('notify.description'))
    .option('--access-token <token>', i18n.t('notify.access.token'))
    .option('--secret <secret>', i18n.t('notify.secret'))
    .option('--userid <ids>', i18n.t('notify.userid'))
    .option('--at-mobiles <mobiles>', i18n.t('notify.at.mobiles'))
    .option('--is-at-all', i18n.t('notify.is.at.all'))
    .option('--msg <message>', i18n.t('notify.message'), i18n.isChinese() ? '钉钉，让进步发生' : 'DingTalk, make progress happen')
    .option('--types <types>', i18n.t('notify.types'))
    .option('--title <title>', i18n.t('notify.title'))
    .option('--subtitle <subtitle>', i18n.t('notify.subtitle'))
    .option('--sound', i18n.t('notify.sound'), false)
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        
        const manager = new NotificationManager();
        
        // 解析通知类型，如果未指定则使用配置文件中的默认设置
        let types;
        if (options.types) {
          types = options.types.split(',').map(type => type.trim());
        } else {
          types = configManager.getDefaultNotificationTypes();
          console.log(i18n.t('notify.using.default.types', types.join(', ')));
        }
        
        // 注册通知器
        if (types.includes('dingtalk')) {
          // 优先使用命令行参数，其次使用配置文件
          let accessToken = options.accessToken;
          let secret = options.secret;
          
          if (!accessToken || !secret) {
            const dingtalkConfig = configManager.getDingTalkConfig();
            accessToken = accessToken || dingtalkConfig.accessToken;
            secret = secret || dingtalkConfig.secret;
          }
          
          if (!accessToken || !secret) {
            throw new Error(i18n.t('notify.dingtalk.config.missing'));
          }
          
          manager.registerDingTalk(accessToken, secret);
        }
        
        if (types.includes('macos')) {
          // 获取配置文件中的 macOS 配置
          const macosConfigFile = configManager.getMacOSConfig();
          
          const macosOptions = {
            title: options.title || macosConfigFile.title,
            subtitle: options.subtitle || macosConfigFile.subtitle,
            sound: options.sound !== undefined ? options.sound : macosConfigFile.sound
          };
          manager.registerMacOS(macosOptions);
        }
        
        // 设置启用的通知类型
        manager.setEnabledTypes(types);
        
        // 处理钉钉特定选项
        const notifyOptions = {};
        
        if (options.userid) {
          notifyOptions.atUserIds = options.userid.split(',').map(id => id.trim()).filter(id => id);
        }
        
        if (options.atMobiles) {
          notifyOptions.atMobiles = options.atMobiles.split(',').map(mobile => mobile.trim()).filter(mobile => mobile);
        }
        
        if (options.isAtAll) {
          notifyOptions.isAtAll = true;
        }
        
        // 发送通知
        console.log(i18n.t('notify.sending.to', types.join(', ')));
        console.log(i18n.t('notify.message.content', options.msg));
        
        const results = await manager.sendToAll(options.msg, notifyOptions);
        
        // 显示结果
        results.forEach(result => {
          if (result.success) {
            console.log(i18n.t('notify.success', result.type));
          } else {
            console.error(i18n.t('notify.failed', result.type, result.error));
          }
        });
        
        // 检查是否有失败的通知
        const hasFailures = results.some(result => !result.success);
        process.exit(hasFailures ? 1 : 0);
        
      } catch (error) {
        console.error(i18n.t('notify.error', error.message));
        process.exit(1);
      }
    });
}