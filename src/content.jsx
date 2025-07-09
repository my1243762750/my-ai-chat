import React from 'react'
import { createRoot } from 'react-dom/client'
import ChatSidebar from './components/ChatSidebar'
import './components/ChatSidebar.css'

console.log('AI Chat content script injected');

function createSidebar() {
  if (document.getElementById('ai-chat-sidebar')) return
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
  const body = document.body
  const originalMarginRight = body.style.marginRight
  body.style.marginRight = '400px'
  body.style.transition = 'margin-right 0.3s ease'
  document.body.appendChild(sidebar)
  const root = createRoot(sidebar)
  root.render(React.createElement(ChatSidebar))
  sidebar._originalMarginRight = originalMarginRight
  console.log('AI Chat sidebar created');
}
function removeSidebar() {
  const sidebar = document.getElementById('ai-chat-sidebar')
  if (sidebar) {
    const body = document.body
    body.style.marginRight = sidebar._originalMarginRight || '0'
    sidebar.remove()
    console.log('AI Chat sidebar removed');
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