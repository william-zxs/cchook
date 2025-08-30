import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { OSAScriptNotifier } from '../src/notifications/osascript.js';
import { ConsoleNotifier } from '../src/notifications/console.js';
import { NotificationFactory } from '../src/notifications/factory.js';

// Mock child_process for osascript tests
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('OSAScriptNotifier', () => {
  let notifier;

  beforeEach(() => {
    notifier = new OSAScriptNotifier({
      title: 'Test App',
      subtitle: 'Test Subtitle',
      sound: 'default'
    });
  });

  describe('buildOSAScriptCommand', () => {
    it('should build correct osascript command', () => {
      const command = notifier.buildOSAScriptCommand({
        title: 'Test Title',
        message: 'Test Message',
        subtitle: 'Test Subtitle',
        sound: 'default'
      });

      expect(command).toContain('osascript -e');
      expect(command).toContain('display notification "Test Message"');
      expect(command).toContain('with title "Test Title"');
      expect(command).toContain('subtitle "Test Subtitle"');
      expect(command).toContain('sound name "default"');
    });

    it('should handle empty fields', () => {
      const command = notifier.buildOSAScriptCommand({
        title: '',
        message: 'Test Message',
        subtitle: '',
        sound: 'none'
      });

      expect(command).toContain('display notification "Test Message"');
      expect(command).not.toContain('with title');
      expect(command).not.toContain('subtitle');
      expect(command).not.toContain('sound name');
    });
  });

  describe('sanitizeText', () => {
    it('should escape special characters', () => {
      const unsafe = 'Test "quotes" and \\backslashes';
      const safe = notifier.sanitizeText(unsafe);
      
      expect(safe).toBe('Test \\"quotes\\" and \\\\backslashes');
    });

    it('should handle newlines and tabs', () => {
      const text = 'Line 1\nLine 2\tTabbed';
      const sanitized = notifier.sanitizeText(text);
      
      expect(sanitized).toBe('Line 1 Line 2 Tabbed');
    });

    it('should handle null and undefined', () => {
      expect(notifier.sanitizeText(null)).toBe('');
      expect(notifier.sanitizeText(undefined)).toBe('');
    });
  });
});

describe('ConsoleNotifier', () => {
  let notifier;
  let consoleSpy;

  beforeEach(() => {
    notifier = new ConsoleNotifier();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('notify', () => {
    it('should log notification to console', async () => {
      await notifier.notify({
        title: 'Test Title',
        message: 'Test Message',
        level: 'info'
      });

      expect(consoleSpy).toHaveBeenCalled();
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('Test Title');
      expect(call).toContain('Test Message');
    });

    it('should handle different levels', async () => {
      await notifier.notify({
        message: 'Success message',
        level: 'success'
      });

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('displayNotification', () => {
    it('should format notification correctly', () => {
      notifier.displayNotification({
        title: 'Test',
        message: 'Message',
        subtitle: 'Subtitle',
        level: 'info'
      });

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});

describe('NotificationFactory', () => {
  describe('create', () => {
    it('should create OSAScriptNotifier for osascript type', () => {
      const notifier = NotificationFactory.create('osascript');
      expect(notifier).toBeInstanceOf(OSAScriptNotifier);
    });

    it('should create ConsoleNotifier for console type', () => {
      const notifier = NotificationFactory.create('console');
      expect(notifier).toBeInstanceOf(ConsoleNotifier);
    });

    it('should fallback to ConsoleNotifier for invalid type', () => {
      const notifier = NotificationFactory.create('invalid');
      expect(notifier).toBeInstanceOf(ConsoleNotifier);
    });

    it('should pass config to notifier', () => {
      const config = {
        osascript: {
          title: 'Custom Title',
          sound: 'Ping'
        }
      };

      const notifier = NotificationFactory.create('osascript', config);
      expect(notifier.defaultTitle).toBe('Custom Title');
      expect(notifier.defaultSound).toBe('Ping');
    });
  });

  describe('getSupportedTypes', () => {
    it('should return array of supported types', () => {
      const types = NotificationFactory.getSupportedTypes();
      expect(types).toBeInstanceOf(Array);
      expect(types).toContain('osascript');
      expect(types).toContain('console');
    });
  });

  describe('detectBestNotifier', () => {
    it('should detect osascript on darwin platform', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        writable: true
      });

      // Mock successful osascript execution
      const { exec } = await import('child_process');
      exec.mockImplementation((cmd, callback) => {
        callback(null, { stdout: '', stderr: '' });
      });

      const bestType = await NotificationFactory.detectBestNotifier();
      expect(bestType).toBe('osascript');

      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        writable: true
      });
    });
  });
});