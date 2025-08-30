#!/usr/bin/env node

import { program } from 'commander';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入命令模块
import { setupCommand } from '../src/cli/commands/setup.js';
import { modeCommand } from '../src/cli/commands/mode.js';
import { eventsCommand } from '../src/cli/commands/events.js';
import { statusCommand } from '../src/cli/commands/status.js';
import { testCommand } from '../src/cli/commands/test.js';
import { logsCommand } from '../src/cli/commands/logs.js';
import { handleHookInput } from '../src/hook/handler.js';

const { version } = require('../package.json');

program
  .name('cchook')
  .description('Claude Code hook management tool')
  .version(version);

// 如果没有参数且 stdin 有数据，则处理 hook 输入
if (process.argv.length === 2 && !process.stdin.isTTY) {
  await handleHookInput();
  process.exit(0);
}

// 注册命令
setupCommand(program);
modeCommand(program);
eventsCommand(program);
statusCommand(program);
testCommand(program);
logsCommand(program);

// 解析命令行参数
program.parse();