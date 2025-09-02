import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import { Logger } from '../../utils/logger.js';
import i18n from '../../utils/i18n.js';
import chalk from 'chalk';

export function logsCommand(program) {
  program
    .command('logs')
    .description(i18n.t('logs.description'))
    .option('-f, --follow', i18n.t('logs.follow'))
    .option('-n, --lines <number>', i18n.t('logs.number'), '50')
    .option('-c, --clear', i18n.t('logs.clear'))
    .action(async (options) => {
      const logFile = path.join(os.homedir(), '.cchook', 'hooks.log');
      
      if (options.clear) {
        try {
          await fs.writeFile(logFile, '');
          Logger.success(i18n.t('logs.clear.success'));
          return;
        } catch (error) {
          Logger.error(i18n.t('logs.clear.failed', error.message));
          return;
        }
      }
      
      try {
        // 检查日志文件是否存在
        try {
          await fs.access(logFile);
        } catch (error) {
          Logger.warning(i18n.t('logs.no.file'));
          Logger.info(i18n.t('logs.file.location', logFile));
          return;
        }
        
        if (options.follow) {
          Logger.info(i18n.t('logs.follow.info'));
          Logger.info(`Log file: ${logFile}`);
          console.log('');
          
          // 显示现有内容
          await showLogContent(logFile, parseInt(options.lines));
          
          // 使用轮询方式监控文件变化
          let lastPosition = 0;
          try {
            const stats = await fs.stat(logFile);
            lastPosition = stats.size;
          } catch (error) {
            // 文件可能不存在
          }
          
          const checkForUpdates = async () => {
            try {
              const stats = await fs.stat(logFile);
              if (stats.size > lastPosition) {
                // 读取新增的内容
                const buffer = Buffer.alloc(stats.size - lastPosition);
                const fd = await fs.open(logFile, 'r');
                await fd.read(buffer, 0, stats.size - lastPosition, lastPosition);
                await fd.close();
                
                const newContent = buffer.toString('utf8');
                const newLines = newContent.split('\n').filter(line => line.trim());
                
                newLines.forEach(line => {
                  if (line.trim()) {
                    formatLogLine(line);
                  }
                });
                
                lastPosition = stats.size;
              }
            } catch (error) {
              // 忽略错误，继续轮询
            }
          };
          
          // 每秒检查一次
          const interval = setInterval(checkForUpdates, 1000);
          
          // 处理退出
          process.on('SIGINT', () => {
            clearInterval(interval);
            Logger.info('\nLog following stopped');
            process.exit(0);
          });
          
          // 保持进程运行
          process.stdin.resume();
          
        } else {
          await showLogContent(logFile, parseInt(options.lines));
        }
        
      } catch (error) {
        Logger.error(i18n.t('logs.read.failed', error.message));
      }
    });
}

async function showLogContent(logFile, lines) {
  try {
    const content = await fs.readFile(logFile, 'utf8');
    const allLines = content.split('\n').filter(line => line.trim());
    
    if (allLines.length === 0) {
      Logger.info(i18n.t('logs.empty'));
      return;
    }
    
    const displayLines = allLines.slice(-lines);
    
    Logger.info(i18n.t('logs.showing.last', displayLines.length));
    console.log('');
    
    displayLines.forEach(line => formatLogLine(line));
    
  } catch (error) {
    Logger.error('Failed to read log content:', error.message);
  }
}

function formatLogLine(line) {
  if (!line.trim()) return;
  
  try {
    // 尝试解析 JSON 格式的日志
    if (line.startsWith('{')) {
      const logEntry = JSON.parse(line);
      const timestamp = new Date(logEntry.timestamp).toLocaleString();
      
      console.log(chalk.gray(`[${timestamp}]`), 
        chalk.blue(`[${logEntry.eventName}]`),
        logEntry.result.success 
          ? chalk.green('[SUCCESS]') 
          : (logEntry.result.skipped ? chalk.yellow('[SKIPPED]') : chalk.red('[FAILED]'))
      );
      
      if (logEntry.result.error) {
        console.log(chalk.red('  Error:'), logEntry.result.error);
      }
      
      if (logEntry.result.skipped) {
        console.log(chalk.yellow('  Skipped: Event not enabled or in silent mode'));
      }
      
    } else {
      // 普通文本日志
      console.log(line);
    }
  } catch (error) {
    // 如果不是 JSON 格式，直接输出
    console.log(line);
  }
}