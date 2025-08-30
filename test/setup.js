// Jest 测试环境设置

// 设置测试环境
process.env.NODE_ENV = 'test';
process.env.DEBUG = 'true';

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});