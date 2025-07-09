chrome.action.onClicked.addListener(e=>{chrome.tabs.sendMessage(e.id,{action:"toggleSidebar"})});chrome.runtime.onInstalled.addListener(()=>{console.log("AI Chat Extension installed")});
