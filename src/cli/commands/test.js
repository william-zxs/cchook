// 此文件已弃用，测试功能已移动到 config test 命令
// 请使用 cchook config test 来测试当前配置
// 或使用 cchook config test --all 来测试所有通知类型

export function testCommand(program) {
  program
    .command('test')
    .description('此命令已弃用，请使用 cchook config test')
    .action(() => {
      console.log('test 命令已弃用，请使用:');
      console.log('  cchook config test      - 测试当前配置');
      console.log('  cchook config test --all - 测试所有通知类型');
      process.exit(1);
    });
}