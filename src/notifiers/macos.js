import { OSAScriptNotifier } from '../notifications/osascript.js';
import i18n from '../utils/i18n.js';

/**
 * macOS 系统通知器
 */
export class MacOSNotifier {
  constructor(options = {}) {
    this.defaultOptions = {
      title: i18n.isChinese() ? '钉钉机器人通知' : 'DingTalk Robot Notification',
      sound: 'default',
      ...options
    };
    
    this.osascriptNotifier = new OSAScriptNotifier(this.defaultOptions);
  }

  /**
   * 发送 macOS 系统通知
   * @param {string} message 消息内容
   * @param {Object} options 选项
   * @param {string} options.title 通知标题
   * @param {string} options.subtitle 通知副标题
   * @param {boolean|string} options.sound 是否播放声音或指定声音名称
   * @returns {Promise<Object>} 通知结果
   */
  async send(message, options = {}) {
    const notifyOptions = {
      ...this.defaultOptions,
      ...options,
      message: message
    };

    // 处理声音选项：boolean -> string
    if (typeof notifyOptions.sound === 'boolean') {
      notifyOptions.sound = notifyOptions.sound ? 'default' : 'none';
    }

    try {
      const result = await this.osascriptNotifier.notify(notifyOptions);
      console.log(i18n.t('notify.macos.sent'));
      return result;
    } catch (error) {
      console.error((i18n.isChinese() ? 'macOS 通知发送失败:' : 'macOS notification failed:'), error.message);
      throw error;
    }
  }
}