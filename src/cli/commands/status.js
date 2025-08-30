import { ConfigManager } from '../../config/manager.js';
import { FileSystemUtils } from '../../utils/fs.js';
import { Logger } from '../../utils/logger.js';
import chalk from 'chalk';

export function statusCommand(program) {
  program
    .command('status')
    .description('显示当前配置状态')
    .option('-v, --verbose', '显示详细信息')
    .action(async (options) => {
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        const config = configManager.getConfig();

        // 系统信息
        console.log(chalk.blue.bold('📊 cchook 系统状态'));
        console.log('');

        // 工作模式
        const modeColor = config.mode === 'normal' ? 'green' : 'yellow';
        const modeIcon = config.mode === 'normal' ? '🔔' : '🔕';
        console.log(chalk.white('工作模式: ') + chalk[modeColor](`${modeIcon} ${config.mode.toUpperCase()}`));

        // 通知配置
        const notificationType = config.notifications?.type || 'unknown';
        console.log(chalk.white('通知类型: ') + chalk.blue(notificationType));

        // 启用事件数量
        const enabledCount = config.enabledEvents.length;
        const totalEvents = 9; // 总事件数
        const eventsColor = enabledCount > 0 ? 'green' : 'red';
        console.log(chalk.white('启用事件: ') + chalk[eventsColor](`${enabledCount}/${totalEvents}`));

        console.log('');

        // 配置文件状态
        console.log(chalk.blue.bold('📁 配置文件状态'));
        
        const cchookConfigExists = await FileSystemUtils.fileExists(
          FileSystemUtils.getCchookConfigPath()
        );
        const claudeConfigExists = await FileSystemUtils.fileExists(
          FileSystemUtils.getClaudeSettingsPath()
        );

        console.log(chalk.white('cchook 配置: ') + 
          (cchookConfigExists ? chalk.green('✓ 存在') : chalk.red('✗ 不存在')));
        
        console.log(chalk.white('Claude Code 配置: ') + 
          (claudeConfigExists ? chalk.green('✓ 存在') : chalk.yellow('! 不存在')));

        if (options.verbose) {
          console.log('');
          console.log(chalk.gray(`  cchook: ${FileSystemUtils.getCchookConfigPath()}`));
          console.log(chalk.gray(`  Claude: ${FileSystemUtils.getClaudeSettingsPath()}`));
        }

        console.log('');

        // 详细信息
        if (options.verbose) {
          console.log(chalk.blue.bold('🔧 详细配置'));
          
          // 启用的事件列表
          if (config.enabledEvents.length > 0) {
            console.log(chalk.white('启用的事件:'));
            config.enabledEvents.forEach(event => {
              console.log(chalk.green('  ✓ ') + event);
            });
          } else {
            console.log(chalk.red('  没有启用任何事件'));
          }

          console.log('');

          // 通知配置详情
          console.log(chalk.white('通知配置:'));
          console.log(chalk.blue('  类型: ') + notificationType);
          
          if (config.notifications?.osascript) {
            const osConfig = config.notifications.osascript;
            console.log(chalk.blue('  标题: ') + (osConfig.title || '默认'));
            console.log(chalk.blue('  副标题: ') + (osConfig.subtitle || '默认'));
            console.log(chalk.blue('  声音: ') + (osConfig.sound || 'default'));
          }

          console.log('');

          // 系统信息
          console.log(chalk.blue.bold('💻 系统信息'));
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
          Logger.warning('⚠️  当前处于静音模式，所有通知被禁用');
        } else if (enabledCount === 0) {
          Logger.warning('⚠️  没有启用任何事件，不会接收到通知');
        } else if (!claudeConfigExists) {
          Logger.warning('⚠️  Claude Code 配置不存在，请运行 `cchook setup` 进行初始化');
        } else {
          Logger.success('✅ 系统运行正常，可以接收通知');
        }

        // 建议操作
        console.log('');
        if (!claudeConfigExists) {
          console.log(chalk.cyan('💡 建议操作: ') + '运行 `cchook setup` 初始化配置');
        } else if (enabledCount === 0) {
          console.log(chalk.cyan('💡 建议操作: ') + '运行 `cchook events add Notification` 启用基本通知');
        } else if (config.mode === 'silent') {
          console.log(chalk.cyan('💡 建议操作: ') + '运行 `cchook mode normal` 启用通知');
        } else {
          console.log(chalk.cyan('💡 建议操作: ') + '运行 `cchook test` 测试通知功能');
        }

      } catch (error) {
        Logger.error('获取状态信息失败:', error.message);
        process.exit(1);
      }
    });
}