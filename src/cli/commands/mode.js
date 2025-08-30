import { ConfigManager } from '../../config/manager.js';
import { ConfigValidator } from '../../config/validator.js';
import { Logger } from '../../utils/logger.js';

export function modeCommand(program) {
  program
    .command('mode [mode]')
    .description('查看或设置工作模式 (normal|silent)')
    .action(async (mode) => {
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        
        if (!mode) {
          // 显示当前模式
          const currentConfig = configManager.getConfig();
          const currentMode = currentConfig.mode;
          const modeIcon = currentMode === 'normal' ? '🔔' : '🔕';
          
          Logger.info(`当前工作模式: ${modeIcon} ${currentMode.toUpperCase()}`);
          
          if (currentMode === 'normal') {
            Logger.info('通知功能已启用');
            const enabledCount = currentConfig.enabledEvents.length;
            Logger.info(`已启用 ${enabledCount} 个事件通知`);
          } else {
            Logger.info('通知功能已禁用（静音模式）');
          }
          
          console.log('\n可用模式:');
          ConfigValidator.VALID_MODES.forEach(validMode => {
            const icon = validMode === 'normal' ? '🔔' : '🔕';
            const current = validMode === currentMode ? ' (当前)' : '';
            console.log(`  ${icon} ${validMode}${current}`);
          });
          
          return;
        }

        // 设置模式
        if (!ConfigValidator.VALID_MODES.includes(mode)) {
          Logger.error(`无效的模式: ${mode}`);
          Logger.info(`有效模式: ${ConfigValidator.VALID_MODES.join(', ')}`);
          process.exit(1);
        }

        const oldMode = configManager.getConfig().mode;
        
        if (oldMode === mode) {
          Logger.info(`模式已经是 ${mode}`);
          return;
        }

        await configManager.setMode(mode);
        
        const modeIcon = mode === 'normal' ? '🔔' : '🔕';
        Logger.success(`${modeIcon} 模式已切换为: ${mode.toUpperCase()}`);
        
        if (mode === 'normal') {
          Logger.info('通知功能已启用');
          Logger.info('现在会接收 Claude Code 的通知');
        } else {
          Logger.info('通知功能已禁用');
          Logger.info('所有通知将被忽略');
        }

      } catch (error) {
        Logger.error('模式操作失败:', error.message);
        process.exit(1);
      }
    });
}