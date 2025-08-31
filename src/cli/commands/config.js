import { ConfigManager } from '../../config/manager.js';

export function configCommand(program) {
  const configCmd = program
    .command('config')
    .alias('c')
    .description('配置管理');

  // 设置钉钉配置
  configCmd
    .command('dingtalk')
    .alias('dt')
    .description('配置钉钉机器人')
    .requiredOption('--access-token <token>', '机器人webhook的access_token')
    .requiredOption('--secret <secret>', '机器人安全设置的加签secret')
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        await configManager.setDingTalkConfig(options.accessToken, options.secret);
        console.log('✅ 钉钉配置已保存到 ~/.cchook/config.json');
      } catch (error) {
        console.error('❌ 配置钉钉失败:', error.message);
        process.exit(1);
      }
    });

  // 设置 macOS 配置
  configCmd
    .command('macos')
    .alias('mac')
    .description('配置 macOS 系统通知')
    .option('--title <title>', '通知标题', '钉钉机器人通知')
    .option('--subtitle <subtitle>', '通知副标题', '')
    .option('--sound [enabled]', '是否播放声音', true)
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        const macosConfig = {
          title: options.title,
          subtitle: options.subtitle,
          sound: options.sound !== false
        };
        await configManager.setMacOSConfig(macosConfig);
        console.log('✅ macOS 通知配置已保存');
      } catch (error) {
        console.error('❌ 配置 macOS 通知失败:', error.message);
        process.exit(1);
      }
    });

  // 显示当前配置
  configCmd
    .command('show')
    .alias('s')
    .description('显示当前配置')
    .action(async () => {
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        const config = configManager.getConfig();
        
        console.log('\n📋 当前配置:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // 钉钉配置
        const dingtalkConfig = configManager.getDingTalkConfig();
        console.log('\n🔔 钉钉机器人配置:');
        console.log(`  Access Token: ${dingtalkConfig.accessToken ? '已设置' : '❌ 未设置'}`);
        console.log(`  Secret: ${dingtalkConfig.secret ? '已设置' : '❌ 未设置'}`);
        
        // macOS 配置
        const macosConfig = configManager.getMacOSConfig();
        console.log('\n🍎 macOS 通知配置:');
        console.log(`  标题: ${macosConfig.title}`);
        console.log(`  副标题: ${macosConfig.subtitle || '无'}`);
        console.log(`  声音: ${macosConfig.sound ? '启用' : '禁用'}`);
        
        // 默认通知类型
        const defaultTypes = configManager.getDefaultNotificationTypes();
        console.log('\n🎯 默认通知类型:');
        console.log(`  ${defaultTypes.join(', ')}`);
        
        // 其他配置
        console.log('\n⚙️  其他配置:');
        console.log(`  模式: ${config.mode}`);
        console.log(`  启用事件: ${config.enabledEvents.join(', ')}`);
        console.log(`  通知类型: ${config.notifications.type}`);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } catch (error) {
        console.error('❌ 显示配置失败:', error.message);
        process.exit(1);
      }
    });

  // 重置配置
  configCmd
    .command('reset')
    .alias('r')
    .description('重置配置到默认值')
    .option('--confirm', '确认重置（必需）')
    .action(async (options) => {
      if (!options.confirm) {
        console.log('⚠️  此操作将重置所有配置到默认值');
        console.log('如需确认，请使用: cchook config reset --confirm');
        return;
      }
      
      try {
        const configManager = new ConfigManager();
        // 强制使用默认配置
        configManager.config = null;
        await configManager.loadConfig();
        console.log('✅ 配置已重置到默认值');
      } catch (error) {
        console.error('❌ 重置配置失败:', error.message);
        process.exit(1);
      }
    });

  // 设置默认通知类型
  configCmd
    .command('types')
    .alias('t')
    .description('设置默认通知类型')
    .requiredOption('--set <types>', '通知类型，多个用逗号分隔 (dingtalk,macos)')
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        const types = options.set.split(',').map(type => type.trim());
        await configManager.setDefaultNotificationTypes(types);
        console.log(`✅ 默认通知类型已设置为: ${types.join(', ')}`);
      } catch (error) {
        console.error('❌ 设置默认通知类型失败:', error.message);
        process.exit(1);
      }
    });

  // 查看可用的通知类型
  configCmd
    .command('list-types')
    .alias('lt')
    .description('列出所有可用的通知类型')
    .action(() => {
      console.log('\n📋 可用的通知类型:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔔 dingtalk  - 钉钉机器人通知');
      console.log('🍎 macos     - macOS 系统通知');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n💡 使用方法:');
      console.log('  # 设置单个默认类型');
      console.log('  cchook config types --set dingtalk');
      console.log('\n  # 设置多个默认类型');
      console.log('  cchook config types --set "dingtalk,macos"');
      console.log('\n  # 临时指定类型');
      console.log('  cchook notify --types "dingtalk,macos" --msg "消息内容"');
      console.log('');
    });
}