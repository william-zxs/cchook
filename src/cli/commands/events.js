import { ConfigManager } from '../../config/manager.js';
import { ConfigValidator } from '../../config/validator.js';
import { Logger } from '../../utils/logger.js';
import i18n from '../../utils/i18n.js';
import { program as commanderProgram } from 'commander';

export function eventsSubcommand(configCmd) {
  const eventsCmd = configCmd
    .command('events')
    .description(i18n.t('events.description'));

  eventsCmd
    .command('list')
    .description(i18n.t('events.list.description'))
    .action(listAction);

  eventsCmd
    .command('add <event>')
    .description(i18n.t('events.add.description'))
    .action(addAction);

  eventsCmd
    .command('remove <event>')
    .description(i18n.t('events.remove.description'))
    .action(removeAction);
}

async function listAction() {
  try {
    const configManager = new ConfigManager();
    await configManager.loadConfig();
    const config = configManager.getConfig();

    Logger.info(i18n.t('events.title'));
    console.log('');

    ConfigValidator.VALID_EVENTS.forEach(event => {
      const isEnabled = config.enabledEvents.includes(event);
      const status = isEnabled ? i18n.t('events.enabled') : i18n.t('events.disabled');
      const description = getEventDescription(event);
      
      console.log(`${status} ${event}`);
      console.log(`    ${description}`);
      console.log('');
    });

    const enabledCount = config.enabledEvents.length;
    const totalCount = ConfigValidator.VALID_EVENTS.length;
    
    Logger.info(i18n.t('events.enabled.count', enabledCount, totalCount));
    
    if (config.mode === 'silent') {
      Logger.warning(i18n.t('mode.notification.disabled'));
    }

  } catch (error) {
    Logger.error(i18n.t('events.list.failed'), error.message);
    process.exit(1);
  }
}

async function addAction(eventName) {
  try {
    if (!ConfigValidator.VALID_EVENTS.includes(eventName)) {
      Logger.error(i18n.t('events.invalid', eventName));
      Logger.info(i18n.t('events.valid.list', ConfigValidator.VALID_EVENTS.join(', ')));
      process.exit(1);
    }

    const configManager = new ConfigManager();
    await configManager.loadConfig();
    
    const config = configManager.getConfig();
    if (config.enabledEvents.includes(eventName)) {
      Logger.info(i18n.t('events.already.enabled', eventName));
      return;
    }

    await configManager.addEvent(eventName);
    Logger.success(i18n.t('events.enabled', eventName));
    Logger.info(getEventDescription(eventName));

  } catch (error) {
    Logger.error(i18n.t('events.add.failed'), error.message);
    process.exit(1);
  }
}

async function removeAction(eventName) {
  try {
    if (!ConfigValidator.VALID_EVENTS.includes(eventName)) {
      Logger.error(i18n.t('events.invalid', eventName));
      Logger.info(i18n.t('events.valid.list', ConfigValidator.VALID_EVENTS.join(', ')));
      process.exit(1);
    }

    const configManager = new ConfigManager();
    await configManager.loadConfig();
    
    const config = configManager.getConfig();
    if (!config.enabledEvents.includes(eventName)) {
      Logger.info(i18n.t('events.not.enabled', eventName));
      return;
    }

    await configManager.removeEvent(eventName);
    Logger.success(i18n.t('events.disabled', eventName));

  } catch (error) {
    Logger.error(i18n.t('events.remove.failed'), error.message);
    process.exit(1);
  }
}

function getEventDescription(eventName) {
  return i18n.t(`event.description.${eventName}`, i18n.t('event.description.unknown'));
}