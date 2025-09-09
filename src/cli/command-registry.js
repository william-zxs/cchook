import { setupCommand } from './commands/setup.js';
import { modeCommand } from './commands/mode.js';
import { eventsCommand } from './commands/events.js';
import { statusCommand } from './commands/status.js';
import { logsCommand } from './commands/logs.js';
import { configCommand } from './commands/config.js';
import { switchCommand } from './commands/switch.js';
import { Logger } from '../utils/logger.js';
import i18n from '../utils/i18n.js';

/**
 * 命令注册管理器
 * 统一管理所有 CLI 命令的注册和初始化
 */
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.initialized = false;
  }

  /**
   * 注册所有命令
   * @param {object} program Commander 实例
   */
  registerAllCommands(program) {
    if (this.initialized) {
      Logger.debug('命令已经初始化');
      return;
    }

    try {
      // 注册所有命令
      this.registerCommand('setup', setupCommand, program);
      this.registerCommand('mode', modeCommand, program);
      this.registerCommand('events', eventsCommand, program);
      this.registerCommand('status', statusCommand, program);
      this.registerCommand('logs', logsCommand, program);
      this.registerCommand('config', configCommand, program);
      this.registerCommand('switch', switchCommand, program);

      this.initialized = true;
      Logger.debug('所有命令注册完成');
    } catch (error) {
      Logger.error('命令注册失败:', error);
      throw error;
    }
  }

  /**
   * 注册单个命令
   * @param {string} name 命令名称
   * @param {Function} commandFactory 命令工厂函数
   * @param {object} program Commander 实例
   */
  registerCommand(name, commandFactory, program) {
    try {
      commandFactory(program);
      this.commands.set(name, commandFactory);
      Logger.debug(`命令注册成功: ${name}`);
    } catch (error) {
      Logger.error(`注册命令 ${name} 失败:`, error);
      throw new Error(`Failed to register command ${name}: ${error.message}`);
    }
  }

  /**
   * 获取已注册的命令列表
   * @returns {string[]} 命令名称列表
   */
  getRegisteredCommands() {
    return Array.from(this.commands.keys());
  }

  /**
   * 检查命令是否已注册
   * @param {string} name 命令名称
   * @returns {boolean} 是否已注册
   */
  hasCommand(name) {
    return this.commands.has(name);
  }

  /**
   * 获取命令帮助信息
   * @returns {string} 帮助信息
   */
  getHelpInfo() {
    const commands = this.getRegisteredCommands();
    return i18n.t('registry.help.info', commands.join(', '));
  }
}

// 全局命令注册器实例
export const commandRegistry = new CommandRegistry();