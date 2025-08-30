import React from 'react';
import { Box, Text } from 'ink';

export function TestView() {
  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: 'blue', bold: true }, '🧪 测试功能'),
    React.createElement(Text, { color: 'gray' }, '测试功能开发中...')
  );
}