import { ConfigManager } from '../../config/manager.js';
import { FileSystemUtils } from '../../utils/fs.js';
import { Logger } from '../../utils/logger.js';
import i18n from '../../utils/i18n.js';
import chalk from 'chalk';

/**
 * 将底层技术实现类型映射为用户友好的显示名称
 * @param {string} type 底层通知类型
 * @returns {string} 用户友好的显示名称
 */
function getDisplayNotificationType(type) {
  const typeMapping = {
    'osascript': 'macos',
    'console': 'console', 
    'dingtalk': 'dingtalk',
    'macos': 'macos'
  };
  
  return typeMapping[type] || type;
}

/**
 * 获取事件的描述信息
 * @param {string} event 事件名称
 * @returns {string} 事件描述
 */
function getEventDescription(event) {
  const eventDescriptions = {
    'Notification': i18n.isChinese() ? '通知消息' : 'Notification messages',
    'Stop': i18n.isChinese() ? '停止事件' : 'Stop events',
    'SubagentStop': i18n.isChinese() ? '子代理停止' : 'Subagent stop',
    'UserPromptSubmit': i18n.isChinese() ? '用户提示提交' : 'User prompt submit',
    'PreToolUse': i18n.isChinese() ? '工具使用前' : 'Pre tool use',
    'PostToolUse': i18n.isChinese() ? '工具使用后' : 'Post tool use',
    'PreCompact': i18n.isChinese() ? '压缩前' : 'Pre compact',
    'SessionStart': i18n.isChinese() ? '会话开始' : 'Session start',
    'SessionEnd': i18n.isChinese() ? '会话结束' : 'Session end'
  };
  
  return eventDescriptions[event] || event;
}

export function statusCommand(program) {
  program
    .command('status')
    .description(i18n.t('status.description'))
    .option('-v, --verbose', i18n.t('status.verbose'))
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        const config = configManager.getConfig();

        // 系统信息
        console.log(chalk.blue.bold(i18n.t('status.system.title')));
        console.log('');

        // 工作模式
        const modeColor = config.mode === 'normal' ? 'green' : 'yellow';
        console.log(i18n.t('status.mode', chalk[modeColor](config.mode.toUpperCase())));

        // 通知配置
        const notificationType = config.notifications?.type || 'unknown';
        const displayNotificationType = getDisplayNotificationType(notificationType);
        console.log(i18n.t('status.notification.type', chalk.green(displayNotificationType)));

        // 启用的事件
        const enabledCount = config.enabledEvents.length;
        const totalEvents = 9; // 总事件数
        const eventsColor = enabledCount > 0 ? 'green' : 'red';
        
        if (enabledCount > 0) {
          const eventsList = config.enabledEvents.join(', ');
          console.log(i18n.t('status.enabled.events.names', chalk[eventsColor](eventsList)));
        } else {
          console.log(i18n.t('status.enabled.events.none'));
        }

        console.log('');

        // 配置文件状态
        console.log(chalk.blue.bold(i18n.t('status.config.files.title')));
        
        const cchookConfigExists = await FileSystemUtils.fileExists(
          FileSystemUtils.getCchookConfigPath()
        );
        const claudeConfigExists = await FileSystemUtils.fileExists(
          FileSystemUtils.getClaudeSettingsPath()
        );

        console.log(chalk.white('cchook 配置: ') + 
          (cchookConfigExists ? chalk.green('存在') : chalk.red('不存在')));
        
        console.log(chalk.white('Claude Code 配置: ') + 
          (claudeConfigExists ? chalk.green('存在') : chalk.yellow('不存在')));

        if (options.verbose) {
          console.log('');
          console.log(chalk.gray(`  cchook: ${FileSystemUtils.getCchookConfigPath()}`));
          console.log(chalk.gray(`  Claude: ${FileSystemUtils.getClaudeSettingsPath()}`));
        }

        console.log('');

        // 详细信息
        if (options.verbose) {
          console.log(chalk.blue.bold('详细配置'));
          
          // 启用的事件列表
          if (config.enabledEvents.length > 0) {
            console.log(chalk.white(i18n.t('status.enabled.events.list')));
            config.enabledEvents.forEach(event => {
              const description = getEventDescription(event);
              console.log(chalk.green('  + ') + chalk.white(event) + chalk.gray(` (${description})`));
            });
          } else {
            console.log(chalk.red(i18n.t('status.no.events')));
          }

          console.log('');

          // 通知配置详情
          console.log(chalk.white(i18n.t('status.notification.config')));
          console.log(i18n.t('status.notification.type.label', chalk.blue(displayNotificationType)));
          
          // 根据通知类型显示相应的配置详情
          if (notificationType === 'osascript' && config.notifications?.osascript) {
            const osConfig = config.notifications.osascript;
            console.log(i18n.t('status.notification.title', chalk.blue(osConfig.title || i18n.t('status.default'))));
            console.log(i18n.t('status.notification.subtitle', chalk.blue(osConfig.subtitle || i18n.t('status.default'))));
            console.log(i18n.t('status.notification.sound', chalk.blue(osConfig.sound || 'default')));
          } else if (notificationType === 'macos' && config.notifications?.macos) {
            const macosConfig = config.notifications.macos;
            console.log(i18n.t('status.notification.title', chalk.blue(macosConfig.title || i18n.t('status.default'))));
            console.log(i18n.t('status.notification.subtitle', chalk.blue(macosConfig.subtitle || i18n.t('status.default'))));
            console.log(i18n.t('status.notification.sound', chalk.blue(macosConfig.sound ? (i18n.isChinese() ? '启用' : 'Enabled') : (i18n.isChinese() ? '禁用' : 'Disabled'))));
          } else if (notificationType === 'dingtalk' && config.notifications?.dingtalk) {
            const dingtalkConfig = config.notifications.dingtalk;
            const tokenStatus = dingtalkConfig.accessToken ? (i18n.isChinese() ? '已配置' : 'Configured') : (i18n.isChinese() ? '未配置' : 'Not configured');
            const secretStatus = dingtalkConfig.secret ? (i18n.isChinese() ? '已配置' : 'Configured') : (i18n.isChinese() ? '未配置' : 'Not configured');
            console.log(chalk.blue('  Access Token: ') + (dingtalkConfig.accessToken ? chalk.green(tokenStatus) : chalk.red(tokenStatus)));
            console.log(chalk.blue('  Secret: ') + (dingtalkConfig.secret ? chalk.green(secretStatus) : chalk.red(secretStatus)));
          }

          console.log('');

          // 系统信息
          console.log(chalk.blue.bold('系统信息'));
          console.log(chalk.white('平台: ') + process.platform);
          console.log(chalk.white('Node.js: ') + process.version);
          console.log(chalk.white('工作目录: ') + chalk.gray(process.cwd()));
          
          if (config.createdAt) {
            console.log(chalk.white('配置创建: ') + chalk.gray(new Date(config.createdAt).toLocaleString()));
          }
          if (config.updatedAt) {
            console.log(chalk.white('最后更新: ') + chalk.gray(new Date(config.updatedAt).toLocaleString()));
          }
        }

        // 状态总结
        console.log('');
        if (config.mode === 'silent') {
          Logger.warning(i18n.t('status.warning.silent'));
        } else if (enabledCount === 0) {
          Logger.warning(i18n.t('status.warning.no.events'));
        } else if (!claudeConfigExists) {
          Logger.warning(i18n.t('status.warning.no.claude.config'));
        } else {
          Logger.success(i18n.t('status.success.normal'));
        }

        // 建议操作
        console.log('');
        if (!claudeConfigExists) {
          console.log(i18n.t('status.suggestion.setup'));
        } else if (enabledCount === 0) {
          console.log(i18n.t('status.suggestion.enable'));
        } else if (config.mode === 'silent') {
          console.log(chalk.cyan('建议操作: ') + '运行 `cchook mode normal` 启用通知');
        } else {
          console.log(chalk.cyan('建议操作: ') + '运行 `cchook test` 测试通知功能');
        }

      } catch (error) {
        Logger.error('获取状态信息失败:', error.message);
        process.exit(1);
      }
    });
}