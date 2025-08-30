import React from 'react';
import { Box, Text } from 'ink';

export function HelpView() {
  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: 'blue', bold: true }, '❓ 帮助信息'),
    React.createElement(Text, { color: 'gray' }, '帮助文档开发中...')
  );
}