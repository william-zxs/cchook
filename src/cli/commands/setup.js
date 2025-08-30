import { ConfigManager } from '../../config/manager.js';
import { HookInstaller } from '../../hook/installer.js';
import { Logger } from '../../utils/logger.js';

export function setupCommand(program) {
  program
    .command('setup')
    .description('初始化配置并安装 hooks 到 Claude Code')
    .option('-f, --force', '强制重新安装，覆盖现有配置')
    .action(async (options) => {
      Logger.info('🚀 开始初始化 cchook...');
      
      try {
        // 1. 初始化配置
        Logger.info('📝 初始化配置文件...');
        const configManager = new ConfigManager();
        await configManager.loadConfig();
        Logger.success('配置文件初始化完成');

        // 2. 安装 hooks 到 Claude Code
        Logger.info('🔗 安装 hooks 到 Claude Code...');
        const installer = new HookInstaller();
        const result = await installer.install(options.force);
        
        if (result.success) {
          Logger.success('Claude Code hooks 安装完成');
          if (result.backupPath) {
            Logger.info(`原配置已备份到: ${result.backupPath}`);
          }
        } else {
          Logger.error('Claude Code hooks 安装失败:', result.error);
          process.exit(1);
        }

        // 3. 验证安装
        Logger.info('🔍 验证安装...');
        const verification = await installer.verify();
        
        if (verification.success) {
          Logger.success('✅ 安装验证通过');
          Logger.info('cchook 已就绪！现在可以接收 Claude Code 的通知了。');
          
          // 显示下一步操作提示
          console.log('\n下一步操作:');
          console.log('• 运行 `cchook` 启动 TUI 管理界面');
          console.log('• 运行 `cchook test` 测试通知功能');
          console.log('• 运行 `cchook mode silent` 切换到静音模式');
          
        } else {
          Logger.warning('⚠️  安装验证失败:', verification.error);
          Logger.info('请检查 Claude Code 配置文件是否正确');
        }

      } catch (error) {
        Logger.error('❌ 安装过程中发生错误:', error.message);
        process.exit(1);
      }
    });
}