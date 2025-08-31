import { ConfigManager } from '../config/manager.js';
import { NotificationFactory } from '../notifications/factory.js';
import { Logger } from '../utils/logger.js';
import i18n from '../utils/i18n.js';

export class HookHandler {
  constructor() {
    this.configManager = new ConfigManager();
  }

  async processHookEvent(hookData) {
    let result;
    try {
      // 加载配置
      await this.configManager.loadConfig();
      
      const { hook_event_name: eventName } = hookData;
      
      if (!eventName) {
        result = { success: false, error: 'Missing event name' };
        Logger.error('Missing hook_event_name field');
        await Logger.hookLog(eventName || 'UNKNOWN', hookData, result);
        return result;
      }

      // 检查事件是否启用
      if (!this.configManager.isEventEnabled(eventName)) {
        result = { success: true, skipped: true };
        Logger.debug(`Event ${eventName} not enabled or in silent mode`);
        await Logger.hookLog(eventName, hookData, result);
        return result;
      }

      // 获取通知配置
      const notificationConfig = this.configManager.getNotificationConfig();
      const defaultTypes = this.configManager.getDefaultNotificationTypes();
      
      // 创建多个通知器
      const notifiers = [];
      for (const type of defaultTypes) {
        try {
          const notifier = NotificationFactory.create(type, notificationConfig);
          notifiers.push({ type, notifier });
        } catch (error) {
          Logger.error(`创建 ${type} 通知器失败:`, error);
        }
      }
      
      if (notifiers.length === 0) {
        throw new Error('没有可用的通知器');
      }

      // 根据事件类型处理
      result = await this.handleEventType(eventName, hookData, notifiers);
      
      Logger.debug(`Event ${eventName} processing completed:`, result);
      await Logger.hookLog(eventName, hookData, result);
      return result;

    } catch (error) {
      result = { success: false, error: error.message };
      Logger.error('Failed to process hook event:', error);
      await Logger.hookLog(hookData?.hook_event_name || 'UNKNOWN', hookData, result);
      return result;
    }
  }

  async sendToAllNotifiers(notifiers, options) {
    const results = [];
    
    for (const { type, notifier } of notifiers) {
      try {
        const result = await notifier.notify(options);
        results.push({ type, ...result });
        if (result.success) {
          Logger.debug(`通知发送成功 (${type})`);
        } else {
          Logger.warning(`通知发送失败 (${type}):`, result.error);
        }
      } catch (error) {
        Logger.error(`通知发送异常 (${type}):`, error);
        results.push({ type, success: false, error: error.message });
      }
    }
    
    // 只要有一个成功就认为整体成功
    const hasSuccess = results.some(r => r.success);
    return { success: hasSuccess, results };
  }

  async handleEventType(eventName, hookData, notifiers) {
    switch (eventName) {
      case 'Notification':
        return this.handleNotification(hookData, notifiers);
      
      case 'Stop':
        return this.handleStop(hookData, notifiers);
      
      case 'SubagentStop':
        return this.handleSubagentStop(hookData, notifiers);
      
      case 'UserPromptSubmit':
        return this.handleUserPromptSubmit(hookData, notifiers);
      
      case 'PreToolUse':
        return this.handlePreToolUse(hookData, notifiers);
      
      case 'PostToolUse':
        return this.handlePostToolUse(hookData, notifiers);
      
      case 'PreCompact':
        return this.handlePreCompact(hookData, notifiers);
      
      case 'SessionStart':
        return this.handleSessionStart(hookData, notifiers);
      
      case 'SessionEnd':
        return this.handleSessionEnd(hookData, notifiers);
      
      default:
        Logger.warning(`Unknown event type: ${eventName}`);
        return { success: false, error: `Unknown event type: ${eventName}` };
    }
  }

  async handleNotification(hookData, notifiers) {
    const { message } = hookData;
    
    const result = await this.sendToAllNotifiers(notifiers, {
      title: i18n.t('notification.claude.title'),
      message: message || i18n.t('notification.message.received'),
      subtitle: i18n.t('notification.claude.subtitle')
    });

    return { ...result, eventType: 'Notification' };
  }

  async handleStop(hookData, notifiers) {
    const result = await this.sendToAllNotifiers(notifiers, {
      title: 'Claude Code',
      message: i18n.t('notification.task.completed'),
      subtitle: i18n.t('notification.claude.stopped')
    });

    return { ...result, eventType: 'Stop' };
  }

  async handleSubagentStop(hookData, notifiers) {
    const result = await this.sendToAllNotifiers(notifiers, {
      title: 'Claude Code',
      message: i18n.t('notification.subtask.completed'),
      subtitle: i18n.t('notification.subagent.completed')
    });

    return { ...result, eventType: 'SubagentStop' };
  }

  async handleUserPromptSubmit(hookData, notifiers) {
    const { prompt } = hookData;
    
    const result = await this.sendToAllNotifiers(notifiers, {
      title: 'Claude Code',
      message: i18n.t('notification.prompt.submitted'),
      subtitle: prompt?.substring(0, 50) + (prompt?.length > 50 ? '...' : '')
    });

    return { ...result, eventType: 'UserPromptSubmit' };
  }

  async handlePreToolUse(hookData, notifiers) {
    const { tool_name: toolName, tool_input: toolInput } = hookData;
    
    // 对于重要的工具调用进行通知
    const importantTools = ['Bash', 'Write', 'Edit', 'MultiEdit'];
    
    if (importantTools.includes(toolName)) {
      let message = i18n.t('notification.tool.about.to.execute', toolName);
      
      if (toolName === 'Bash' && toolInput?.command) {
        message += `: ${toolInput.command.substring(0, 30)}${toolInput.command.length > 30 ? '...' : ''}`;
      } else if ((toolName === 'Write' || toolName === 'Edit') && toolInput?.file_path) {
        message += `: ${toolInput.file_path}`;
      }

      const result = await this.sendToAllNotifiers(notifiers, {
        title: 'Claude Code',
        message,
        subtitle: i18n.t('notification.tool.executing')
      });
      
      return { ...result, eventType: 'PreToolUse' };
    }

    return { success: true, eventType: 'PreToolUse' };
  }

  async handlePostToolUse(hookData, notifiers) {
    const { tool_name: toolName, tool_response: toolResponse } = hookData;
    
    // 对于重要的工具调用结果进行通知
    const importantTools = ['Bash', 'Write', 'Edit', 'MultiEdit'];
    
    if (importantTools.includes(toolName)) {
      const success = toolResponse?.success !== false;
      
      const result = await this.sendToAllNotifiers(notifiers, {
        title: 'Claude Code',
        message: success ? i18n.t('notification.tool.executed.success', toolName) : i18n.t('notification.tool.executed.failed', toolName),
        subtitle: success ? i18n.t('notification.tool.execution.completed') : i18n.t('notification.tool.execution.error')
      });
      
      return { ...result, eventType: 'PostToolUse' };
    }

    return { success: true, eventType: 'PostToolUse' };
  }

  async handlePreCompact(hookData, notifiers) {
    const { trigger } = hookData;
    
    const result = await this.sendToAllNotifiers(notifiers, {
      title: 'Claude Code',
      message: trigger === 'auto' ? i18n.t('notification.compress.auto') : i18n.t('notification.compress.manual'),
      subtitle: i18n.t('notification.compress.subtitle')
    });

    return { ...result, eventType: 'PreCompact' };
  }

  async handleSessionStart(hookData, notifiers) {
    const { source } = hookData;
    
    const result = await this.sendToAllNotifiers(notifiers, {
      title: 'Claude Code',
      message: i18n.t('notification.session.started'),
      subtitle: i18n.t('notification.session.start.source', source)
    });

    return { ...result, eventType: 'SessionStart' };
  }

  async handleSessionEnd(hookData, notifiers) {
    const { reason } = hookData;
    
    const result = await this.sendToAllNotifiers(notifiers, {
      title: 'Claude Code',
      message: i18n.t('notification.session.ended'),
      subtitle: i18n.t('notification.session.end.reason', reason)
    });

    return { ...result, eventType: 'SessionEnd' };
  }
}

// 处理来自 stdin 的 hook 输入
export async function handleHookInput() {
  const handler = new HookHandler();
  
  try {
    // 读取 stdin
    let input = '';
    
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    
    if (!input.trim()) {
      Logger.error('没有接收到输入数据');
      process.exit(1);
    }

    // 解析 JSON
    let hookData;
    try {
      hookData = JSON.parse(input);
    } catch (error) {
      Logger.error('无效的 JSON 输入:', error);
      process.exit(1);
    }

    // 处理 hook 事件
    const result = await handler.processHookEvent(hookData);
    
    if (result.success) {
      if (result.skipped) {
        Logger.debug('事件已跳过');
      } else {
        Logger.debug('事件处理成功');
      }
      process.exit(0);
    } else {
      Logger.error('事件处理失败:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    Logger.error('处理输入时发生错误:', error);
    process.exit(1);
  }
}