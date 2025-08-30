import { ConfigManager } from '../../config/manager.js';
import { HookInstaller } from '../../hook/installer.js';
import { Logger } from '../../utils/logger.js';
import i18n from '../../utils/i18n.js';

export function setupCommand(program) {
  program
    .command('setup')
    .description(i18n.t('setup.description'))
    .option('-f, --force', i18n.t('setup.force'))
    .action(async (options) => {
      Logger.info(i18n.t('setup.start'));
      
      try {
        // 1. 初始化配置
        Logger.info(i18n.t('setup.init.config'));
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        Logger.success(i18n.t('setup.init.complete'));

        // 2. 安装 hooks 到 Claude Code
        Logger.info(i18n.t('setup.install.hooks'));
        const installer = new HookInstaller();
        const result = await installer.install(options.force);
        
        if (result.success) {
          Logger.success(i18n.t('setup.install.complete'));
          if (result.backupPath) {
            Logger.info(i18n.t('setup.backup.info', result.backupPath));
          }
        } else {
          Logger.error(i18n.t('setup.install.failed'), result.error);
          process.exit(1);
        }

        // 3. 验证安装
        Logger.info(i18n.t('setup.verify'));
        const verification = await installer.verify();
        
        if (verification.success) {
          Logger.success(i18n.t('setup.verify.success'));
          Logger.info(i18n.t('setup.ready'));
          
          // 显示下一步操作提示
          console.log('\n' + i18n.t('setup.next.steps'));
          console.log(i18n.t('setup.next.tui'));
          console.log(i18n.t('setup.next.test'));
          console.log(i18n.t('setup.next.silent'));
          
        } else {
          Logger.warning(i18n.t('setup.verify.failed'), verification.error);
          Logger.info(i18n.t('setup.check.config'));
        }

      } catch (error) {
        Logger.error(i18n.t('setup.error'), error.message);
        process.exit(1);
      }
    });
}