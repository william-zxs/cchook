import { OSAScriptNotifier } from './osascript.js';
import { ConsoleNotifier } from './console.js';
import { Logger } from '../utils/logger.js';

export class NotificationFactory {
  static SUPPORTED_TYPES = {
    osascript: OSAScriptNotifier,
    console: ConsoleNotifier
  };

  static create(type, config = {}) {
    const NotifierClass = this.SUPPORTED_TYPES[type];
    
    if (!NotifierClass) {
      Logger.warning(`不支持的通知类型: ${type}，使用控制台通知`);
      return new ConsoleNotifier(config);
    }

    try {
      return new NotifierClass(config[type] || config);
    } catch (error) {
      Logger.error(`创建 ${type} 通知器失败:`, error);
      Logger.info('回退到控制台通知');
      return new ConsoleNotifier(config);
    }
  }

  static getSupportedTypes() {
    return Object.keys(this.SUPPORTED_TYPES);
  }

  static async testNotifier(type, config = {}) {
    const notifier = this.create(type, config);
    
    try {
      const result = await notifier.testNotification();
      if (result.success) {
        Logger.success(`${type} 通知器测试成功`);
      } else {
        Logger.error(`${type} 通知器测试失败:`, result.error);
      }
      return result;
    } catch (error) {
      Logger.error(`${type} 通知器测试异常:`, error);
      return { success: false, error: error.message };
    }
  }

  static async detectBestNotifier() {
    // 在 macOS 上优先使用 osascript
    if (process.platform === 'darwin') {
      try {
        const notifier = new OSAScriptNotifier();
        const result = await notifier.notify({
          title: '检测通知功能',
          message: '正在检测最佳通知方式...'
        });
        
        if (result.success) {
          Logger.debug('检测到 osascript 支持');
          return 'osascript';
        }
      } catch (error) {
        Logger.debug('osascript 不可用:', error.message);
      }
    }

    // 回退到控制台通知
    Logger.debug('使用控制台通知作为默认方式');
    return 'console';
  }
}