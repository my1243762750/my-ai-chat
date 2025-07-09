// 处理插件图标点击
chrome.action.onClicked.addListener((tab) => {
  console.log('background: icon clicked, sending toggleSidebar to tab', tab.id);
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' })
})

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Chat Extension installed')
})

// 作为popup消息中转
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleSidebar') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        console.log('background: relaying toggleSidebar to tab', tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleSidebar' })
      }
    })
  }
}) 