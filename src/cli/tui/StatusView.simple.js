import React from 'react';
import { Box, Text } from 'ink';

export function StatusView() {
  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: 'blue', bold: true }, '📊 系统状态'),
    React.createElement(Text, { color: 'green' }, '✓ 系统运行正常'),
    React.createElement(Text, { color: 'gray' }, '工作模式: normal'),
    React.createElement(Text, { color: 'gray' }, '通知类型: console')
  );
}