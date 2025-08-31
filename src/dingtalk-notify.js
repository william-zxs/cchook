#!/usr/bin/env node

import { Command } from 'commander';
import { NotificationManager } from './notifiers/manager.js';

const program = new Command();

program
  .name('dingtalk-notify')
  .description('钉钉机器人通知系统，支持多种通知类型')
  .version('1.0.0');

program
  .requiredOption('--access_token <token>', '机器人webhook的access_token')
  .requiredOption('--secret <secret>', '机器人安全设置的加签secret')
  .option('--userid <ids>', '待@的钉钉用户ID，多个用逗号分隔')
  .option('--at_mobiles <mobiles>', '待@的手机号，多个用逗号分隔')
  .option('--is_at_all', '是否@所有人')
  .option('--msg <message>', '要发送的消息内容', '钉钉，让进步发生')
  .option('--types <types>', '通知类型，多个用逗号分隔 (dingtalk,macos)', 'dingtalk')
  .option('--title <title>', 'macOS 通知标题', '钉钉机器人通知')
  .option('--subtitle <subtitle>', 'macOS 通知副标题')
  .option('--sound', 'macOS 通知是否播放声音', false)
  .action(async (options) => {
    try {
      const manager = new NotificationManager();
      
      // 解析通知类型
      const types = options.types.split(',').map(type => type.trim());
      
      // 注册通知器
      if (types.includes('dingtalk')) {
        manager.registerDingTalk(options.access_token, options.secret);
      }
      
      if (types.includes('macos')) {
        const macosOptions = {
          title: options.title,
          subtitle: options.subtitle,
          sound: options.sound
        };
        manager.registerMacOS(macosOptions);
      }
      
      // 设置启用的通知类型
      manager.setEnabledTypes(types);
      
      // 处理钉钉特定选项
      const notifyOptions = {};
      
      if (options.userid) {
        notifyOptions.atUserIds = options.userid.split(',').map(id => id.trim()).filter(id => id);
      }
      
      if (options.at_mobiles) {
        notifyOptions.atMobiles = options.at_mobiles.split(',').map(mobile => mobile.trim()).filter(mobile => mobile);
      }
      
      if (options.is_at_all) {
        notifyOptions.isAtAll = true;
      }
      
      // 发送通知
      console.log(`正在发送通知到: ${types.join(', ')}`);
      console.log(`消息内容: ${options.msg}`);
      
      const results = await manager.sendToAll(options.msg, notifyOptions);
      
      // 显示结果
      results.forEach(result => {
        if (result.success) {
          console.log(`[SUCCESS] ${result.type} 通知发送成功`);
        } else {
          console.error(`[ERROR] ${result.type} 通知发送失败: ${result.error}`);
        }
      });
      
      // 检查是否有失败的通知
      const hasFailures = results.some(result => !result.success);
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('错误:', error.message);
      process.exit(1);
    }
  });

program.parse();