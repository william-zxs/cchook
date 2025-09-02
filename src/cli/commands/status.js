import { ConfigManager } from '../../config/manager.js';
import { FileSystemUtils } from '../../utils/fs.js';
import { Logger } from '../../utils/logger.js';
import { ErrorHandler } from '../../utils/error-handler.js';
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
    .action(ErrorHandler.wrapAsyncCommand(async (options) => {
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
        const defaultTypes = configManager.getDefaultNotificationTypes();
        const displayTypes = defaultTypes.map(type => getDisplayNotificationType(type)).join(', ');
        console.log(i18n.t('status.notification.type', chalk.green(displayTypes)));

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

        console.log(i18n.t('status.config.cchook', 
          (cchookConfigExists ? chalk.green(i18n.t('status.config.exists')) : chalk.red(i18n.t('status.config.not.exists')))));
        
        console.log(i18n.t('status.config.claude', 
          (claudeConfigExists ? chalk.green(i18n.t('status.config.exists')) : chalk.yellow(i18n.t('status.config.not.exists')))));

        if (options.verbose) {
          console.log('');
          console.log(chalk.gray(`  cchook: ${FileSystemUtils.getCchookConfigPath()}`));
          console.log(chalk.gray(`  Claude: ${FileSystemUtils.getClaudeSettingsPath()}`));
        }

        console.log('');

        // 详细信息
        if (options.verbose) {
          console.log(chalk.blue.bold(i18n.t('status.detailed.title')));
          
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
          console.log(i18n.t('status.notification.type.label', chalk.blue(displayTypes)));
          
          // 根据默认通知类型显示相应的配置详情
          defaultTypes.forEach(type => {
            if (type === 'macos' && config.notifications?.macos) {
              const macosConfig = config.notifications.macos;
              console.log(chalk.white(`\n  ${i18n.isChinese() ? 'macOS 配置' : 'macOS Configuration'}:`));
              console.log(i18n.t('status.notification.title', chalk.blue(macosConfig.title || i18n.t('status.default'))));
              console.log(i18n.t('status.notification.subtitle', chalk.blue(macosConfig.subtitle || i18n.t('status.default'))));
              console.log(i18n.t('status.notification.sound', chalk.blue(macosConfig.sound ? (i18n.isChinese() ? '启用' : 'Enabled') : (i18n.isChinese() ? '禁用' : 'Disabled'))));
            } else if (type === 'dingtalk' && config.notifications?.dingtalk) {
              const dingtalkConfig = config.notifications.dingtalk;
              const tokenStatus = dingtalkConfig.accessToken ? (i18n.isChinese() ? '已配置' : 'Configured') : (i18n.isChinese() ? '未配置' : 'Not configured');
              const secretStatus = dingtalkConfig.secret ? (i18n.isChinese() ? '已配置' : 'Configured') : (i18n.isChinese() ? '未配置' : 'Not configured');
              console.log(chalk.white(`\n  ${i18n.isChinese() ? '钉钉配置' : 'DingTalk Configuration'}:`));
              console.log(chalk.blue('    Access Token: ') + (dingtalkConfig.accessToken ? chalk.green(tokenStatus) : chalk.red(tokenStatus)));
              console.log(chalk.blue('    Secret: ') + (dingtalkConfig.secret ? chalk.green(secretStatus) : chalk.red(secretStatus)));
            }
          });

          console.log('');

          // 系统信息
          console.log(chalk.blue.bold(i18n.t('status.system.info.title')));
          console.log(i18n.t('status.platform', process.platform));
          console.log(i18n.t('status.node.version', process.version));
          console.log(i18n.t('status.working.directory', chalk.gray(process.cwd())));
          
          if (config.createdAt) {
            console.log(i18n.t('status.created.at', chalk.gray(new Date(config.createdAt).toLocaleString())));
          }
          if (config.updatedAt) {
            console.log(i18n.t('status.updated.at', chalk.gray(new Date(config.updatedAt).toLocaleString())));
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
          console.log(i18n.t('status.suggestion.mode.normal'));
        } else {
          console.log(i18n.t('status.suggestion.test'));
        }
        
        // 添加通知方式切换提示
        console.log(i18n.t('status.suggestion.switch'));
    }, 'status'));
}