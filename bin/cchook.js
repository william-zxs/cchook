#!/usr/bin/env node

import { program } from 'commander';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入命令注册器
import { commandRegistry } from '../src/cli/command-registry.js';
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

// 注册所有命令
commandRegistry.registerAllCommands(program);

// 解析命令行参数
program.parse();