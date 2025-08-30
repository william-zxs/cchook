import { FileSystemUtils } from '../utils/fs.js';
import { Logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class HookInstaller {
  constructor() {
    this.claudeSettingsPath = FileSystemUtils.getClaudeSettingsPath();
    this.cchookBinaryPath = this.getCchookBinaryPath();
  }

  getCchookBinaryPath() {
    // 获取 cchook 可执行文件的绝对路径
    return path.resolve(__dirname, '../../bin/cchook.js');
  }

  async install(force = false) {
    try {
      Logger.debug('开始安装 Claude Code hooks');

      // 1. 检查现有配置
      const existingConfig = await this.getExistingClaudeConfig();
      
      if (existingConfig && !force) {
        const hasHooks = existingConfig.hooks && Object.keys(existingConfig.hooks).length > 0;
        if (hasHooks) {
          Logger.warning('Claude Code 配置中已存在 hooks');
          Logger.info('使用 --force 参数强制覆盖，或手动合并配置');
          return { success: false, error: '配置已存在' };
        }
      }

      // 2. 备份现有配置
      let backupPath = null;
      if (existingConfig) {
        backupPath = await FileSystemUtils.backupFile(this.claudeSettingsPath);
        if (backupPath) {
          Logger.debug(`配置已备份到: ${backupPath}`);
        }
      }

      // 3. 生成新的 hooks 配置
      const hooksConfig = this.generateHooksConfig();

      // 4. 合并配置
      const newConfig = {
        ...existingConfig,
        hooks: {
          ...existingConfig?.hooks,
          ...hooksConfig
        }
      };

      // 5. 写入配置
      const success = await FileSystemUtils.writeJsonFile(this.claudeSettingsPath, newConfig);
      
      if (success) {
        Logger.debug('Claude Code hooks 配置写入成功');
        return { success: true, backupPath };
      } else {
        return { success: false, error: '配置写入失败' };
      }

    } catch (error) {
      Logger.error('安装 hooks 时发生错误:', error);
      return { success: false, error: error.message };
    }
  }

  async getExistingClaudeConfig() {
    const configExists = await FileSystemUtils.fileExists(this.claudeSettingsPath);
    
    if (!configExists) {
      // 确保 .claude 目录存在
      await FileSystemUtils.ensureDir(FileSystemUtils.getClaudeConfigDir());
      return {};
    }

    return await FileSystemUtils.readJsonFile(this.claudeSettingsPath) || {};
  }

  generateHooksConfig() {
    const cchookCommand = `node "${this.cchookBinaryPath}"`;
    
    return {
      // 通知事件
      "Notification": [
        {
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ],

      // 任务完成通知
      "Stop": [
        {
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ],

      // 子任务完成通知  
      "SubagentStop": [
        {
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ],

      // 用户输入提示
      "UserPromptSubmit": [
        {
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ],

      // 工具使用前
      "PreToolUse": [
        {
          "matcher": "Bash|Write|Edit|MultiEdit",
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ],

      // 工具使用后
      "PostToolUse": [
        {
          "matcher": "Bash|Write|Edit|MultiEdit",
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ],

      // 压缩前
      "PreCompact": [
        {
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ],

      // 会话开始
      "SessionStart": [
        {
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ],

      // 会话结束
      "SessionEnd": [
        {
          "hooks": [
            {
              "type": "command",
              "command": cchookCommand,
              "timeout": 10
            }
          ]
        }
      ]
    };
  }

  async verify() {
    try {
      // 1. 检查配置文件是否存在
      const configExists = await FileSystemUtils.fileExists(this.claudeSettingsPath);
      if (!configExists) {
        return { success: false, error: 'Claude Code 配置文件不存在' };
      }

      // 2. 读取配置
      const config = await FileSystemUtils.readJsonFile(this.claudeSettingsPath);
      if (!config) {
        return { success: false, error: '无法读取 Claude Code 配置' };
      }

      // 3. 检查 hooks 配置
      if (!config.hooks) {
        return { success: false, error: '配置中没有 hooks 部分' };
      }

      // 4. 验证关键事件是否配置
      const requiredEvents = ['Notification', 'Stop'];
      const missingEvents = [];

      for (const event of requiredEvents) {
        if (!config.hooks[event]) {
          missingEvents.push(event);
        }
      }

      if (missingEvents.length > 0) {
        return { 
          success: false, 
          error: `缺少必要的 hook 事件: ${missingEvents.join(', ')}` 
        };
      }

      // 5. 检查 cchook 命令是否正确
      const notificationHook = config.hooks.Notification[0];
      if (!notificationHook?.hooks?.[0]?.command?.includes('cchook')) {
        return { success: false, error: 'hook 命令配置不正确' };
      }

      // 6. 检查 cchook 可执行文件
      const cchookExists = await FileSystemUtils.fileExists(this.cchookBinaryPath);
      if (!cchookExists) {
        return { success: false, error: 'cchook 可执行文件不存在' };
      }

      return { success: true };

    } catch (error) {
      Logger.error('验证安装时发生错误:', error);
      return { success: false, error: error.message };
    }
  }

  async uninstall() {
    try {
      Logger.debug('开始卸载 Claude Code hooks');

      const config = await this.getExistingClaudeConfig();
      
      if (!config || !config.hooks) {
        Logger.info('没有找到 cchook 相关配置');
        return { success: true };
      }

      // 备份配置
      const backupPath = await FileSystemUtils.backupFile(this.claudeSettingsPath);

      // 移除 cchook 相关的 hooks
      const newHooks = {};
      
      for (const [eventName, eventHooks] of Object.entries(config.hooks)) {
        const filteredHooks = eventHooks.filter(hookGroup => {
          return !hookGroup.hooks?.some(hook => 
            hook.command?.includes('cchook')
          );
        });
        
        if (filteredHooks.length > 0) {
          newHooks[eventName] = filteredHooks;
        }
      }

      // 更新配置
      const newConfig = {
        ...config,
        hooks: Object.keys(newHooks).length > 0 ? newHooks : undefined
      };

      // 如果没有其他 hooks，移除 hooks 字段
      if (!newConfig.hooks) {
        delete newConfig.hooks;
      }

      const success = await FileSystemUtils.writeJsonFile(this.claudeSettingsPath, newConfig);
      
      if (success) {
        Logger.success('Claude Code hooks 卸载成功');
        return { success: true, backupPath };
      } else {
        return { success: false, error: '配置写入失败' };
      }

    } catch (error) {
      Logger.error('卸载 hooks 时发生错误:', error);
      return { success: false, error: error.message };
    }
  }

  async getInstallStatus() {
    try {
      const verification = await this.verify();
      
      return {
        installed: verification.success,
        error: verification.error,
        configPath: this.claudeSettingsPath,
        binaryPath: this.cchookBinaryPath
      };
    } catch (error) {
      return {
        installed: false,
        error: error.message,
        configPath: this.claudeSettingsPath,
        binaryPath: this.cchookBinaryPath
      };
    }
  }
}