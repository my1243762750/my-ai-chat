// 处理插件图标点击 - 直接切换聊天框
chrome.action.onClicked.addListener((tab) => {
  console.log('background: icon clicked, sending toggleSidebar to tab', tab.id);
  
  // 检查是否是支持的页面
  if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('background: content script not ready, error:', chrome.runtime.lastError.message);
        // 可以在这里注入 content script 或显示提示
      } else {
        console.log('background: got response from content script', response);
      }
    });
  } else {
    console.log('background: unsupported page type:', tab.url);
  }
});

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Chat Extension installed');
}); 