export class ConfigValidator {
  static VALID_MODES = ['normal', 'silent'];
  
  static VALID_EVENTS = [
    'Notification',
    'Stop',
    'SubagentStop',
    'UserPromptSubmit',
    'PreToolUse',
    'PostToolUse',
    'PreCompact',
    'SessionStart',
    'SessionEnd'
  ];

  static VALID_NOTIFICATION_TYPES = ['osascript', 'console', 'dingtalk', 'macos'];

  static validateConfig(config) {
    const errors = [];

    // 验证基本结构
    if (!config || typeof config !== 'object') {
      errors.push('配置必须是一个对象');
      return { valid: false, errors };
    }

    // 验证模式
    if (config.mode && !this.VALID_MODES.includes(config.mode)) {
      errors.push(`无效的模式: ${config.mode}。有效值: ${this.VALID_MODES.join(', ')}`);
    }

    // 验证启用的事件
    if (config.enabledEvents) {
      if (!Array.isArray(config.enabledEvents)) {
        errors.push('enabledEvents 必须是数组');
      } else {
        const invalidEvents = config.enabledEvents.filter(
          event => !this.VALID_EVENTS.includes(event)
        );
        if (invalidEvents.length > 0) {
          errors.push(`无效的事件类型: ${invalidEvents.join(', ')}。有效值: ${this.VALID_EVENTS.join(', ')}`);
        }
      }
    }

    // 验证通知配置
    if (config.notifications) {
      if (typeof config.notifications !== 'object') {
        errors.push('notifications 必须是对象');
      } else {
        // 验证通知类型
        if (config.notifications.type && !this.VALID_NOTIFICATION_TYPES.includes(config.notifications.type)) {
          errors.push(`无效的通知类型: ${config.notifications.type}。有效值: ${this.VALID_NOTIFICATION_TYPES.join(', ')}`);
        }

        // 验证 osascript 配置
        if (config.notifications.type === 'osascript' && config.notifications.osascript) {
          const osConfig = config.notifications.osascript;
          if (osConfig.title && typeof osConfig.title !== 'string') {
            errors.push('osascript.title 必须是字符串');
          }
          if (osConfig.subtitle && typeof osConfig.subtitle !== 'string') {
            errors.push('osascript.subtitle 必须是字符串');
          }
          if (osConfig.sound && typeof osConfig.sound !== 'string') {
            errors.push('osascript.sound 必须是字符串');
          }
        }

        // 验证钉钉配置
        if (config.notifications.dingtalk) {
          const dingtalkConfig = config.notifications.dingtalk;
          if (dingtalkConfig.accessToken && typeof dingtalkConfig.accessToken !== 'string') {
            errors.push('dingtalk.accessToken 必须是字符串');
          }
          if (dingtalkConfig.secret && typeof dingtalkConfig.secret !== 'string') {
            errors.push('dingtalk.secret 必须是字符串');
          }
        }

        // 验证 macOS 配置
        if (config.notifications.macos) {
          const macosConfig = config.notifications.macos;
          if (macosConfig.title && typeof macosConfig.title !== 'string') {
            errors.push('macos.title 必须是字符串');
          }
          if (macosConfig.subtitle && typeof macosConfig.subtitle !== 'string') {
            errors.push('macos.subtitle 必须是字符串');
          }
          if (macosConfig.sound !== undefined && typeof macosConfig.sound !== 'boolean') {
            errors.push('macos.sound 必须是布尔值');
          }
        }

        // 验证默认通知类型
        if (config.notifications.defaultTypes) {
          if (!Array.isArray(config.notifications.defaultTypes)) {
            errors.push('notifications.defaultTypes 必须是数组');
          } else {
            const validTypes = ['dingtalk', 'macos'];
            const invalidTypes = config.notifications.defaultTypes.filter(
              type => !validTypes.includes(type)
            );
            if (invalidTypes.length > 0) {
              errors.push(`无效的默认通知类型: ${invalidTypes.join(', ')}。有效值: ${validTypes.join(', ')}`);
            }
          }
        }
      }
    }

    // 验证项目配置
    if (config.projectConfigs) {
      if (typeof config.projectConfigs !== 'object') {
        errors.push('projectConfigs 必须是对象');
      } else {
        for (const [projectPath, projectConfig] of Object.entries(config.projectConfigs)) {
          if (typeof projectConfig !== 'object') {
            errors.push(`项目配置 ${projectPath} 必须是对象`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static getDefaultConfig() {
    return {
      version: '1.0.0',
      mode: 'normal',
      enabledEvents: [
        'Notification',
        'Stop',
        'UserPromptSubmit'
      ],
      notifications: {
        type: 'osascript',
        osascript: {
          title: 'Claude Code',
          subtitle: '通知',
          sound: 'default'
        },
        dingtalk: {
          accessToken: '',
          secret: ''
        },
        macos: {
          title: '钉钉机器人通知',
          subtitle: '',
          sound: true
        },
        defaultTypes: ['dingtalk']
      },
      projectConfigs: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static sanitizeConfig(config) {
    const defaultConfig = this.getDefaultConfig();
    
    return {
      ...defaultConfig,
      ...config,
      mode: this.VALID_MODES.includes(config.mode) ? config.mode : defaultConfig.mode,
      enabledEvents: Array.isArray(config.enabledEvents) 
        ? config.enabledEvents.filter(event => this.VALID_EVENTS.includes(event))
        : defaultConfig.enabledEvents,
      updatedAt: new Date().toISOString()
    };
  }
}