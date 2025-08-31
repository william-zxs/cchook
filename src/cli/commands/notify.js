import { NotificationManager } from '../../notifiers/manager.js';
import { ConfigManager } from '../../config/manager.js';

export function notifyCommand(program) {
  program
    .command('notify')
    .alias('n')
    .description('发送通知（钉钉机器人和macOS系统通知）')
    .option('--access-token <token>', '机器人webhook的access_token（可选，优先使用配置文件）')
    .option('--secret <secret>', '机器人安全设置的加签secret（可选，优先使用配置文件）')
    .option('--userid <ids>', '待@的钉钉用户ID，多个用逗号分隔')
    .option('--at-mobiles <mobiles>', '待@的手机号，多个用逗号分隔')
    .option('--is-at-all', '是否@所有人')
    .option('--msg <message>', '要发送的消息内容', '钉钉，让进步发生')
    .option('--types <types>', '通知类型，多个用逗号分隔 (dingtalk,macos)，不指定则使用配置文件中的默认设置')
    .option('--title <title>', 'macOS 通知标题')
    .option('--subtitle <subtitle>', 'macOS 通知副标题')
    .option('--sound', 'macOS 通知是否播放声音', false)
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
          console.log(`使用默认通知类型: ${types.join(', ')}`);
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
            throw new Error('钉钉配置缺失：请在配置文件中设置 accessToken 和 secret，或使用命令行参数提供');
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
        console.log(`正在发送通知到: ${types.join(', ')}`);
        console.log(`消息内容: ${options.msg}`);
        
        const results = await manager.sendToAll(options.msg, notifyOptions);
        
        // 显示结果
        results.forEach(result => {
          if (result.success) {
            console.log(`✅ ${result.type} 通知发送成功`);
          } else {
            console.error(`❌ ${result.type} 通知发送失败: ${result.error}`);
          }
        });
        
        // 检查是否有失败的通知
        const hasFailures = results.some(result => !result.success);
        process.exit(hasFailures ? 1 : 0);
        
      } catch (error) {
        console.error('错误:', error.message);
        process.exit(1);
      }
    });
}