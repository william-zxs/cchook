import { ConfigManager } from '../../config/manager.js';
import i18n from '../../utils/i18n.js';

export function switchCommand(program) {
  program
    .command('switch')
    .alias('sw')
    .description(i18n.isChinese() ? '切换通知方式' : 'Switch notification type')
    .argument('[types]', i18n.isChinese() ? '通知类型 (dingtalk, macos, 或 dingtalk,macos)' : 'Notification types (dingtalk, macos, or dingtalk,macos)')
    .option('--show', i18n.isChinese() ? '显示当前启用的通知方式' : 'Show current enabled notification types')
    .action(async (types, options) => {
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        
        // 显示当前通知方式
        if (options.show || !types) {
          const currentTypes = configManager.getDefaultNotificationTypes();
          console.log('\n' + (i18n.isChinese() ? '当前启用的通知方式:' : 'Currently enabled notification types:'));
          console.log('─'.repeat(30));
          
          if (currentTypes.length === 0) {
            console.log(i18n.isChinese() ? '  无' : '  None');
          } else {
            currentTypes.forEach(type => {
              const displayName = getNotificationTypeDisplayName(type);
              console.log(`  ✓ ${displayName}`);
            });
          }
          
          console.log('\n' + (i18n.isChinese() ? '使用方法:' : 'Usage:'));
          console.log('  cchook switch dingtalk     ' + (i18n.isChinese() ? '# 仅启用钉钉通知' : '# Enable only DingTalk'));
          console.log('  cchook switch macos        ' + (i18n.isChinese() ? '# 仅启用 macOS 通知' : '# Enable only macOS'));
          console.log('  cchook switch dingtalk,macos ' + (i18n.isChinese() ? '# 同时启用两种通知' : '# Enable both notifications'));
          console.log('');
          return;
        }
        
        // 解析通知类型
        const typeList = types.split(',').map(type => type.trim().toLowerCase());
        const validTypes = ['dingtalk', 'macos'];
        const invalidTypes = typeList.filter(type => !validTypes.includes(type));
        
        if (invalidTypes.length > 0) {
          throw new Error((i18n.isChinese() ? '无效的通知类型: ' : 'Invalid notification types: ') + 
                         invalidTypes.join(', ') + 
                         (i18n.isChinese() ? '。有效类型: ' : '. Valid types: ') + 
                         validTypes.join(', '));
        }
        
        // 设置新的通知类型
        await configManager.setDefaultNotificationTypes(typeList);
        
        console.log('\n' + (i18n.isChinese() ? '✓ 通知方式已切换为:' : '✓ Notification types switched to:'));
        typeList.forEach(type => {
          const displayName = getNotificationTypeDisplayName(type);
          console.log(`  ${displayName}`);
        });
        
        // 提供配置提示
        const needsDingtalkConfig = typeList.includes('dingtalk');
        const needsMacosConfig = typeList.includes('macos');
        
        if (needsDingtalkConfig || needsMacosConfig) {
          console.log('\n' + (i18n.isChinese() ? '配置提示:' : 'Configuration tips:'));
          
          if (needsDingtalkConfig) {
            const dingtalkConfig = configManager.getDingTalkConfig();
            if (!dingtalkConfig.accessToken || !dingtalkConfig.secret) {
              console.log('  ' + (i18n.isChinese() ? 
                '⚠ 钉钉通知需要配置 accessToken 和 secret:' : 
                '⚠ DingTalk notification requires accessToken and secret:'));
              console.log('    cchook config dingtalk --access-token <token> --secret <secret>');
            }
          }
          
          if (needsMacosConfig) {
            console.log('  ' + (i18n.isChinese() ? 
              'ℹ 可选配置 macOS 通知样式:' : 
              'ℹ Optional: Configure macOS notification style:'));
            console.log('    cchook config macos --title "自定义标题" --subtitle "副标题"');
          }
        }
        
        console.log('');
        
      } catch (error) {
        console.error((i18n.isChinese() ? '切换通知方式失败: ' : 'Failed to switch notification types: ') + error.message);
        process.exit(1);
      }
    });
}

/**
 * 获取通知类型的显示名称
 * @param {string} type 通知类型
 * @returns {string} 显示名称
 */
function getNotificationTypeDisplayName(type) {
  const displayNames = {
    'dingtalk': i18n.isChinese() ? '钉钉通知' : 'DingTalk',
    'macos': i18n.isChinese() ? 'macOS 系统通知' : 'macOS System Notification'
  };
  
  return displayNames[type] || type;
}