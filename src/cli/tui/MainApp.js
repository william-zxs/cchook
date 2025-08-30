import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { ConfigView } from './ConfigView.simple.js';
import { StatusView } from './StatusView.simple.js';
import { TestView } from './TestView.simple.js';
import { HelpView } from './HelpView.simple.js';

const VIEWS = {
  STATUS: 'status',
  CONFIG: 'config',
  TEST: 'test',
  HELP: 'help'
};

const MENU_ITEMS = [
  { key: 's', label: '状态 (S)', view: VIEWS.STATUS },
  { key: 'c', label: '配置 (C)', view: VIEWS.CONFIG },
  { key: 't', label: '测试 (T)', view: VIEWS.TEST },
  { key: 'h', label: '帮助 (H)', view: VIEWS.HELP },
  { key: 'q', label: '退出 (Q)', view: 'quit' }
];

export default function MainApp() {
  const [currentView, setCurrentView] = useState(VIEWS.STATUS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟初始化
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      process.exit(0);
    }

    const menuItem = MENU_ITEMS.find(item => item.key === input.toLowerCase());
    if (menuItem) {
      if (menuItem.view === 'quit') {
        process.exit(0);
      } else {
        setCurrentView(menuItem.view);
      }
    }
  });

  if (isLoading) {
    return React.createElement(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 10 },
      React.createElement(Text, { color: "blue" }, "🚀 正在初始化 cchook...")
    );
  }

  return React.createElement(Box, { flexDirection: "column", minHeight: 20 },
    React.createElement(Box, { borderStyle: "round", borderColor: "blue", paddingX: 2, paddingY: 1 },
      React.createElement(Text, { color: "blue", bold: true },
        "📋 cchook - Claude Code Hook 管理工具"
      )
    ),
    React.createElement(Box, { marginY: 1 },
      React.createElement(Box, { flexDirection: "row", gap: 2 },
        MENU_ITEMS.map(item => 
          React.createElement(Text, {
            key: item.key,
            color: currentView === item.view ? "blue" : "gray",
            backgroundColor: currentView === item.view ? "white" : undefined
          }, item.label)
        )
      )
    ),
    React.createElement(Box, { flexGrow: 1, borderStyle: "single", borderColor: "gray", padding: 1 },
      currentView === VIEWS.STATUS && React.createElement(StatusView),
      currentView === VIEWS.CONFIG && React.createElement(ConfigView),
      currentView === VIEWS.TEST && React.createElement(TestView),
      currentView === VIEWS.HELP && React.createElement(HelpView)
    ),
    React.createElement(Box, { justifyContent: "center", paddingY: 1 },
      React.createElement(Text, { color: "gray", dimColor: true },
        "使用方向键导航，按 Q 键退出 | ESC 键也可退出"
      )
    )
  );
}