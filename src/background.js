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

// 处理来自 content script 的 API 请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background: received message from content script:', request);
  
  if (request.action === 'callDoubaoAPI') {
    handleDoubaoAPIRequest(request.data, sendResponse);
    return true; // 保持消息通道开放，等待异步响应
  }
});

// 处理豆包 v3 Chat Completions API 请求
async function handleDoubaoAPIRequest(data, sendResponse) {
  try {
    console.log('background: calling Doubao v3 API with data:', data);
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: data.model || 'doubao-seed-1.6-flash',
        messages: [
          {
            role: 'user',
            content: data.message
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    console.log('background: response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('background: API request failed:', response.status, errorText);
      sendResponse({
        success: false,
        error: `API request failed: ${response.status} - ${errorText}`
      });
      return;
    }

    const responseData = await response.json();
    console.log('background: API response received:', responseData);
    
    const content = responseData.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    sendResponse({
      success: true,
      content: content
    });
    
  } catch (error) {
    console.error('background: error calling Doubao API:', error);
    sendResponse({
      success: false,
      error: error.message || 'Network error occurred'
    });
  }
} 