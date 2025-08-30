import { describe, it, expect } from '@jest/globals';
import { ConfigValidator } from '../src/config/validator.js';

describe('Simple Tests', () => {
  it('should validate ConfigValidator constants', () => {
    expect(ConfigValidator.VALID_MODES).toContain('normal');
    expect(ConfigValidator.VALID_MODES).toContain('silent');
    expect(ConfigValidator.VALID_EVENTS).toContain('Notification');
  });

  it('should create default config', () => {
    const defaultConfig = ConfigValidator.getDefaultConfig();
    expect(defaultConfig).toBeDefined();
    expect(defaultConfig.mode).toBe('normal');
    expect(Array.isArray(defaultConfig.enabledEvents)).toBe(true);
  });
});