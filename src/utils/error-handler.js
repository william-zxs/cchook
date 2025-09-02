import { Logger } from './logger.js';
import i18n from './i18n.js';

/**
 * 统一的错误处理工具
 * 提供标准化的错误处理和用户友好的错误信息
 */
export class ErrorHandler {
  /**
   * 处理 CLI 命令错误
   * @param {Error} error 错误对象
   * @param {string} commandName 命令名称
   * @param {boolean} exitProcess 是否退出进程
   */
  static handleCommandError(error, commandName, exitProcess = true) {
    const errorMessage = this.getFriendlyErrorMessage(error, commandName);
    
    Logger.error(errorMessage);
    
    // 如果是调试模式，显示完整错误堆栈
    if (process.env.DEBUG) {
      console.error('\n' + error.stack);
    }
    
    if (exitProcess) {
      process.exit(1);
    }
  }

  /**
   * 获取用户友好的错误信息
   * @param {Error} error 错误对象
   * @param {string} commandName 命令名称
   * @returns {string} 友好的错误信息
   */
  static getFriendlyErrorMessage(error, commandName) {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'CONFIG_LOAD_FAILED':
        return i18n.t('error.config.load.failed', commandName);
        
      case 'CONFIG_VALIDATION_FAILED':
        return i18n.t('error.config.validation.failed', commandName, error.message);
        
      case 'NOTIFICATION_FAILED':
        return i18n.t('error.notification.failed', commandName, error.message);
        
      case 'NETWORK_ERROR':
        return i18n.t('error.network', commandName);
        
      case 'PERMISSION_ERROR':
        return i18n.t('error.permission', commandName);
        
      case 'FILE_SYSTEM_ERROR':
        return i18n.t('error.file.system', commandName, error.message);
        
      default:
        return i18n.t('error.generic', commandName, error.message);
    }
  }

  /**
   * 根据错误对象判断错误类型
   * @param {Error} error 错误对象
   * @returns {string} 错误类型
   */
  static getErrorType(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('config') || message.includes('configuration')) {
      return 'CONFIG_LOAD_FAILED';
    }
    
    if (message.includes('validation') || message.includes('valid')) {
      return 'CONFIG_VALIDATION_FAILED';
    }
    
    if (message.includes('notification') || message.includes('notify')) {
      return 'NOTIFICATION_FAILED';
    }
    
    if (message.includes('network') || message.includes('http') || message.includes('request')) {
      return 'NETWORK_ERROR';
    }
    
    if (message.includes('permission') || message.includes('access') || message.includes('eacces')) {
      return 'PERMISSION_ERROR';
    }
    
    if (message.includes('file') || message.includes('directory') || message.includes('enoent')) {
      return 'FILE_SYSTEM_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * 包装异步函数，提供统一的错误处理
   * @param {Function} asyncFn 异步函数
   * @param {string} commandName 命令名称
   * @returns {Function} 包装后的函数
   */
  static wrapAsyncCommand(asyncFn, commandName) {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        this.handleCommandError(error, commandName);
      }
    };
  }

  /**
   * 检查是否为可恢复的错误
   * @param {Error} error 错误对象
   * @returns {boolean} 是否可恢复
   */
  static isRecoverableError(error) {
    const errorType = this.getErrorType(error);
    
    // 配置文件和权限错误通常不可恢复
    const nonRecoverableErrors = [
      'CONFIG_LOAD_FAILED',
      'PERMISSION_ERROR',
      'FILE_SYSTEM_ERROR'
    ];
    
    return !nonRecoverableErrors.includes(errorType);
  }

  /**
   * 提供错误恢复建议
   * @param {Error} error 错误对象
   * @returns {string} 恢复建议
   */
  static getRecoverySuggestion(error) {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'CONFIG_LOAD_FAILED':
        return i18n.t('error.suggestion.config.load');
        
      case 'CONFIG_VALIDATION_FAILED':
        return i18n.t('error.suggestion.config.validation');
        
      case 'NOTIFICATION_FAILED':
        return i18n.t('error.suggestion.notification');
        
      case 'NETWORK_ERROR':
        return i18n.t('error.suggestion.network');
        
      case 'PERMISSION_ERROR':
        return i18n.t('error.suggestion.permission');
        
      case 'FILE_SYSTEM_ERROR':
        return i18n.t('error.suggestion.file.system');
        
      default:
        return i18n.t('error.suggestion.generic');
    }
  }
}