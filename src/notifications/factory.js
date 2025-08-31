import { OSAScriptNotifier } from './osascript.js';
import { DingTalkNotifier } from './dingtalk.js';
import { Logger } from '../utils/logger.js';

export class NotificationFactory {
  static SUPPORTED_TYPES = {
    osascript: OSAScriptNotifier,
    dingtalk: DingTalkNotifier,
    macos: OSAScriptNotifier  // macos 作为 osascript 的别名
  };

  static create(type, config = {}) {
    const NotifierClass = this.SUPPORTED_TYPES[type];
    
    if (!NotifierClass) {
      throw new Error(`不支持的通知类型: ${type}。支持的类型: ${this.getSupportedTypes().join(', ')}`);
    }

    try {
      return new NotifierClass(config[type] || config);
    } catch (error) {
      Logger.error(`创建 ${type} 通知器失败:`, error);
      throw error;
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

    // 没有可用的通知方式
    throw new Error('没有可用的通知方式。请确保在 macOS 系统上运行或配置其他通知方式。');
  }
}