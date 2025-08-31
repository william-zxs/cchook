import { ConfigManager } from '../../config/manager.js';
import { ConfigValidator } from '../../config/validator.js';
import { Logger } from '../../utils/logger.js';
import i18n from '../../utils/i18n.js';

export function modeCommand(program) {
  program
    .command('mode [mode]')
    .description(i18n.t('mode.description'))
    .action(async (mode) => {
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        
        if (!mode) {
          // 显示当前模式
          const currentConfig = configManager.getConfig();
          const currentMode = currentConfig.mode;
          const modeStatus = currentMode === 'normal' ? '[ENABLED]' : '[DISABLED]';
          
          Logger.info(i18n.t('mode.current', modeStatus, currentMode.toUpperCase()));
          
          if (currentMode === 'normal') {
            Logger.info(i18n.t('mode.notification.enabled'));
            const enabledCount = currentConfig.enabledEvents.length;
            Logger.info(i18n.t('mode.events.count', enabledCount));
          } else {
            Logger.info(i18n.t('mode.notification.disabled'));
          }
          
          console.log('\n' + i18n.t('mode.available'));
          ConfigValidator.VALID_MODES.forEach(validMode => {
            const status = validMode === 'normal' ? '[ENABLED]' : '[DISABLED]';
            const current = validMode === currentMode ? i18n.t('mode.current.suffix') : '';
            console.log(`  ${status} ${validMode}${current}`);
          });
          
          return;
        }

        // 设置模式
        if (!ConfigValidator.VALID_MODES.includes(mode)) {
          Logger.error(i18n.t('mode.invalid', mode));
          Logger.info(i18n.t('mode.valid.modes', ConfigValidator.VALID_MODES.join(', ')));
          process.exit(1);
        }

        const oldMode = configManager.getConfig().mode;
        
        if (oldMode === mode) {
          Logger.info(i18n.t('mode.already.set', mode));
          return;
        }

        await configManager.setMode(mode);
        
        const modeStatus = mode === 'normal' ? '[ENABLED]' : '[DISABLED]';
        Logger.success(i18n.t('mode.switched', modeStatus, mode.toUpperCase()));
        
        if (mode === 'normal') {
          Logger.info(i18n.t('mode.notification.enabled'));
          Logger.info(i18n.t('mode.notification.will.receive'));
        } else {
          Logger.info(i18n.t('mode.notification.disabled'));
          Logger.info(i18n.t('mode.notification.all.ignored'));
        }

      } catch (error) {
        Logger.error(i18n.t('mode.operation.failed', error.message));
        process.exit(1);
      }
    });
}