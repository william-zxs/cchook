import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { HookInstaller } from '../src/hook/installer.js';
import { FileSystemUtils } from '../src/utils/fs.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('HookInstaller', () => {
  let installer;
  let testDir;
  let originalGetClaudeConfigDir;

  beforeEach(async () => {
    // 创建临时测试目录
    testDir = path.join(os.tmpdir(), 'cchook-installer-test', Date.now().toString());
    await fs.ensureDir(testDir);

    // Mock Claude 配置目录
    originalGetClaudeConfigDir = FileSystemUtils.getClaudeConfigDir;
    FileSystemUtils.getClaudeConfigDir = () => testDir;

    installer = new HookInstaller();
  });

  afterEach(async () => {
    // 恢复原方法
    FileSystemUtils.getClaudeConfigDir = originalGetClaudeConfigDir;
    
    // 清理测试目录
    try {
      await fs.remove(path.dirname(testDir));
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('install', () => {
    it('should install hooks to empty Claude config', async () => {
      const result = await installer.install();

      expect(result.success).toBe(true);
      
      // 验证配置文件已创建
      const configExists = await fs.pathExists(installer.claudeSettingsPath);
      expect(configExists).toBe(true);
      
      // 验证配置内容
      const config = await fs.readJson(installer.claudeSettingsPath);
      expect(config.hooks).toBeDefined();
      expect(config.hooks.Notification).toBeDefined();
      expect(config.hooks.Stop).toBeDefined();
    });

    it('should merge with existing Claude config', async () => {
      const existingConfig = {
        someExistingSetting: 'value',
        hooks: {
          ExistingHook: [{ hooks: [{ type: 'command', command: 'echo test' }] }]
        }
      };

      await fs.writeJson(installer.claudeSettingsPath, existingConfig);

      const result = await installer.install();

      expect(result.success).toBe(true);
      
      const config = await fs.readJson(installer.claudeSettingsPath);
      expect(config.someExistingSetting).toBe('value');
      expect(config.hooks.ExistingHook).toBeDefined();
      expect(config.hooks.Notification).toBeDefined();
    });

    it('should backup existing config', async () => {
      const existingConfig = { test: 'value' };
      await fs.writeJson(installer.claudeSettingsPath, existingConfig);

      const result = await installer.install();

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      
      // 验证备份文件存在
      const backupExists = await fs.pathExists(result.backupPath);
      expect(backupExists).toBe(true);
    });

    it('should not overwrite existing hooks without force', async () => {
      const existingConfig = {
        hooks: {
          Notification: [{ hooks: [{ type: 'command', command: 'existing' }] }]
        }
      };

      await fs.writeJson(installer.claudeSettingsPath, existingConfig);

      const result = await installer.install(false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('配置已存在');
    });

    it('should overwrite existing hooks with force', async () => {
      const existingConfig = {
        hooks: {
          Notification: [{ hooks: [{ type: 'command', command: 'existing' }] }]
        }
      };

      await fs.writeJson(installer.claudeSettingsPath, existingConfig);

      const result = await installer.install(true);

      expect(result.success).toBe(true);
      
      const config = await fs.readJson(installer.claudeSettingsPath);
      const notificationCommand = config.hooks.Notification[0].hooks[0].command;
      expect(notificationCommand).toContain('cchook');
    });
  });

  describe('generateHooksConfig', () => {
    it('should generate correct hooks configuration', () => {
      const hooksConfig = installer.generateHooksConfig();

      expect(hooksConfig).toBeDefined();
      expect(hooksConfig.Notification).toBeDefined();
      expect(hooksConfig.Stop).toBeDefined();
      expect(hooksConfig.PreToolUse).toBeDefined();
      
      // 验证命令包含 cchook
      const notificationHook = hooksConfig.Notification[0].hooks[0];
      expect(notificationHook.command).toContain('cchook');
      expect(notificationHook.timeout).toBe(10);
    });

    it('should include matchers for tool-specific hooks', () => {
      const hooksConfig = installer.generateHooksConfig();

      expect(hooksConfig.PreToolUse[0].matcher).toBe('Bash|Write|Edit|MultiEdit');
      expect(hooksConfig.PostToolUse[0].matcher).toBe('Bash|Write|Edit|MultiEdit');
    });
  });

  describe('verify', () => {
    it('should verify successful installation', async () => {
      await installer.install();
      
      const result = await installer.verify();

      expect(result.success).toBe(true);
    });

    it('should fail verification when config missing', async () => {
      const result = await installer.verify();

      expect(result.success).toBe(false);
      expect(result.error).toContain('配置文件不存在');
    });

    it('should fail verification when hooks missing', async () => {
      await fs.writeJson(installer.claudeSettingsPath, { someOtherSetting: 'value' });
      
      const result = await installer.verify();

      expect(result.success).toBe(false);
      expect(result.error).toContain('没有 hooks 部分');
    });

    it('should fail verification when required events missing', async () => {
      const incompleteConfig = {
        hooks: {
          SomeOtherEvent: [{ hooks: [{ type: 'command', command: 'test' }] }]
        }
      };

      await fs.writeJson(installer.claudeSettingsPath, incompleteConfig);
      
      const result = await installer.verify();

      expect(result.success).toBe(false);
      expect(result.error).toContain('缺少必要的 hook 事件');
    });
  });

  describe('uninstall', () => {
    it('should remove cchook hooks while preserving others', async () => {
      const mixedConfig = {
        hooks: {
          Notification: [
            { hooks: [{ type: 'command', command: 'node cchook.js' }] },
            { hooks: [{ type: 'command', command: 'other-command' }] }
          ],
          CustomHook: [
            { hooks: [{ type: 'command', command: 'custom-command' }] }
          ]
        }
      };

      await fs.writeJson(installer.claudeSettingsPath, mixedConfig);

      const result = await installer.uninstall();

      expect(result.success).toBe(true);
      
      const config = await fs.readJson(installer.claudeSettingsPath);
      
      // cchook 相关的 hook 应该被移除
      expect(config.hooks.Notification).toHaveLength(1);
      expect(config.hooks.Notification[0].hooks[0].command).toBe('other-command');
      
      // 其他 hook 应该保留
      expect(config.hooks.CustomHook).toBeDefined();
    });

    it('should remove hooks section when no hooks remain', async () => {
      const cchookOnlyConfig = {
        hooks: {
          Notification: [
            { hooks: [{ type: 'command', command: 'node cchook.js' }] }
          ]
        },
        otherSetting: 'value'
      };

      await fs.writeJson(installer.claudeSettingsPath, cchookOnlyConfig);

      const result = await installer.uninstall();

      expect(result.success).toBe(true);
      
      const config = await fs.readJson(installer.claudeSettingsPath);
      expect(config.hooks).toBeUndefined();
      expect(config.otherSetting).toBe('value');
    });
  });

  describe('getInstallStatus', () => {
    it('should return correct status for installed hooks', async () => {
      await installer.install();
      
      const status = await installer.getInstallStatus();

      expect(status.installed).toBe(true);
      expect(status.error).toBeUndefined();
      expect(status.configPath).toBe(installer.claudeSettingsPath);
      expect(status.binaryPath).toBe(installer.cchookBinaryPath);
    });

    it('should return correct status for not installed hooks', async () => {
      const status = await installer.getInstallStatus();

      expect(status.installed).toBe(false);
      expect(status.error).toBeDefined();
      expect(status.configPath).toBe(installer.claudeSettingsPath);
    });
  });
});