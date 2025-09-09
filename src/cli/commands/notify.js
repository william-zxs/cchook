// 此文件已弃用，通知功能已移除
// cchook 现在专注于 hook 管理功能

export function notifyCommand(program) {
  program
    .command('notify')
    .alias('n')
    .description('此命令已弃用，通知功能已移除')
    .action(() => {
      console.log('notify 命令已弃用，通知功能已从 cchook 中移除');
      console.log('cchook 现在专注于 Claude Code hook 管理功能');
      process.exit(1);
    });
}