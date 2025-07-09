// 处理插件图标点击
chrome.action.onClicked.addListener((tab) => {
  // 向当前标签页发送消息
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' })
})

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Chat Extension installed')
}) 