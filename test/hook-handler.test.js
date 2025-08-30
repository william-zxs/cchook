import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { HookHandler } from '../src/hook/handler.js';

// Mock dependencies
jest.mock('../src/config/manager.js');
jest.mock('../src/notifications/factory.js');

describe('HookHandler', () => {
  let hookHandler;
  let mockConfigManager;
  let mockNotifier;

  beforeEach(() => {
    mockNotifier = {
      notify: jest.fn().mockResolvedValue({ success: true })
    };

    mockConfigManager = {
      loadConfig: jest.fn().mockResolvedValue(),
      isEventEnabled: jest.fn().mockReturnValue(true),
      getNotificationConfig: jest.fn().mockReturnValue({
        type: 'console'
      })
    };

    const { ConfigManager } = require('../src/config/manager.js');
    ConfigManager.mockImplementation(() => mockConfigManager);

    const { NotificationFactory } = require('../src/notifications/factory.js');
    NotificationFactory.create = jest.fn().mockReturnValue(mockNotifier);

    hookHandler = new HookHandler();
  });

  describe('processHookEvent', () => {
    it('should process valid hook event', async () => {
      const hookData = {
        hook_event_name: 'Notification',
        message: 'Test notification'
      };

      const result = await hookHandler.processHookEvent(hookData);

      expect(result.success).toBe(true);
      expect(mockConfigManager.loadConfig).toHaveBeenCalled();
      expect(mockConfigManager.isEventEnabled).toHaveBeenCalledWith('Notification');
      expect(mockNotifier.notify).toHaveBeenCalled();
    });

    it('should skip disabled events', async () => {
      mockConfigManager.isEventEnabled.mockReturnValue(false);

      const hookData = {
        hook_event_name: 'Notification',
        message: 'Test notification'
      };

      const result = await hookHandler.processHookEvent(hookData);

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(mockNotifier.notify).not.toHaveBeenCalled();
    });

    it('should handle missing hook_event_name', async () => {
      const hookData = {
        message: 'Test notification'
      };

      const result = await hookHandler.processHookEvent(hookData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('缺少事件名称');
    });
  });

  describe('handleNotification', () => {
    it('should handle notification event', async () => {
      const hookData = {
        message: 'Test notification message'
      };

      const result = await hookHandler.handleNotification(hookData, mockNotifier);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('Notification');
      expect(mockNotifier.notify).toHaveBeenCalledWith({
        title: 'Claude Code 通知',
        message: 'Test notification message',
        subtitle: '需要注意'
      });
    });
  });

  describe('handleStop', () => {
    it('should handle stop event', async () => {
      const result = await hookHandler.handleStop({}, mockNotifier);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('Stop');
      expect(mockNotifier.notify).toHaveBeenCalledWith({
        title: 'Claude Code',
        message: '任务已完成',
        subtitle: 'Claude 已停止工作'
      });
    });
  });

  describe('handlePreToolUse', () => {
    it('should handle important tool use', async () => {
      const hookData = {
        tool_name: 'Bash',
        tool_input: {
          command: 'ls -la'
        }
      };

      const result = await hookHandler.handlePreToolUse(hookData, mockNotifier);

      expect(result.success).toBe(true);
      expect(mockNotifier.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Claude Code',
          subtitle: '工具即将执行'
        })
      );
    });

    it('should skip non-important tools', async () => {
      const hookData = {
        tool_name: 'Read',
        tool_input: {}
      };

      const result = await hookHandler.handlePreToolUse(hookData, mockNotifier);

      expect(result.success).toBe(true);
      expect(mockNotifier.notify).not.toHaveBeenCalled();
    });
  });

  describe('handleUserPromptSubmit', () => {
    it('should handle user prompt with truncation', async () => {
      const longPrompt = 'This is a very long prompt that should be truncated because it exceeds the maximum length';
      const hookData = {
        prompt: longPrompt
      };

      const result = await hookHandler.handleUserPromptSubmit(hookData, mockNotifier);

      expect(result.success).toBe(true);
      expect(mockNotifier.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Claude Code',
          message: '新的提示已提交',
          subtitle: expect.stringContaining('...')
        })
      );
    });
  });

  describe('handleEventType', () => {
    it('should route to correct handler', async () => {
      const spy = jest.spyOn(hookHandler, 'handleNotification');
      
      await hookHandler.handleEventType('Notification', { message: 'test' }, mockNotifier);

      expect(spy).toHaveBeenCalledWith({ message: 'test' }, mockNotifier);
    });

    it('should handle unknown event type', async () => {
      const result = await hookHandler.handleEventType('UnknownEvent', {}, mockNotifier);

      expect(result.success).toBe(false);
      expect(result.error).toContain('未知的事件类型');
    });
  });
});