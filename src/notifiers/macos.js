import notifier from 'node-notifier';
import i18n from '../utils/i18n.js';

/**
 * macOS 系统通知器
 */
export class MacOSNotifier {
  constructor(options = {}) {
    this.defaultOptions = {
      title: i18n.isChinese() ? '钉钉机器人通知' : 'DingTalk Robot Notification',
      sound: true,
      wait: false,
      ...options
    };
  }

  /**
   * 发送 macOS 系统通知
   * @param {string} message 消息内容
   * @param {Object} options 选项
   * @param {string} options.title 通知标题
   * @param {string} options.subtitle 通知副标题
   * @param {boolean} options.sound 是否播放声音
   * @param {boolean} options.wait 是否等待用户操作
   * @returns {Promise<Object>} 通知结果
   */
  async send(message, options = {}) {
    const notifyOptions = {
      ...this.defaultOptions,
      ...options,
      message: message
    };

    return new Promise((resolve, reject) => {
      notifier.notify(notifyOptions, (error, response, metadata) => {
        if (error) {
          console.error((i18n.isChinese() ? 'macOS 通知发送失败:' : 'macOS notification failed:'), error);
          reject(error);
        } else {
          console.log(i18n.t('notify.macos.sent'));
          resolve({ response, metadata });
        }
      });
    });
  }
}