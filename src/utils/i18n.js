import os from 'os';

// 语言资源
const messages = {
  'zh-CN': {
    // Mode command
    'mode.description': '查看或设置工作模式 (normal|silent)',
    'mode.current': '当前工作模式: {0} {1}',
    'mode.notification.enabled': '通知功能已启用',
    'mode.notification.disabled': '通知功能已禁用（静音模式）',
    'mode.events.count': '已启用 {0} 个事件通知',
    'mode.available': '可用模式:',
    'mode.current.suffix': ' (当前)',
    'mode.invalid': '无效的模式: {0}',
    'mode.valid.modes': '有效模式: {0}',
    'mode.already.set': '模式已经是 {0}',
    'mode.switched': '{0} 模式已切换为: {1}',
    'mode.notification.will.receive': '现在会接收 Claude Code 的通知',
    'mode.notification.all.ignored': '所有通知将被忽略',
    'mode.operation.failed': '模式操作失败: {0}',

    // Status command
    'status.description': '显示当前配置状态',
    'status.verbose': '显示详细信息',
    'status.system.title': '📊 cchook 系统状态',
    'status.mode': '工作模式: {0}',
    'status.notification.type': '通知类型: {0}',
    'status.enabled.events': '启用事件: {0}/{1}',
    'status.config.files.title': '📁 配置文件状态',
    'status.config.cchook': 'cchook 配置: {0}',
    'status.config.claude': 'Claude Code 配置: {0}',
    'status.config.exists': '✓ 存在',
    'status.config.not.exists': '✗ 不存在',
    'status.config.missing': '! 不存在',
    'status.detailed.title': '🔧 详细配置',
    'status.enabled.events.list': '启用的事件:',
    'status.no.events': '  没有启用任何事件',
    'status.notification.config': '通知配置:',
    'status.notification.type.label': '  类型: {0}',
    'status.notification.title': '  标题: {0}',
    'status.notification.subtitle': '  副标题: {0}',
    'status.notification.sound': '  声音: {0}',
    'status.default': '默认',
    'status.system.info.title': '💻 系统信息',
    'status.platform': '平台: {0}',
    'status.node.version': 'Node.js: {0}',
    'status.working.directory': '工作目录: {0}',
    'status.created.at': '配置创建: {0}',
    'status.updated.at': '最后更新: {0}',
    'status.warning.silent': '⚠️  当前处于静音模式，所有通知被禁用',
    'status.warning.no.events': '⚠️  没有启用任何事件，不会接收到通知',
    'status.warning.no.claude.config': '⚠️  Claude Code 配置不存在，请运行 `cchook setup` 进行初始化',
    'status.success.normal': '✅ 系统运行正常，可以接收通知',
    'status.suggestion.setup': '💡 建议操作: 运行 `cchook setup` 初始化配置',
    'status.suggestion.enable': '💡 建议操作: 运行 `cchook events add Notification` 启用基本通知',

    // Setup command
    'setup.description': '初始化配置并安装 hooks 到 Claude Code',
    'setup.force': '强制重新安装，覆盖现有配置',
    'setup.dry.run': '只显示将要执行的操作，不实际修改',
    'setup.start': '🚀 开始初始化 cchook...',
    'setup.init.config': '📝 初始化配置文件...',
    'setup.init.complete': '配置文件初始化完成',
    'setup.install.hooks': '🔗 安装 hooks 到 Claude Code...',
    'setup.install.complete': 'Claude Code hooks 安装完成',
    'setup.backup.info': '原配置已备份到: {0}',
    'setup.install.failed': 'Claude Code hooks 安装失败:',
    'setup.verify': '🔍 验证安装...',
    'setup.verify.success': '✅ 安装验证通过',
    'setup.ready': 'cchook 已就绪！现在可以接收 Claude Code 的通知了。',
    'setup.next.steps': '下一步操作:',
    'setup.next.tui': '• 运行 `cchook` 启动 TUI 管理界面',
    'setup.next.test': '• 运行 `cchook test` 测试通知功能',
    'setup.next.silent': '• 运行 `cchook mode silent` 切换到静音模式',
    'setup.verify.failed': '⚠️  安装验证失败:',
    'setup.check.config': '请检查 Claude Code 配置文件是否正确',
    'setup.error': '❌ 安装过程中发生错误:',
    'setup.success': '✅ Claude Code hooks 配置成功',
    'setup.failed': '❌ 配置失败: {0}',
    'setup.verification.failed': '❌ 安装验证失败: {0}',

    // Events command
    'events.description': '管理事件通知',
    'events.add.description': '启用事件通知',
    'events.remove.description': '禁用事件通知',
    'events.list.description': '列出所有可用事件',
    'events.test.description': '测试事件通知',
    'events.title': '📋 事件管理',
    'events.enabled.count': '已启用 {0} 个事件',
    'events.available.title': '可用事件:',
    'events.enabled.title': '已启用的事件:',
    'events.none.enabled': '  无',
    'events.already.enabled': '事件 {0} 已经启用',
    'events.enabled': '✅ 已启用事件: {0}',
    'events.not.enabled': '事件 {0} 未启用',
    'events.disabled': '🔕 已禁用事件: {0}',
    'events.list.failed': '获取事件列表失败:',
    'events.add.failed': '启用事件失败:',
    'events.remove.failed': '禁用事件失败:',
    'events.invalid': '无效的事件名: {0}',
    'events.valid.list': '有效事件: {0}',
    'events.test.success': '✅ 事件 {0} 测试成功',
    'events.test.failed': '❌ 事件 {0} 测试失败: {1}',
    
    // Event descriptions
    'event.description.Notification': 'Claude Code 发送的系统通知',
    'event.description.Stop': 'Claude 完成主要任务时的通知',
    'event.description.SubagentStop': '子任务或子代理完成时的通知',
    'event.description.UserPromptSubmit': '用户提交新提示时的通知',
    'event.description.PreToolUse': '工具执行前的通知（如 Bash、Write 等）',
    'event.description.PostToolUse': '工具执行后的通知',
    'event.description.PreCompact': '上下文压缩前的通知',
    'event.description.SessionStart': '会话开始时的通知',
    'event.description.SessionEnd': '会话结束时的通知',
    'event.description.unknown': '未知事件',

    // Test command
    'test.description': '测试通知功能',
    'test.all': '测试所有通知类型',
    'test.type': '指定要测试的通知类型',

    // Logs command
    'logs.description': '查看 hook 调用日志',
    'logs.number': '显示最后 N 行日志',
    'logs.follow': '实时跟踪日志',
    'logs.file.location': '日志文件: {0}',
    'logs.no.file': '日志文件不存在。Hook 可能尚未被调用。',
    'logs.show.last': '显示最后 {0} 行日志:',
    'logs.follow.info': '实时跟踪日志... (按 Ctrl+C 退出)',
    'logs.read.failed': '读取日志失败: {0}',

    // Notifications
    'notification.test.title': 'cchook 测试',
    'notification.test.message': '这是一个测试通知',
    'notification.test.subtitle.osascript': '如果您看到这个消息，说明通知功能正常工作',
    'notification.test.subtitle.console': '控制台通知功能正常工作',
    'notification.claude.title': 'Claude Code 通知',
    'notification.claude.subtitle': '需要注意',
    'notification.message.received': '收到通知',
    'notification.task.completed': '任务已完成',
    'notification.claude.stopped': 'Claude 已停止工作',
    'notification.subtask.completed': '子任务已完成',
    'notification.subagent.completed': '子代理已完成工作',
    'notification.prompt.submitted': '新的提示已提交',
    'notification.tool.about.to.execute': '即将执行 {0}',
    'notification.tool.executing': '工具即将执行',
    'notification.tool.executed.success': '{0} 执行成功',
    'notification.tool.executed.failed': '{0} 执行失败',
    'notification.tool.execution.completed': '工具执行完成',
    'notification.tool.execution.error': '执行过程中出现错误',
    'notification.compress.auto': '即将进行自动压缩',
    'notification.compress.manual': '即将进行手动压缩',
    'notification.compress.subtitle': '上下文即将被压缩',
    'notification.session.started': '会话已开始',
    'notification.session.start.source': '启动方式: {0}',
    'notification.session.ended': '会话已结束',
    'notification.session.end.reason': '结束原因: {0}',

    // Logger messages
    'logger.unsupported.notification': '不支持的通知类型: {0}，使用控制台通知',
    'logger.notifier.creation.failed': '创建 {0} 通知器失败:',
    'logger.fallback.console': '回退到控制台通知',
    'logger.test.success': '{0} 通知器测试成功',
    'logger.test.failed': '{0} 通知器测试失败:',
    'logger.test.error': '{0} 通知器测试异常:',
    'logger.macos.priority': '在 macOS 上优先使用 osascript',
    'logger.detection.title': '检测通知功能',
    'logger.detection.message': '正在检测最佳通知方式...',
    'logger.osascript.detected': '检测到 osascript 支持',
    'logger.osascript.unavailable': 'osascript 不可用:',
    'logger.console.fallback': '使用控制台通知作为默认方式',

    // Common
    'common.error': '错误',
    'common.warning': '警告',
    'common.success': '成功',
    'common.info': '信息'
  },

  'en-US': {
    // Mode command
    'mode.description': 'View or set working mode (normal|silent)',
    'mode.current': 'Current mode: {0} {1}',
    'mode.notification.enabled': 'Notifications enabled',
    'mode.notification.disabled': 'Notifications disabled (silent mode)',
    'mode.events.count': '{0} event notifications enabled',
    'mode.available': 'Available modes:',
    'mode.current.suffix': ' (current)',
    'mode.invalid': 'Invalid mode: {0}',
    'mode.valid.modes': 'Valid modes: {0}',
    'mode.already.set': 'Mode is already {0}',
    'mode.switched': '{0} Mode switched to: {1}',
    'mode.notification.will.receive': 'You will now receive Claude Code notifications',
    'mode.notification.all.ignored': 'All notifications will be ignored',
    'mode.operation.failed': 'Mode operation failed: {0}',

    // Status command
    'status.description': 'Show current configuration status',
    'status.verbose': 'Show detailed information',
    'status.system.title': '📊 cchook System Status',
    'status.mode': 'Working Mode: {0}',
    'status.notification.type': 'Notification Type: {0}',
    'status.enabled.events': 'Enabled Events: {0}/{1}',
    'status.config.files.title': '📁 Configuration Files Status',
    'status.config.cchook': 'cchook Config: {0}',
    'status.config.claude': 'Claude Code Config: {0}',
    'status.config.exists': '✓ Exists',
    'status.config.not.exists': '✗ Not Found',
    'status.config.missing': '! Missing',
    'status.detailed.title': '🔧 Detailed Configuration',
    'status.enabled.events.list': 'Enabled Events:',
    'status.no.events': '  None',
    'status.notification.config': 'Notification Configuration:',
    'status.notification.type.label': '  Type: {0}',
    'status.notification.title': '  Title: {0}',
    'status.notification.subtitle': '  Subtitle: {0}',
    'status.notification.sound': '  Sound: {0}',
    'status.default': 'Default',
    'status.system.info.title': '💻 System Information',
    'status.platform': 'Platform: {0}',
    'status.node.version': 'Node.js: {0}',
    'status.working.directory': 'Working Directory: {0}',
    'status.created.at': 'Config Created: {0}',
    'status.updated.at': 'Last Updated: {0}',
    'status.warning.silent': '⚠️  Currently in silent mode, all notifications disabled',
    'status.warning.no.events': '⚠️  No events enabled, you will not receive notifications',
    'status.warning.no.claude.config': '⚠️  Claude Code configuration not found, run `cchook setup` to initialize',
    'status.success.normal': '✅ System running normally, ready to receive notifications',
    'status.suggestion.setup': '💡 Suggestion: Run `cchook setup` to initialize configuration',
    'status.suggestion.enable': '💡 Suggestion: Run `cchook events add Notification` to enable basic notifications',

    // Setup command  
    'setup.description': 'Initialize configuration and install hooks to Claude Code',
    'setup.force': 'Force reinstall, overwrite existing configuration',
    'setup.dry.run': 'Only show operations to be performed, do not modify',
    'setup.start': '🚀 Starting cchook initialization...',
    'setup.init.config': '📝 Initializing configuration files...',
    'setup.init.complete': 'Configuration files initialized successfully',
    'setup.install.hooks': '🔗 Installing hooks to Claude Code...',
    'setup.install.complete': 'Claude Code hooks installed successfully',
    'setup.backup.info': 'Original configuration backed up to: {0}',
    'setup.install.failed': 'Claude Code hooks installation failed:',
    'setup.verify': '🔍 Verifying installation...',
    'setup.verify.success': '✅ Installation verification passed',
    'setup.ready': 'cchook is ready! You can now receive Claude Code notifications.',
    'setup.next.steps': 'Next steps:',
    'setup.next.tui': '• Run `cchook` to start TUI management interface',
    'setup.next.test': '• Run `cchook test` to test notification functionality',
    'setup.next.silent': '• Run `cchook mode silent` to switch to silent mode',
    'setup.verify.failed': '⚠️  Installation verification failed:',
    'setup.check.config': 'Please check if Claude Code configuration is correct',
    'setup.error': '❌ Error during installation:',
    'setup.success': '✅ Claude Code hooks configured successfully',
    'setup.failed': '❌ Configuration failed: {0}',
    'setup.verification.failed': '❌ Installation verification failed: {0}',

    // Events command
    'events.description': 'Manage event notifications',
    'events.add.description': 'Enable event notification',
    'events.remove.description': 'Disable event notification',
    'events.list.description': 'List all available events',
    'events.test.description': 'Test event notification',
    'events.title': '📋 Event Management',
    'events.enabled.count': '{0} events enabled',
    'events.available.title': 'Available Events:',
    'events.enabled.title': 'Enabled Events:',
    'events.none.enabled': '  None',
    'events.already.enabled': 'Event {0} is already enabled',
    'events.enabled': '✅ Event enabled: {0}',
    'events.not.enabled': 'Event {0} is not enabled',
    'events.disabled': '🔕 Event disabled: {0}',
    'events.list.failed': 'Failed to get event list:',
    'events.add.failed': 'Failed to enable event:',
    'events.remove.failed': 'Failed to disable event:',
    'events.invalid': 'Invalid event name: {0}',
    'events.valid.list': 'Valid events: {0}',
    'events.test.success': '✅ Event {0} test successful',
    'events.test.failed': '❌ Event {0} test failed: {1}',
    
    // Event descriptions
    'event.description.Notification': 'System notifications sent by Claude Code',
    'event.description.Stop': 'Notification when Claude completes main tasks',
    'event.description.SubagentStop': 'Notification when subtasks or subagents complete',
    'event.description.UserPromptSubmit': 'Notification when user submits new prompts',
    'event.description.PreToolUse': 'Notification before tool execution (e.g., Bash, Write)',
    'event.description.PostToolUse': 'Notification after tool execution',
    'event.description.PreCompact': 'Notification before context compression',
    'event.description.SessionStart': 'Notification when session starts',
    'event.description.SessionEnd': 'Notification when session ends',
    'event.description.unknown': 'Unknown event',

    // Test command
    'test.description': 'Test notification functionality',
    'test.all': 'Test all notification types',
    'test.type': 'Specify notification type to test',

    // Logs command
    'logs.description': 'View hook call logs',
    'logs.number': 'Show last N lines of logs',
    'logs.follow': 'Follow logs in real-time',
    'logs.file.location': 'Log file: {0}',
    'logs.no.file': 'Log file does not exist. Hook may not have been called yet.',
    'logs.show.last': 'Show last {0} lines of logs:',
    'logs.follow.info': 'Following logs... (Press Ctrl+C to exit)',
    'logs.read.failed': 'Failed to read logs: {0}',

    // Notifications
    'notification.test.title': 'cchook Test',
    'notification.test.message': 'This is a test notification',
    'notification.test.subtitle.osascript': 'If you see this message, notification system is working properly',
    'notification.test.subtitle.console': 'Console notification system is working properly',
    'notification.claude.title': 'Claude Code Notification',
    'notification.claude.subtitle': 'Attention Required',
    'notification.message.received': 'Notification received',
    'notification.task.completed': 'Task completed',
    'notification.claude.stopped': 'Claude has stopped working',
    'notification.subtask.completed': 'Subtask completed',
    'notification.subagent.completed': 'Subagent completed work',
    'notification.prompt.submitted': 'New prompt submitted',
    'notification.tool.about.to.execute': 'About to execute {0}',
    'notification.tool.executing': 'Tool about to execute',
    'notification.tool.executed.success': '{0} executed successfully',
    'notification.tool.executed.failed': '{0} execution failed',
    'notification.tool.execution.completed': 'Tool execution completed',
    'notification.tool.execution.error': 'Error occurred during execution',
    'notification.compress.auto': 'About to perform automatic compression',
    'notification.compress.manual': 'About to perform manual compression',
    'notification.compress.subtitle': 'Context about to be compressed',
    'notification.session.started': 'Session started',
    'notification.session.start.source': 'Started by: {0}',
    'notification.session.ended': 'Session ended',
    'notification.session.end.reason': 'Reason: {0}',

    // Logger messages
    'logger.unsupported.notification': 'Unsupported notification type: {0}, using console notification',
    'logger.notifier.creation.failed': 'Failed to create {0} notifier:',
    'logger.fallback.console': 'Falling back to console notification',
    'logger.test.success': '{0} notifier test successful',
    'logger.test.failed': '{0} notifier test failed:',
    'logger.test.error': '{0} notifier test error:',
    'logger.macos.priority': 'Using osascript on macOS for better experience',
    'logger.detection.title': 'Detecting Notification Features',
    'logger.detection.message': 'Detecting best notification method...',
    'logger.osascript.detected': 'osascript support detected',
    'logger.osascript.unavailable': 'osascript unavailable:',
    'logger.console.fallback': 'Using console notification as default',

    // Common
    'common.error': 'Error',
    'common.warning': 'Warning',
    'common.success': 'Success',
    'common.info': 'Info'
  }
};

class I18n {
  constructor() {
    this.currentLocale = this.detectLocale();
  }

  detectLocale() {
    // 优先检查环境变量
    const envLang = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES;
    if (envLang) {
      if (envLang.includes('zh')) {
        return 'zh-CN';
      }
      if (envLang.includes('en')) {
        return 'en-US';
      }
    }

    // 检查系统语言设置
    try {
      const locale = os.platform() === 'darwin' 
        ? this.getMacOSLocale() 
        : this.getSystemLocale();
      
      if (locale.includes('zh') || locale.includes('cn')) {
        return 'zh-CN';
      }
      if (locale.includes('en') || locale.includes('us')) {
        return 'en-US';
      }
    } catch (error) {
      // 忽略错误，使用默认语言
    }

    // 默认使用英语
    return 'en-US';
  }

  getMacOSLocale() {
    try {
      const { execSync } = require('child_process');
      const result = execSync('defaults read -g AppleLocale', { encoding: 'utf8' });
      return result.trim();
    } catch (error) {
      return 'en-US';
    }
  }

  getSystemLocale() {
    return process.env.LANG || 'en-US';
  }

  setLocale(locale) {
    if (messages[locale]) {
      this.currentLocale = locale;
      return true;
    }
    return false;
  }

  getLocale() {
    return this.currentLocale;
  }

  t(key, ...args) {
    const message = messages[this.currentLocale]?.[key] || messages['en-US']?.[key] || key;
    
    // 简单的参数替换
    if (args.length > 0) {
      return message.replace(/\{(\d+)\}/g, (match, index) => {
        return args[parseInt(index)] !== undefined ? args[parseInt(index)] : match;
      });
    }
    
    return message;
  }

  // 获取支持的语言列表
  getSupportedLocales() {
    return Object.keys(messages);
  }

  // 检查是否为中文环境
  isChinese() {
    return this.currentLocale.startsWith('zh');
  }

  // 检查是否为英文环境
  isEnglish() {
    return this.currentLocale.startsWith('en');
  }
}

// 创建全局实例
const i18n = new I18n();

export default i18n;
export { I18n };