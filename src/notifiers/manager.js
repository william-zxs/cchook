import { DingTalkNotifier } from './dingtalk.js';
import { MacOSNotifier } from './macos.js';

/**
 * 通知管理器，支持多种通知类型
 */
export class NotificationManager {
  constructor() {
    this.notifiers = new Map();
    this.enabledTypes = [];
  }

  /**
   * 注册钉钉通知器
   * @param {string} accessToken 访问令牌
   * @param {string} secret 密钥
   */
  registerDingTalk(accessToken, secret) {
    const notifier = new DingTalkNotifier(accessToken, secret);
    this.notifiers.set('dingtalk', notifier);
    return this;
  }

  /**
   * 注册 macOS 通知器
   * @param {Object} options 配置选项
   */
  registerMacOS(options = {}) {
    const notifier = new MacOSNotifier(options);
    this.notifiers.set('macos', notifier);
    return this;
  }

  /**
   * 设置启用的通知类型
   * @param {string[]} types 通知类型数组
   */
  setEnabledTypes(types) {
    const validTypes = types.filter(type => this.notifiers.has(type));
    const invalidTypes = types.filter(type => !this.notifiers.has(type));
    
    if (invalidTypes.length > 0) {
      console.warn('未知的通知类型:', invalidTypes);
    }
    
    this.enabledTypes = validTypes;
    return this;
  }

  /**
   * 获取可用的通知类型
   * @returns {string[]} 可用通知类型列表
   */
  getAvailableTypes() {
    return Array.from(this.notifiers.keys());
  }

  /**
   * 发送通知到所有启用的通知器
   * @param {string} message 消息内容
   * @param {Object} options 选项
   * @returns {Promise<Object[]>} 所有通知结果
   */
  async sendToAll(message, options = {}) {
    if (this.enabledTypes.length === 0) {
      throw new Error('没有启用任何通知类型');
    }

    const promises = this.enabledTypes.map(async (type) => {
      try {
        const notifier = this.notifiers.get(type);
        const result = await notifier.send(message, options);
        return { type, success: true, result };
      } catch (error) {
        console.error(`${type} 通知发送失败:`, error.message);
        return { type, success: false, error: error.message };
      }
    });

    return Promise.all(promises);
  }

  /**
   * 发送通知到指定类型的通知器
   * @param {string} type 通知类型
   * @param {string} message 消息内容
   * @param {Object} options 选项
   * @returns {Promise<Object>} 通知结果
   */
  async sendTo(type, message, options = {}) {
    const notifier = this.notifiers.get(type);
    if (!notifier) {
      throw new Error(`未注册的通知类型: ${type}`);
    }

    return notifier.send(message, options);
  }
}