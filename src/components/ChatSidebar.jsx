import React, { useState, useRef, useEffect } from 'react'

const ChatSidebar = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('doubao-seed-1-6-flash-250615')
  const [useCurrent, setUseCurrent] = useState(false)
  const messagesEndRef = useRef(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 从localStorage获取API key和模型名
  useEffect(() => {
    const savedApiKey = localStorage.getItem('ai-chat-api-key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
    const savedModel = localStorage.getItem('ai-chat-model')
    if (savedModel) {
      setModel(savedModel)
    }
  }, [])

  // 通过 background.js 调用豆包 API
  const callDoubaoAPI = async (message) => {
    if (!apiKey) {
      throw new Error('Please set your Volcengine API key')
    }
    if (!model) {
      throw new Error('Please set your model name')
    }
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'callDoubaoAPI',
        data: {
          apiKey: apiKey,
          model: model,
          message: message
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to background:', chrome.runtime.lastError);
          reject(new Error('Failed to communicate with background script'));
          return;
        }
        
        if (response && response.success) {
          resolve(response.content);
        } else {
          reject(new Error(response?.error || 'API request failed'));
        }
      });
    });
  }

  // 获取当前网页正文内容（通过content script）
  const getPageContent = () => {
    return new Promise((resolve) => {
      try {
        // 直接在content script里抓取正文
        let text = ''
        // 优先 main/role=main/常见容器
        const selectors = [
          'main', '[role="main"]', '.main', '#main', '.content', '#content', '.container', '#container', '.wrapper', '#wrapper', '.page-content', '#page-content', '.app', '#app', '.root', '#root'
        ]
        for (const sel of selectors) {
          const el = document.querySelector(sel)
          if (el && el.innerText && el.innerText.length > 100) {
            text = el.innerText
            break
          }
        }
        // fallback: body最大子元素
        if (!text) {
          let largest = null, maxArea = 0
          Array.from(document.body.children).forEach(child => {
            const area = child.offsetWidth * child.offsetHeight
            if (area > maxArea && child.innerText && child.innerText.length > 100) {
              largest = child; maxArea = area
            }
          })
          if (largest) text = largest.innerText
        }
        // fallback: 整个body
        if (!text) text = document.body.innerText
        // 截断过长内容
        if (text.length > 3000) text = text.slice(0, 3000) + '\n...(内容已截断)'
        resolve(text)
      } catch (e) {
        resolve('')
      }
    })
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    setIsLoading(true)
    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])
    try {
      let finalPrompt = userMessage
      if (useCurrent) {
        const pageContent = await getPageContent()
        finalPrompt = `这是当前网页的内容：\n${pageContent}\n用户问题：${userMessage}\n请基于网页内容回答。`
      }
      const response = await callDoubaoAPI(finalPrompt)
      setMessages(prev => [...prev, { type: 'assistant', content: response }])
    } catch (error) {
      console.error('Error calling API:', error)
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: error.message || 'Sorry, there was an error processing your request.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // 处理回车键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 设置API key
  const handleSetApiKey = () => {
    const newApiKey = prompt('Please enter your Volcengine API key:')
    if (newApiKey) {
      setApiKey(newApiKey)
      localStorage.setItem('ai-chat-api-key', newApiKey)
    }
  }
  // 设置模型名
  const handleSetModel = () => {
    const newModel = prompt('Please enter the model name (e.g. doubao-seed-1.6):', model)
    if (newModel) {
      setModel(newModel)
      localStorage.setItem('ai-chat-model', newModel)
    }
  }

  // 内联样式
  const styles = {
    chatSidebar: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f6f8fa',
      borderLeft: '1px solid #e0e0e0',
      boxShadow: '-4px 0 24px 0 rgba(0,0,0,0.10)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderTopRightRadius: '16px',
      borderBottomRightRadius: '16px',
      overflow: 'hidden'
    },
    chatHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 24px 12px 24px',
      background: '#fff',
      borderBottom: '1.5px solid #ececec',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    },
    headerTitle: {
      margin: 0,
      fontSize: '22px',
      fontWeight: 700,
      color: '#222',
      letterSpacing: '0.5px'
    },
    closeBtn: {
      background: '#f3f3f3',
      border: 'none',
      fontSize: '22px',
      color: '#888',
      cursor: 'pointer',
      borderRadius: '6px',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s, color 0.2s'
    },
    chatMessages: {
      flex: 1,
      overflowY: 'auto',
      padding: '24px 18px 12px 18px',
      background: '#f6f8fa',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    welcomeMessage: {
      color: '#888',
      textAlign: 'center',
      marginTop: '40px',
      fontSize: '15px'
    },
    message: {
      display: 'flex',
      marginBottom: 0
    },
    messageUser: {
      justifyContent: 'flex-end'
    },
    messageAssistant: {
      justifyContent: 'flex-start'
    },
    messageContent: {
      maxWidth: '80%',
      padding: '12px 16px',
      borderRadius: '16px',
      fontSize: '15px',
      lineHeight: 1.7,
      background: '#fff',
      color: '#222',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginBottom: '2px',
      wordBreak: 'break-word',
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '16px'
    },
    messageContentUser: {
      background: 'linear-gradient(90deg, #007bff 60%, #4f8cff 100%)',
      color: '#fff',
      borderBottomRightRadius: '4px',
      borderBottomLeftRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,123,255,0.08)'
    },
    messageContentAssistant: {
      background: '#f1f3f7',
      color: '#222',
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '16px'
    },
    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      height: '18px'
    },
    typingDot: {
      display: 'block',
      width: '6px',
      height: '6px',
      background: '#bbb',
      borderRadius: '50%',
      animation: 'typing-bounce 1s infinite alternate'
    },
    chatInputContainer: {
      padding: '16px 18px 18px 18px',
      background: '#fff',
      borderTop: '1.5px solid #ececec',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.03)'
    },
    inputWrapper: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '10px'
    },
    textarea: {
      flex: 1,
      minHeight: '38px',
      maxHeight: '90px',
      resize: 'none',
      border: '1.5px solid #d0d0d0',
      borderRadius: '8px',
      padding: '10px 12px',
      fontSize: '15px',
      background: '#f7f7fa',
      color: '#222',
      outline: 'none',
      transition: 'border 0.2s, box-shadow 0.2s',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    },
    sendBtn: {
      background: 'linear-gradient(90deg, #007bff 60%, #4f8cff 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '15px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background 0.2s, box-shadow 0.2s',
      boxShadow: '0 1px 2px rgba(0,123,255,0.08)'
    },
    sendBtnDisabled: {
      background: '#b3d1ff',
      cursor: 'not-allowed',
      color: '#f6f8fa'
    },
    settingsBtn: {
      background: '#f1f3f7',
      color: '#007bff',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 0',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background 0.2s',
      marginTop: '2px'
    }
  }

  return (
    <div style={styles.chatSidebar}>
      <div style={styles.chatHeader}>
        <h3 style={styles.headerTitle}>AI Chat</h3>
        <button 
          style={styles.closeBtn} 
          onMouseEnter={(e) => {
            e.target.style.background = '#ffeaea';
            e.target.style.color = '#f44336';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f3f3f3';
            e.target.style.color = '#888';
          }}
          onClick={() => {
            if (window.removeSidebar) window.removeSidebar();
          }}
        >
          ×
        </button>
      </div>

      <div style={styles.chatMessages}>
        {messages.length === 0 && (
          <div style={styles.welcomeMessage}>
            <p>👋 Hello! I'm your AI assistant.</p>
            {!apiKey ? (
              <>
                <p style={{color: '#f44336', fontWeight: 'bold'}}>⚠️ Please set your API key first!</p>
                <p>Click "Set API Key" button below to configure your Volcengine API key.</p>
                <p>Get your free API key at: <a href="https://console.volcengine.com/ark/" target="_blank" style={{color: '#007bff'}}>Volcengine Console</a></p>
              </>
            ) : (
              <p>Ready to chat! Type your message below.</p>
            )}
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} style={{...styles.message, ...(message.type === 'user' ? styles.messageUser : styles.messageAssistant)}}>
            <div style={{...styles.messageContent, ...(message.type === 'user' ? styles.messageContentUser : styles.messageContentAssistant)}}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{...styles.message, ...styles.messageAssistant}}>
            <div style={{...styles.messageContent, ...styles.messageContentAssistant}}>
              <div style={styles.typingIndicator}>
                <span style={{...styles.typingDot, animationDelay: '0s'}}></span>
                <span style={{...styles.typingDot, animationDelay: '0.2s'}}></span>
                <span style={{...styles.typingDot, animationDelay: '0.4s'}}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.chatInputContainer}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: 6}}>
          <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 14, color: '#007bff', userSelect: 'none'}}>
            <input type="checkbox" checked={useCurrent} onChange={e => setUseCurrent(e.target.checked)} style={{marginRight: 6}} />
            Current（让AI访问当前网页内容）
          </label>
        </div>
        <div style={styles.inputWrapper}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            rows="1"
            style={styles.textarea}
            onFocus={(e) => {
              e.target.style.border = '1.5px solid #007bff';
              e.target.style.boxShadow = '0 0 0 2px #e3f0ff';
            }}
            onBlur={(e) => {
              e.target.style.border = '1.5px solid #d0d0d0';
              e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
            }}
          />
          <button 
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            style={!inputValue.trim() || isLoading ? {...styles.sendBtn, ...styles.sendBtnDisabled} : styles.sendBtn}
          >
            Send
          </button>
        </div>
        <button 
          onClick={handleSetApiKey}
          style={styles.settingsBtn}
          onMouseEnter={(e) => e.target.style.background = '#e0eaff'}
          onMouseLeave={(e) => e.target.style.background = '#f1f3f7'}
        >
          {apiKey ? 'Change API Key' : 'Set API Key'}
        </button>
        <button 
          onClick={handleSetModel}
          style={styles.settingsBtn}
          onMouseEnter={(e) => e.target.style.background = '#e0eaff'}
          onMouseLeave={(e) => e.target.style.background = '#f1f3f7'}
        >
          {model ? `Model: ${model}` : 'Set Model Name'}
        </button>
      </div>
    </div>
  )
}

export default ChatSidebar 