import React from 'react'
import { createRoot } from 'react-dom/client'
import ChatSidebar from './components/ChatSidebar'

// 创建侧边栏容器
function createSidebar() {
  // 检查是否已存在侧边栏
  if (document.getElementById('ai-chat-sidebar')) {
    return
  }

  // 创建侧边栏容器
  const sidebar = document.createElement('div')
  sidebar.id = 'ai-chat-sidebar'
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    z-index: 2147483647;
    background: white;
    border-left: 1px solid #e0e0e0;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `

  // 调整原页面布局
  const body = document.body
  const originalMarginRight = body.style.marginRight
  body.style.marginRight = '400px'
  body.style.transition = 'margin-right 0.3s ease'

  // 添加侧边栏到页面
  document.body.appendChild(sidebar)

  // 渲染React组件
  const root = createRoot(sidebar)
  root.render(React.createElement(ChatSidebar))

  // 存储原始样式以便恢复
  sidebar._originalMarginRight = originalMarginRight
}

// 移除侧边栏
function removeSidebar() {
  const sidebar = document.getElementById('ai-chat-sidebar')
  if (sidebar) {
    const body = document.body
    body.style.marginRight = sidebar._originalMarginRight || '0'
    sidebar.remove()
  }
}

// 切换侧边栏显示状态
function toggleSidebar() {
  const sidebar = document.getElementById('ai-chat-sidebar')
  if (sidebar) {
    removeSidebar()
  } else {
    createSidebar()
  }
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleSidebar') {
    toggleSidebar()
    sendResponse({ success: true })
  }
})

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSidebar)
} else {
  createSidebar()
} 