import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseNotifier } from './base.js';
import { Logger } from '../utils/logger.js';

const execAsync = promisify(exec);

export class OSAScriptNotifier extends BaseNotifier {
  constructor(config = {}) {
    super(config);
    
    // 默认配置
    this.defaultTitle = config.title || 'Claude Code';
    this.defaultSubtitle = config.subtitle || '通知';
    this.defaultSound = config.sound || 'default';
  }

  async notify(options = {}) {
    this.validateOptions(options);

    const {
      title = this.defaultTitle,
      message,
      subtitle = this.defaultSubtitle,
      sound = this.defaultSound
    } = options;

    try {
      const command = this.buildOSAScriptCommand({
        title: this.sanitizeText(title),
        message: this.sanitizeText(message || ''),
        subtitle: this.sanitizeText(subtitle),
        sound: this.sanitizeText(sound)
      });

      Logger.debug('执行 osascript 命令:', command);

      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        Logger.warning('osascript 警告:', stderr);
      }
      
      Logger.debug('通知发送成功');
      return { success: true, output: stdout };
      
    } catch (error) {
      Logger.error('发送通知失败:', error);
      return { success: false, error: error.message };
    }
  }

  buildOSAScriptCommand(options) {
    const { title, message, subtitle, sound } = options;
    
    let command = `osascript -e 'display notification "${message}"`;
    
    if (title) {
      command += ` with title "${title}"`;
    }
    
    if (subtitle) {
      command += ` subtitle "${subtitle}"`;
    }
    
    if (sound && sound !== 'none') {
      command += ` sound name "${sound}"`;
    }
    
    command += `'`;
    
    return command;
  }

  async testNotification() {
    return this.notify({
      title: 'cchook 测试',
      message: '这是一个测试通知',
      subtitle: '如果您看到这个消息，说明通知功能正常工作'
    });
  }

  // 获取可用的声音列表
  async getAvailableSounds() {
    try {
      const command = `osascript -e 'tell application "System Events" to get name of every sound'`;
      const { stdout } = await execAsync(command);
      
      // 解析返回的声音列表
      const sounds = stdout
        .split(',')
        .map(sound => sound.trim().replace(/^"|"$/g, ''))
        .filter(sound => sound.length > 0);
        
      return sounds;
    } catch (error) {
      Logger.warning('无法获取系统声音列表:', error);
      return ['default', 'Basso', 'Blow', 'Bottle', 'Frog', 'Funk', 'Glass', 'Hero', 'Morse', 'Ping', 'Pop', 'Purr', 'Sosumi', 'Submarine', 'Tink'];
    }
  }
}