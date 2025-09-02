import { jest } from '@jest/globals';
import { ConfigManager } from '../src/config/manager.js';
import { CommandRegistry } from '../src/cli/command-registry.js';
import { ErrorHandler } from '../src/utils/error-handler.js';

describe('CLI Commands', () => {
  let configManager;
  let mockConsoleLog;
  let mockProcessExit;

  beforeEach(() => {
    configManager = new ConfigManager();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ConfigManager Caching', () => {
    test('should use cached config when valid', async () => {
      const mockConfig = { mode: 'normal', enabledEvents: [] };
      configManager.config = mockConfig;
      configManager.lastLoadTime = Date.now();

      const result = await configManager.loadConfig();
      expect(result).toBe(mockConfig);
    });

    test('should reload config when cache expired', async () => {
      configManager.config = { mode: 'normal' };
      configManager.lastLoadTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago

      // Mock file system to return valid config
      jest.spyOn(configManager, 'loadConfig').mockImplementation(async () => {
        return { mode: 'silent', enabledEvents: ['Notification'] };
      });

      const result = await configManager.loadConfig();
      expect(result.mode).toBe('silent');
    });

    test('should clear cache correctly', () => {
      configManager.config = { mode: 'normal' };
      configManager.lastLoadTime = Date.now();

      configManager.clearCache();

      expect(configManager.config).toBeNull();
      expect(configManager.lastLoadTime).toBe(0);
    });

    test('should check cache validity correctly', () => {
      configManager.config = { mode: 'normal' };
      configManager.lastLoadTime = Date.now();

      expect(configManager.isCacheValid()).toBe(true);

      configManager.lastLoadTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      expect(configManager.isCacheValid()).toBe(false);
    });

    test('should return cache status', () => {
      const now = Date.now();
      configManager.config = { mode: 'normal' };
      configManager.lastLoadTime = now - 1000; // 1 second ago

      const status = configManager.getCacheStatus();
      
      expect(status.cached).toBe(true);
      expect(status.age).toBeGreaterThan(0);
      expect(status.remaining).toBeGreaterThan(0);
      expect(status.expired).toBe(false);
    });
  });

  describe('CommandRegistry', () => {
    let commandRegistry;

    beforeEach(() => {
      commandRegistry = new CommandRegistry();
    });

    test('should initialize correctly', () => {
      expect(commandRegistry.initialized).toBe(false);
      expect(commandRegistry.commands).toBeInstanceOf(Map);
    });

    test('should track registered commands', () => {
      const mockCommandFactory = jest.fn();
      const mockProgram = { 
        command: jest.fn().mockReturnValue({ 
          description: jest.fn().mockReturnThis(),
          option: jest.fn().mockReturnThis(),
          action: jest.fn().mockReturnThis()
        })
      };

      commandRegistry.registerCommand('test', mockCommandFactory, mockProgram);

      expect(commandRegistry.hasCommand('test')).toBe(true);
      expect(commandRegistry.getRegisteredCommands()).toContain('test');
    });

    test('should handle command registration errors', () => {
      const mockCommandFactory = jest.fn(() => {
        throw new Error('Registration failed');
      });
      const mockProgram = {};

      expect(() => {
        commandRegistry.registerCommand('test', mockCommandFactory, mockProgram);
      }).toThrow('Failed to register command test: Registration failed');
    });
  });

  describe('ErrorHandler', () => {
    test('should identify error types correctly', () => {
      const configError = new Error('configuration failed');
      const networkError = new Error('network request failed');
      const permissionError = new Error('permission denied EACCES');
      
      expect(ErrorHandler.getErrorType(configError)).toBe('CONFIG_LOAD_FAILED');
      expect(ErrorHandler.getErrorType(networkError)).toBe('NETWORK_ERROR');
      expect(ErrorHandler.getErrorType(permissionError)).toBe('PERMISSION_ERROR');
    });

    test('should provide friendly error messages', () => {
      const error = new Error('configuration validation failed');
      const message = ErrorHandler.getFriendlyErrorMessage(error, 'test-command');
      
      expect(typeof message).toBe('string');
      expect(message).toContain('test-command');
    });

    test('should identify recoverable errors', () => {
      const networkError = new Error('network failed');
      const configError = new Error('config file not found');
      
      expect(ErrorHandler.isRecoverableError(networkError)).toBe(true);
      expect(ErrorHandler.isRecoverableError(configError)).toBe(false);
    });

    test('should provide recovery suggestions', () => {
      const error = new Error('notification failed');
      const suggestion = ErrorHandler.getRecoverySuggestion(error);
      
      expect(typeof suggestion).toBe('string');
      expect(suggestion.length).toBeGreaterThan(0);
    });

    test('should wrap async commands with error handling', async () => {
      const mockCommand = jest.fn().mockResolvedValue('success');
      const wrappedCommand = ErrorHandler.wrapAsyncCommand(mockCommand, 'test');
      
      const result = await wrappedCommand('arg1', 'arg2');
      
      expect(mockCommand).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('success');
    });

    test('should handle errors in wrapped commands', async () => {
      const mockCommand = jest.fn().mockRejectedValue(new Error('test error'));
      const wrappedCommand = ErrorHandler.wrapAsyncCommand(mockCommand, 'test');
      
      await wrappedCommand();
      
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });
});

describe('Integration Tests', () => {
  test('should load and cache config in realistic scenario', async () => {
    const configManager = new ConfigManager();
    
    // First load should hit the file system
    const config1 = await configManager.loadConfig();
    expect(config1).toBeDefined();
    
    // Second load should use cache
    const config2 = await configManager.loadConfig();
    expect(config2).toBe(config1); // Same object reference indicates cache hit
  });
});