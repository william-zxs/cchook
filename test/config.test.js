import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ConfigManager } from '../src/config/manager.js';
import { ConfigValidator } from '../src/config/validator.js';
import { FileSystemUtils } from '../src/utils/fs.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('ConfigManager', () => {
  let configManager;
  let testConfigDir;
  let originalGetCchookConfigDir;

  beforeEach(async () => {
    // 创建临时测试目录
    testConfigDir = path.join(os.tmpdir(), 'cchook-test', Date.now().toString());
    await fs.ensureDir(testConfigDir);

    // Mock FileSystemUtils.getCchookConfigDir
    originalGetCchookConfigDir = FileSystemUtils.getCchookConfigDir;
    FileSystemUtils.getCchookConfigDir = () => testConfigDir;

    configManager = new ConfigManager();
  });

  afterEach(async () => {
    // 恢复原方法
    FileSystemUtils.getCchookConfigDir = originalGetCchookConfigDir;
    
    // 清理测试目录
    try {
      await fs.remove(path.dirname(testConfigDir));
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('loadConfig', () => {
    it('should create default config when no config file exists', async () => {
      const config = await configManager.loadConfig();
      
      expect(config).toBeDefined();
      expect(config.mode).toBe('normal');
      expect(config.enabledEvents).toBeInstanceOf(Array);
      expect(config.notifications).toBeDefined();
    });

    it('should load existing valid config', async () => {
      const testConfig = {
        mode: 'silent',
        enabledEvents: ['Notification'],
        notifications: { type: 'console' }
      };

      await FileSystemUtils.writeJsonFile(
        path.join(testConfigDir, 'config.json'),
        testConfig
      );

      const config = await configManager.loadConfig();
      
      expect(config.mode).toBe('silent');
      expect(config.enabledEvents).toEqual(['Notification']);
    });

    it('should use default config for invalid config file', async () => {
      // 写入无效配置
      await FileSystemUtils.writeJsonFile(
        path.join(testConfigDir, 'config.json'),
        { invalidField: 'test' }
      );

      const config = await configManager.loadConfig();
      
      // 应该使用默认配置
      expect(config.mode).toBe('normal');
      expect(config.enabledEvents).toContain('Notification');
    });
  });

  describe('setMode', () => {
    it('should set valid mode', async () => {
      await configManager.loadConfig();
      await configManager.setMode('silent');
      
      const config = configManager.getConfig();
      expect(config.mode).toBe('silent');
    });

    it('should reject invalid mode', async () => {
      await configManager.loadConfig();
      
      await expect(configManager.setMode('invalid')).rejects.toThrow();
    });
  });

  describe('event management', () => {
    beforeEach(async () => {
      await configManager.loadConfig();
    });

    it('should add valid event', async () => {
      await configManager.addEvent('Stop');
      
      const config = configManager.getConfig();
      expect(config.enabledEvents).toContain('Stop');
    });

    it('should remove event', async () => {
      await configManager.addEvent('Stop');
      await configManager.removeEvent('Stop');
      
      const config = configManager.getConfig();
      expect(config.enabledEvents).not.toContain('Stop');
    });

    it('should reject invalid event', async () => {
      await expect(configManager.addEvent('InvalidEvent')).rejects.toThrow();
    });
  });

  describe('isEventEnabled', () => {
    beforeEach(async () => {
      await configManager.loadConfig();
    });

    it('should return false in silent mode', async () => {
      await configManager.setMode('silent');
      await configManager.addEvent('Notification');
      
      expect(configManager.isEventEnabled('Notification')).toBe(false);
    });

    it('should return true for enabled events in normal mode', async () => {
      await configManager.setMode('normal');
      await configManager.addEvent('Notification');
      
      expect(configManager.isEventEnabled('Notification')).toBe(true);
    });

    it('should return false for disabled events', async () => {
      await configManager.setMode('normal');
      
      expect(configManager.isEventEnabled('Stop')).toBe(false);
    });
  });
});

describe('ConfigValidator', () => {
  describe('validateConfig', () => {
    it('should validate correct config', () => {
      const config = {
        mode: 'normal',
        enabledEvents: ['Notification', 'Stop'],
        notifications: {
          type: 'osascript',
          osascript: {
            title: 'Test',
            sound: 'default'
          }
        }
      };

      const result = ConfigValidator.validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid mode', () => {
      const config = {
        mode: 'invalid',
        enabledEvents: []
      };

      const result = ConfigValidator.validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('无效的模式'))).toBe(true);
    });

    it('should reject invalid events', () => {
      const config = {
        mode: 'normal',
        enabledEvents: ['InvalidEvent']
      };

      const result = ConfigValidator.validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('无效的事件类型'))).toBe(true);
    });
  });

  describe('getDefaultConfig', () => {
    it('should return valid default config', () => {
      const defaultConfig = ConfigValidator.getDefaultConfig();
      
      expect(defaultConfig.mode).toBe('normal');
      expect(defaultConfig.enabledEvents).toBeInstanceOf(Array);
      expect(defaultConfig.notifications).toBeDefined();
      expect(defaultConfig.notifications.type).toBe('osascript');
    });
  });

  describe('sanitizeConfig', () => {
    it('should sanitize invalid config', () => {
      const invalidConfig = {
        mode: 'invalid',
        enabledEvents: ['InvalidEvent', 'Notification'],
        notifications: { type: 'invalid' }
      };

      const sanitized = ConfigValidator.sanitizeConfig(invalidConfig);
      
      expect(sanitized.mode).toBe('normal'); // 应该回退到默认值
      expect(sanitized.enabledEvents).toEqual(['Notification']); // 应该过滤无效事件
    });
  });
});