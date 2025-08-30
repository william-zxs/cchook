export class BaseNotifier {
  constructor(config = {}) {
    this.config = config;
  }

  async notify(options = {}) {
    throw new Error('notify 方法必须在子类中实现');
  }

  validateOptions(options) {
    if (!options.message && !options.title) {
      throw new Error('通知必须包含消息或标题');
    }
    return true;
  }

  formatMessage(options) {
    const { title, message, subtitle } = options;
    
    let formatted = '';
    if (title) {
      formatted += title;
      if (message) {
        formatted += `: ${message}`;
      }
    } else if (message) {
      formatted = message;
    }
    
    if (subtitle) {
      formatted += ` (${subtitle})`;
    }
    
    return formatted;
  }

  sanitizeText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // 转义特殊字符，防止命令注入
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .replace(/\t/g, ' ')
      .trim();
  }
}