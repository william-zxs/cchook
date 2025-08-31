import crypto from 'crypto';
import https from 'https';
import { URL } from 'url';
import { BaseNotifier } from './base.js';
import { Logger } from '../utils/logger.js';
import i18n from '../utils/i18n.js';

/**
 * 钉钉机器人通知器
 */
export class DingTalkNotifier extends BaseNotifier {
  constructor(config = {}) {
    super(config);
    this.accessToken = config.accessToken;
    this.secret = config.secret;
    
    if (!this.accessToken || !this.secret) {
      throw new Error(i18n.isChinese() ? '钉钉配置不完整，需要 accessToken 和 secret' : 'DingTalk configuration incomplete, accessToken and secret required');
    }
  }

  /**
   * 生成签名
   * @returns {Object} 包含时间戳和签名的对象
   */
  generateSign() {
    const timestamp = Date.now().toString();
    const stringToSign = `${timestamp}\n${this.secret}`;
    
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(stringToSign, 'utf8');
    const signature = encodeURIComponent(hmac.digest('base64'));
    
    return { timestamp, signature };
  }

  /**
   * 发送通知
   * @param {Object} options 通知选项
   * @param {string} options.title 标题
   * @param {string} options.message 消息内容
   * @param {string} options.subtitle 副标题
   * @returns {Promise<Object>} 通知结果
   */
  async notify(options = {}) {
    this.validateOptions(options);
    
    try {
      const message = this.formatMessage(options);
      const result = await this.send(message);
      
      if (result.errcode === 0) {
        return { success: true, result };
      } else {
        return { 
          success: false, 
          error: result.errmsg || (i18n.isChinese() ? '钉钉通知发送失败' : 'DingTalk notification failed') 
        };
      }
    } catch (error) {
      Logger.error(i18n.isChinese() ? '钉钉通知发送异常:' : 'DingTalk notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 测试通知
   */
  async testNotification() {
    return this.notify({
      title: i18n.isChinese() ? '钉钉通知测试' : 'DingTalk Notification Test',
      message: i18n.isChinese() ? '这是一条测试消息，确认钉钉通知功能正常工作' : 'This is a test message to confirm DingTalk notification is working'
    });
  }

  /**
   * 发送钉钉机器人消息
   * @param {string} message 消息内容
   * @param {Object} options 选项
   * @param {string[]} options.atUserIds @的用户ID列表
   * @param {string[]} options.atMobiles @的手机号列表
   * @param {boolean} options.isAtAll 是否@所有人
   * @returns {Promise<Object>} 钉钉API响应
   */
  async send(message, options = {}) {
    const { atUserIds = [], atMobiles = [], isAtAll = false } = options;
    const { timestamp, signature } = this.generateSign();
    
    const url = new URL('https://oapi.dingtalk.com/robot/send');
    url.searchParams.append('access_token', this.accessToken);
    url.searchParams.append('timestamp', timestamp);
    url.searchParams.append('sign', signature);

    const body = {
      msgtype: 'text',
      text: {
        content: message
      },
      at: {
        isAtAll: isAtAll,
        atUserIds: atUserIds,
        atMobiles: atMobiles
      }
    };

    const postData = JSON.stringify(body);
    
    const options_req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(url, options_req, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            Logger.debug(i18n.isChinese() ? '钉钉响应:' : 'DingTalk response:', response);
            resolve(response);
          } catch (error) {
            reject(new Error((i18n.isChinese() ? '解析钉钉响应失败: ' : 'Failed to parse DingTalk response: ') + error.message));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error((i18n.isChinese() ? '钉钉请求失败: ' : 'DingTalk request failed: ') + error.message));
      });
      
      req.write(postData);
      req.end();
    });
  }
}