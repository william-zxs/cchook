import { BaseNotifier } from './base.js';
import { Logger } from '../utils/logger.js';
import chalk from 'chalk';
import figures from 'figures';

export class ConsoleNotifier extends BaseNotifier {
  constructor(config = {}) {
    super(config);
    this.showTimestamp = config.showTimestamp !== false;
  }

  async notify(options = {}) {
    this.validateOptions(options);

    const {
      title,
      message,
      subtitle,
      level = 'info' // info, success, warning, error
    } = options;

    try {
      this.displayNotification({ title, message, subtitle, level });
      return { success: true };
    } catch (error) {
      Logger.error('控制台通知失败:', error);
      return { success: false, error: error.message };
    }
  }

  displayNotification(options) {
    const { title, message, subtitle, level } = options;
    
    // 选择颜色和图标
    let color, icon;
    switch (level) {
      case 'success':
        color = chalk.green;
        icon = figures.tick;
        break;
      case 'warning':
        color = chalk.yellow;
        icon = figures.warning;
        break;
      case 'error':
        color = chalk.red;
        icon = figures.cross;
        break;
      default:
        color = chalk.blue;
        icon = figures.info;
    }

    // 构建通知内容
    let output = '';
    
    if (this.showTimestamp) {
      const timestamp = new Date().toLocaleTimeString();
      output += chalk.gray(`[${timestamp}] `);
    }
    
    output += color(icon + ' ');
    
    if (title) {
      output += color.bold(title);
      if (message) {
        output += color(': ' + message);
      }
    } else if (message) {
      output += color(message);
    }
    
    if (subtitle) {
      output += color.dim(' (' + subtitle + ')');
    }

    console.log(output);
    
    // 如果是重要通知，添加分隔线
    if (level === 'error' || level === 'warning') {
      console.log(chalk.gray('─'.repeat(50)));
    }
  }

  async testNotification() {
    return this.notify({
      title: 'cchook 测试',
      message: '这是一个测试通知',
      subtitle: '控制台通知功能正常工作',
      level: 'success'
    });
  }
}