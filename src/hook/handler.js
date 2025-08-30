import { ConfigManager } from '../config/manager.js';
import { NotificationFactory } from '../notifications/factory.js';
import { Logger } from '../utils/logger.js';

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
        result = { success: false, error: '缺少事件名称' };
        Logger.error('缺少 hook_event_name 字段');
        await Logger.hookLog(eventName || 'UNKNOWN', hookData, result);
        return result;
      }

      // 检查事件是否启用
      if (!this.configManager.isEventEnabled(eventName)) {
        result = { success: true, skipped: true };
        Logger.debug(`事件 ${eventName} 未启用或处于静音模式`);
        await Logger.hookLog(eventName, hookData, result);
        return result;
      }

      // 获取通知配置
      const notificationConfig = this.configManager.getNotificationConfig();
      const notifier = NotificationFactory.create(notificationConfig.type, notificationConfig);

      // 根据事件类型处理
      result = await this.handleEventType(eventName, hookData, notifier);
      
      Logger.debug(`事件 ${eventName} 处理完成:`, result);
      await Logger.hookLog(eventName, hookData, result);
      return result;

    } catch (error) {
      result = { success: false, error: error.message };
      Logger.error('处理 hook 事件失败:', error);
      await Logger.hookLog(hookData?.hook_event_name || 'UNKNOWN', hookData, result);
      return result;
    }
  }

  async handleEventType(eventName, hookData, notifier) {
    switch (eventName) {
      case 'Notification':
        return this.handleNotification(hookData, notifier);
      
      case 'Stop':
        return this.handleStop(hookData, notifier);
      
      case 'SubagentStop':
        return this.handleSubagentStop(hookData, notifier);
      
      case 'UserPromptSubmit':
        return this.handleUserPromptSubmit(hookData, notifier);
      
      case 'PreToolUse':
        return this.handlePreToolUse(hookData, notifier);
      
      case 'PostToolUse':
        return this.handlePostToolUse(hookData, notifier);
      
      case 'PreCompact':
        return this.handlePreCompact(hookData, notifier);
      
      case 'SessionStart':
        return this.handleSessionStart(hookData, notifier);
      
      case 'SessionEnd':
        return this.handleSessionEnd(hookData, notifier);
      
      default:
        Logger.warning(`未知的事件类型: ${eventName}`);
        return { success: false, error: `未知的事件类型: ${eventName}` };
    }
  }

  async handleNotification(hookData, notifier) {
    const { message } = hookData;
    
    await notifier.notify({
      title: 'Claude Code 通知',
      message: message || '收到通知',
      subtitle: '需要注意'
    });

    return { success: true, eventType: 'Notification' };
  }

  async handleStop(hookData, notifier) {
    await notifier.notify({
      title: 'Claude Code',
      message: '任务已完成',
      subtitle: 'Claude 已停止工作'
    });

    return { success: true, eventType: 'Stop' };
  }

  async handleSubagentStop(hookData, notifier) {
    await notifier.notify({
      title: 'Claude Code',
      message: '子任务已完成',
      subtitle: '子代理已完成工作'
    });

    return { success: true, eventType: 'SubagentStop' };
  }

  async handleUserPromptSubmit(hookData, notifier) {
    const { prompt } = hookData;
    
    await notifier.notify({
      title: 'Claude Code',
      message: '新的提示已提交',
      subtitle: prompt?.substring(0, 50) + (prompt?.length > 50 ? '...' : '')
    });

    return { success: true, eventType: 'UserPromptSubmit' };
  }

  async handlePreToolUse(hookData, notifier) {
    const { tool_name: toolName, tool_input: toolInput } = hookData;
    
    // 对于重要的工具调用进行通知
    const importantTools = ['Bash', 'Write', 'Edit', 'MultiEdit'];
    
    if (importantTools.includes(toolName)) {
      let message = `即将执行 ${toolName}`;
      
      if (toolName === 'Bash' && toolInput?.command) {
        message += `: ${toolInput.command.substring(0, 30)}${toolInput.command.length > 30 ? '...' : ''}`;
      } else if ((toolName === 'Write' || toolName === 'Edit') && toolInput?.file_path) {
        message += `: ${toolInput.file_path}`;
      }

      await notifier.notify({
        title: 'Claude Code',
        message,
        subtitle: '工具即将执行'
      });
    }

    return { success: true, eventType: 'PreToolUse' };
  }

  async handlePostToolUse(hookData, notifier) {
    const { tool_name: toolName, tool_response: toolResponse } = hookData;
    
    // 对于重要的工具调用结果进行通知
    const importantTools = ['Bash', 'Write', 'Edit', 'MultiEdit'];
    
    if (importantTools.includes(toolName)) {
      const success = toolResponse?.success !== false;
      
      await notifier.notify({
        title: 'Claude Code',
        message: `${toolName} 执行${success ? '成功' : '失败'}`,
        subtitle: success ? '工具执行完成' : '执行过程中出现错误'
      });
    }

    return { success: true, eventType: 'PostToolUse' };
  }

  async handlePreCompact(hookData, notifier) {
    const { trigger } = hookData;
    
    await notifier.notify({
      title: 'Claude Code',
      message: `即将进行${trigger === 'auto' ? '自动' : '手动'}压缩`,
      subtitle: '上下文即将被压缩'
    });

    return { success: true, eventType: 'PreCompact' };
  }

  async handleSessionStart(hookData, notifier) {
    const { source } = hookData;
    
    await notifier.notify({
      title: 'Claude Code',
      message: '会话已开始',
      subtitle: `启动方式: ${source}`
    });

    return { success: true, eventType: 'SessionStart' };
  }

  async handleSessionEnd(hookData, notifier) {
    const { reason } = hookData;
    
    await notifier.notify({
      title: 'Claude Code',
      message: '会话已结束',
      subtitle: `结束原因: ${reason}`
    });

    return { success: true, eventType: 'SessionEnd' };
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