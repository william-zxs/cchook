import React from 'react';
import { Box, Text } from 'ink';

export function ConfigView() {
  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: 'blue', bold: true }, '⚙️ 配置管理'),
    React.createElement(Text, { color: 'gray' }, '配置功能开发中...')
  );
}