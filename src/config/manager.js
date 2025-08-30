import { FileSystemUtils } from '../utils/fs.js';
import { ConfigValidator } from './validator.js';
import { Logger } from '../utils/logger.js';

export class ConfigManager {
  constructor() {
    this.config = null;
    this.configPath = FileSystemUtils.getCchookConfigPath();
  }

  async loadConfig() {
    try {
      const configData = await FileSystemUtils.readJsonFile(this.configPath);
      
      if (!configData) {
        Logger.info('配置文件不存在，使用默认配置');
        this.config = ConfigValidator.getDefaultConfig();
        await this.saveConfig();
        return this.config;
      }

      const validation = ConfigValidator.validateConfig(configData);
      if (!validation.valid) {
        Logger.warning('配置文件验证失败，使用默认配置');
        validation.errors.forEach(error => Logger.error(error));
        
        // 备份无效配置
        await FileSystemUtils.backupFile(this.configPath);
        
        this.config = ConfigValidator.getDefaultConfig();
        await this.saveConfig();
        return this.config;
      }

      this.config = ConfigValidator.sanitizeConfig(configData);
      Logger.debug('配置加载成功');
      return this.config;
    } catch (error) {
      Logger.error('加载配置失败:', error);
      this.config = ConfigValidator.getDefaultConfig();
      return this.config;
    }
  }

  async saveConfig() {
    if (!this.config) {
      throw new Error('没有配置可保存');
    }

    this.config.updatedAt = new Date().toISOString();
    
    const success = await FileSystemUtils.writeJsonFile(this.configPath, this.config);
    if (success) {
      Logger.debug('配置保存成功');
    } else {
      throw new Error('配置保存失败');
    }
  }

  getConfig() {
    if (!this.config) {
      throw new Error('配置未加载，请先调用 loadConfig()');
    }
    return this.config;
  }

  async setMode(mode) {
    if (!ConfigValidator.VALID_MODES.includes(mode)) {
      throw new Error(`无效的模式: ${mode}`);
    }
    
    if (!this.config) {
      await this.loadConfig();
    }
    
    this.config.mode = mode;
    await this.saveConfig();
    Logger.success(`模式已切换为: ${mode}`);
  }

  async addEvent(eventName) {
    if (!ConfigValidator.VALID_EVENTS.includes(eventName)) {
      throw new Error(`无效的事件类型: ${eventName}`);
    }
    
    if (!this.config) {
      await this.loadConfig();
    }
    
    if (!this.config.enabledEvents.includes(eventName)) {
      this.config.enabledEvents.push(eventName);
      await this.saveConfig();
      Logger.success(`已启用事件: ${eventName}`);
    } else {
      Logger.info(`事件 ${eventName} 已经启用`);
    }
  }

  async removeEvent(eventName) {
    if (!this.config) {
      await this.loadConfig();
    }
    
    const index = this.config.enabledEvents.indexOf(eventName);
    if (index > -1) {
      this.config.enabledEvents.splice(index, 1);
      await this.saveConfig();
      Logger.success(`已禁用事件: ${eventName}`);
    } else {
      Logger.info(`事件 ${eventName} 未启用`);
    }
  }

  async setNotificationType(type) {
    if (!ConfigValidator.VALID_NOTIFICATION_TYPES.includes(type)) {
      throw new Error(`无效的通知类型: ${type}`);
    }
    
    if (!this.config) {
      await this.loadConfig();
    }
    
    this.config.notifications.type = type;
    await this.saveConfig();
    Logger.success(`通知类型已设置为: ${type}`);
  }

  async setProjectConfig(projectPath, config) {
    if (!this.config) {
      await this.loadConfig();
    }
    
    if (!this.config.projectConfigs) {
      this.config.projectConfigs = {};
    }
    
    this.config.projectConfigs[projectPath] = config;
    await this.saveConfig();
    Logger.success(`项目配置已更新: ${projectPath}`);
  }

  async getProjectConfig(projectPath) {
    if (!this.config) {
      await this.loadConfig();
    }
    
    return this.config.projectConfigs?.[projectPath] || {};
  }

  isEventEnabled(eventName) {
    if (!this.config) {
      return false;
    }
    
    if (this.config.mode === 'silent') {
      return false;
    }
    
    return this.config.enabledEvents.includes(eventName);
  }

  getNotificationConfig() {
    if (!this.config) {
      return ConfigValidator.getDefaultConfig().notifications;
    }
    
    return this.config.notifications;
  }
}