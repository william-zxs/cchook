import { ConfigManager } from '../../config/manager.js';
import { ConfigValidator } from '../../config/validator.js';
import { Logger } from '../../utils/logger.js';
import { program as commanderProgram } from 'commander';

export function eventsCommand(program) {
  const eventsCmd = program
    .command('events')
    .description('管理事件通知');

  eventsCmd
    .command('list')
    .description('列出所有可用事件及其状态')
    .action(listAction);

  eventsCmd
    .command('add <event>')
    .description('启用指定事件的通知')
    .action(addAction);

  eventsCmd
    .command('remove <event>')
    .description('禁用指定事件的通知')
    .action(removeAction);
}

async function listAction() {
  try {
    const configManager = new ConfigManager();
    await configManager.loadConfig();
    const config = configManager.getConfig();

    Logger.info('📋 Claude Code Hook 事件列表:');
    console.log('');

    ConfigValidator.VALID_EVENTS.forEach(event => {
      const isEnabled = config.enabledEvents.includes(event);
      const status = isEnabled ? '✅ 已启用' : '❌ 已禁用';
      const description = getEventDescription(event);
      
      console.log(`${status} ${event}`);
      console.log(`    ${description}`);
      console.log('');
    });

    const enabledCount = config.enabledEvents.length;
    const totalCount = ConfigValidator.VALID_EVENTS.length;
    
    Logger.info(`总计: ${enabledCount}/${totalCount} 个事件已启用`);
    
    if (config.mode === 'silent') {
      Logger.warning('⚠️  当前为静音模式，所有通知被禁用');
    }

  } catch (error) {
    Logger.error('获取事件列表失败:', error.message);
    process.exit(1);
  }
}

async function addAction(eventName) {
  try {
    if (!ConfigValidator.VALID_EVENTS.includes(eventName)) {
      Logger.error(`无效的事件名称: ${eventName}`);
      Logger.info(`有效事件: ${ConfigValidator.VALID_EVENTS.join(', ')}`);
      process.exit(1);
    }

    const configManager = new ConfigManager();
    await configManager.loadConfig();
    
    const config = configManager.getConfig();
    if (config.enabledEvents.includes(eventName)) {
      Logger.info(`事件 ${eventName} 已经启用`);
      return;
    }

    await configManager.addEvent(eventName);
    Logger.success(`🔔 已启用事件: ${eventName}`);
    Logger.info(getEventDescription(eventName));

  } catch (error) {
    Logger.error('启用事件失败:', error.message);
    process.exit(1);
  }
}

async function removeAction(eventName) {
  try {
    if (!ConfigValidator.VALID_EVENTS.includes(eventName)) {
      Logger.error(`无效的事件名称: ${eventName}`);
      Logger.info(`有效事件: ${ConfigValidator.VALID_EVENTS.join(', ')}`);
      process.exit(1);
    }

    const configManager = new ConfigManager();
    await configManager.loadConfig();
    
    const config = configManager.getConfig();
    if (!config.enabledEvents.includes(eventName)) {
      Logger.info(`事件 ${eventName} 已经禁用`);
      return;
    }

    await configManager.removeEvent(eventName);
    Logger.success(`🔕 已禁用事件: ${eventName}`);

  } catch (error) {
    Logger.error('禁用事件失败:', error.message);
    process.exit(1);
  }
}

function getEventDescription(eventName) {
  const descriptions = {
    'Notification': 'Claude Code 发送的系统通知',
    'Stop': 'Claude 完成主要任务时的通知',
    'SubagentStop': '子任务或子代理完成时的通知',
    'UserPromptSubmit': '用户提交新提示时的通知',
    'PreToolUse': '工具执行前的通知（如 Bash、Write 等）',
    'PostToolUse': '工具执行后的通知',
    'PreCompact': '上下文压缩前的通知',
    'SessionStart': '会话开始时的通知',
    'SessionEnd': '会话结束时的通知'
  };
  
  return descriptions[eventName] || '未知事件';
}