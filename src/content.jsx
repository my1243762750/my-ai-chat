import React from 'react'
import { createRoot } from 'react-dom/client'
import ChatSidebar from './components/ChatSidebar'
import chatSidebarCss from './components/ChatSidebar.css?raw'

console.log('AI Chat content script injected');

function createSidebar() {
  if (document.getElementById('ai-chat-sidebar')) return

  // 智能检测页面主要容器
  const mainContainer = findMainContainer()
  console.log('AI Chat: found main container:', mainContainer)

  const sidebar = document.createElement('div')
  sidebar.id = 'ai-chat-sidebar'
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    z-index: 2147483647;
    background: white;
    border-left: 1px solid #e0e0e0;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(0);
  `

  // Shadow DOM
  const shadow = sidebar.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = chatSidebarCss
  shadow.appendChild(style)
  const mount = document.createElement('div')
  shadow.appendChild(mount)

  // 调整页面布局（同原逻辑）
  if (mainContainer) {
    sidebar._originalContainerStyles = {
      width: mainContainer.style.width,
      maxWidth: mainContainer.style.maxWidth,
      marginRight: mainContainer.style.marginRight,
      transition: mainContainer.style.transition
    }
    mainContainer.style.width = 'calc(100% - 400px)'
    mainContainer.style.maxWidth = 'calc(100% - 400px)'
    mainContainer.style.marginRight = '0'
    mainContainer.style.transition = 'width 0.3s ease, max-width 0.3s ease'
    console.log('AI Chat: adjusted main container width')
  } else {
    const body = document.body
    sidebar._originalBodyMarginRight = body.style.marginRight
    body.style.marginRight = '400px'
    body.style.transition = 'margin-right 0.3s ease'
    console.log('AI Chat: using body margin fallback')
  }

  document.body.appendChild(sidebar)
  const root = createRoot(mount)
  root.render(React.createElement(ChatSidebar))

  requestAnimationFrame(() => {
    sidebar.style.right = '0'
  })
  console.log('AI Chat sidebar created');
}

// 智能检测页面主要容器
function findMainContainer() {
  // 常见的页面主容器选择器
  const selectors = [
    'main',
    '[role="main"]',
    '.main',
    '#main',
    '.content',
    '#content',
    '.container',
    '#container',
    '.wrapper',
    '#wrapper',
    '.page-content',
    '#page-content',
    '.app',
    '#app',
    '.root',
    '#root'
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
      console.log('AI Chat: found main container with selector:', selector)
      return element
    }
  }

  // 如果没有找到，尝试找到 body 下最大的子元素
  const bodyChildren = Array.from(document.body.children)
  if (bodyChildren.length > 0) {
    const largestChild = bodyChildren.reduce((largest, child) => {
      const area = child.offsetWidth * child.offsetHeight
      const largestArea = largest.offsetWidth * largest.offsetHeight
      return area > largestArea ? child : largest
    })

    if (largestChild.offsetWidth > 0 && largestChild.offsetHeight > 0) {
      console.log('AI Chat: using largest body child as main container')
      return largestChild
    }
  }

  console.log('AI Chat: no suitable main container found')
  return null
}
function removeSidebar() {
  const sidebar = document.getElementById('ai-chat-sidebar')
  if (sidebar) {
    // 触发关闭动画 - 滑出到右侧
    sidebar.style.right = '-400px'

    // 等待动画完成后移除元素
    setTimeout(() => {
      // 恢复主容器样式
      if (sidebar._originalContainerStyles) {
        const mainContainer = findMainContainer()
        if (mainContainer) {
          mainContainer.style.width = sidebar._originalContainerStyles.width || ''
          mainContainer.style.maxWidth = sidebar._originalContainerStyles.maxWidth || ''
          mainContainer.style.marginRight = sidebar._originalContainerStyles.marginRight || ''
          mainContainer.style.transition = sidebar._originalContainerStyles.transition || ''
          console.log('AI Chat: restored main container styles')
        }
      } else if (sidebar._originalBodyMarginRight !== undefined) {
        // 恢复 body margin
        const body = document.body
        body.style.marginRight = sidebar._originalBodyMarginRight || '0'
        console.log('AI Chat: restored body margin')
      }

      sidebar.remove()
      console.log('AI Chat sidebar removed');
    }, 300) // 等待动画完成
  }
}
function toggleSidebar() {
  const sidebar = document.getElementById('ai-chat-sidebar')
  if (sidebar) {
    removeSidebar()
  } else {
    createSidebar()
  }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('AI Chat content script received message:', request);
  if (request.action === 'toggleSidebar') {
    toggleSidebar()
    sendResponse({ success: true })
  }
}) 