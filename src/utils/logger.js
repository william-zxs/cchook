import chalk from 'chalk';
import figures from 'figures';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class Logger {
  static get logFile() {
    return path.join(os.homedir(), '.cchook', 'hooks.log');
  }

  static async ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      // 忽略目录已存在的错误
    }
  }

  static async writeLog(level, message, ...args) {
    try {
      await this.ensureLogDir();
      const timestamp = new Date().toISOString();
      const logLine = `[${timestamp}] [${level}] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}\n`;
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      // 静默失败，避免日志记录影响主要功能
    }
  }
  static info(message, ...args) {
    console.log(chalk.blue(figures.info), message, ...args);
    this.writeLog('INFO', message, ...args);
  }

  static success(message, ...args) {
    console.log(chalk.green(figures.tick), message, ...args);
    this.writeLog('SUCCESS', message, ...args);
  }

  static warning(message, ...args) {
    console.log(chalk.yellow(figures.warning), message, ...args);
    this.writeLog('WARNING', message, ...args);
  }

  static error(message, ...args) {
    console.log(chalk.red(figures.cross), message, ...args);
    this.writeLog('ERROR', message, ...args);
  }

  static debug(message, ...args) {
    if (process.env.DEBUG) {
      console.log(chalk.gray(figures.bullet), chalk.gray(message), ...args);
    }
    this.writeLog('DEBUG', message, ...args);
  }

  static plain(message, ...args) {
    console.log(message, ...args);
    this.writeLog('PLAIN', message, ...args);
  }

  // Hook 专用日志方法
  static async hookLog(eventName, hookData, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventName,
      hookData: {
        ...hookData,
        // 避免记录敏感信息
        tool_input: hookData.tool_input ? '[REDACTED]' : undefined,
        tool_response: hookData.tool_response ? '[REDACTED]' : undefined
      },
      result
    };
    
    try {
      await this.ensureLogDir();
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      // 静默失败
    }
  }
}