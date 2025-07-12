import React, { useState, useRef, useEffect } from 'react'
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);
// import 'highlight.js/styles/github-dark.css'; // 建议用CDN方式全局引入
import ReactMarkdown from 'react-markdown';

const modelOptions = [
  {
    group: '高级',
    options: [
      { value: 'doubao-seed-1-6-flash-250615', label: '豆包 1.6 Flash', icon: '⚡' },
      { value: 'doubao-seed-1-6-pro-250615', label: '豆包 1.6 Pro', icon: '🌟' },
      { value: 'doubao-seed-1-6-lite-250615', label: '豆包 1.6 Lite', icon: '💡' },
    ]
  },
  {
    group: '基础',
    options: [
      { value: 'doubao-seed-1-5-flash-250615', label: '豆包 1.5 Flash', icon: '⚡' },
      { value: 'doubao-seed-1-5-pro-250615', label: '豆包 1.5 Pro', icon: '🌟' },
      { value: 'doubao-seed-1-5-lite-250615', label: '豆包 1.5 Lite', icon: '💡' },
      { value: 'doubao-seed-1-4-flash-250615', label: '豆包 1.4 Flash', icon: '⚡' },
      { value: 'doubao-seed-1-4-pro-250615', label: '豆包 1.4 Pro', icon: '🌟' },
      { value: 'doubao-seed-1-4-lite-250615', label: '豆包 1.4 Lite', icon: '💡' },
    ]
  }
]

const ChatSidebar = () => {
  // 颜色和尺寸常量
  const ICON_SIZE = 20;
  const UNIFIED_FONT_SIZE = 12;
  const MAIN_COLOR = '#222'; // 默认黑色
  const MAIN_COLOR_HIGHLIGHT = '#6366f1'; // 高亮紫色
  const MAIN_COLOR_LIGHT = '#a5b4fc'; // 主色浅色
  const DARK_TEXT = '#222';

  // 样式对象
  const styles = {
    chatSidebar: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f6f8fa',
      borderLeft: '1px solid #e0e0e0',
      boxShadow: '-4px 0 24px 0 rgba(0,0,0,0.10)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: UNIFIED_FONT_SIZE,
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
      fontSize: UNIFIED_FONT_SIZE,
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
      fontSize: UNIFIED_FONT_SIZE
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
      fontSize: UNIFIED_FONT_SIZE,
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
      animation: 'typing-bounce 1s infinite alternate',
      fontSize: UNIFIED_FONT_SIZE
    },
    chatInputContainer: {
      padding: '16px 18px 18px 18px',
      background: '#fff',
      borderTop: '1.5px solid #ececec',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    inputActionsRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '6px',
      minWidth: '0',
    },
    inputRow: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      minHeight: '44px',
      overflow: 'visible', // 保证绝对定位按钮不会被裁剪
    },
    iconBtn: {
      background: 'none',
      border: 'none',
      borderRadius: '8px',
      padding: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: MAIN_COLOR,
      transition: 'background 0.18s, color 0.18s',
      fontSize: ICON_SIZE,
      width: '36px',
      height: '36px',
      minWidth: '36px',
      minHeight: '36px',
    },
    iconBtnActive: {
      background: MAIN_COLOR_LIGHT,
      color: MAIN_COLOR,
    },
    modelSelectBtn: {
      background: MAIN_COLOR_LIGHT,
      color: MAIN_COLOR,
      border: 'none',
      borderRadius: '8px',
      padding: '6px 12px 6px 8px',
      fontSize: UNIFIED_FONT_SIZE,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      minWidth: '36px',
      maxWidth: '160px',
      transition: 'background 0.2s',
      position: 'relative',
      height: '36px',
      marginTop: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    modelMenu: {
      position: 'absolute',
      left: '0',
      zIndex: 100,
      minWidth: '220px',
      background: '#fff',
      color: DARK_TEXT,
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      padding: '8px 0',
      fontSize: UNIFIED_FONT_SIZE,
      fontWeight: 500,
      maxHeight: '320px',
      overflowY: 'auto',
      border: `1.5px solid ${MAIN_COLOR_LIGHT}`,
      marginTop: undefined,
      marginBottom: undefined,
    },
    modelMenuGroup: {
      padding: '4px 18px 2px 18px',
      fontSize: UNIFIED_FONT_SIZE,
      color: '#888',
      fontWeight: 600
    },
    modelMenuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 18px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
      fontSize: UNIFIED_FONT_SIZE,
      color: DARK_TEXT,
      borderRadius: '7px',
      margin: 0,
      transition: 'background 0.18s, color 0.18s'
    },
    modelMenuItemActive: {
      background: MAIN_COLOR,
      color: '#fff'
    },
    modelMenuItemHover: {
      background: MAIN_COLOR_LIGHT,
      color: MAIN_COLOR
    },
    modelMenuIcon: {
      fontSize: '18px',
      marginRight: 2
    },
    modelMenuSelectedIcon: {
      marginLeft: 'auto',
      color: MAIN_COLOR,
      fontSize: '18px'
    },
    tooltip: {
      position: 'absolute',
      bottom: '110%',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#222',
      color: '#fff',
      padding: '5px 12px',
      borderRadius: '6px',
      fontSize: UNIFIED_FONT_SIZE,
      whiteSpace: 'nowrap',
      zIndex: 999,
      pointerEvents: 'none',
      opacity: 0.95,
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
    },
    textarea: {
      flex: 1,
      minHeight: '52px',
      maxHeight: '120px',
      resize: 'none',
      border: '1.5px solid #d0d0d0',
      borderRadius: '10px',
      padding: '10px 44px 10px 10px', // 四边间距更小，右侧为按钮预留
      fontSize: UNIFIED_FONT_SIZE,
      lineHeight: 1.7,
      background: '#f7f7fa',
      color: '#222',
      outline: 'none',
      transition: 'border 0.2s, box-shadow 0.2s',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      width: '100%',
      boxSizing: 'border-box',
    },
    sendBtnFloating: {
      position: 'absolute',
      right: '8px', // 更靠右
      bottom: '8px', // 更靠下
      height: '32px', // 稍微小一点
      width: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      background: 'none',
      color: MAIN_COLOR,
      borderRadius: '8px',
      boxShadow: 'none',
      padding: 0,
      cursor: 'pointer',
      transition: 'color 0.18s',
      zIndex: 10,
      opacity: 1,
    },
    sendBtnFloatingActive: {
      color: MAIN_COLOR_HIGHLIGHT,
    },
    sendBtnFloatingDisabled: {
      color: '#b3b8e0',
      cursor: 'not-allowed',
      opacity: 0.7,
    },
    inputWrapper: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '10px',
      position: 'relative'
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

  // 移除 codeStyles 相关 code-block 样式，只保留结构
  const CodeBlock = ({ language, value, onCopy }) => {
    const [copied, setCopied] = useState(false);
    // 语言别名兼容，强制 js 用 javascript
    const langMap = { js: 'javascript', javascript: 'javascript' };
    const lang = langMap[(language || '').toLowerCase()] || 'javascript';

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopy && onCopy();
      } catch (err) {
        console.error('复制失败:', err);
      }
    };

    // 去除首尾多余空行和缩进
    const cleanValue = value.replace(/^\s+|\s+$/g, '');
    // 用 highlight.js 得到高亮 HTML
    let highlighted = '';
    try {
      highlighted = hljs.highlight(cleanValue, { language: lang }).value;
    } catch (e) {
      highlighted = cleanValue;
    }

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#23272e', padding: '8px 16px', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <span style={{ color: '#b4befe', fontWeight: 600, fontSize: 14 }}>{lang}</span>
          <button 
            style={{ border: 'none', background: 'none', color: '#b4befe', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={handleCopy}
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <pre style={{ margin: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'auto' }}>
          <code
            className={`hljs language-${lang}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    );
  };

  // 用 react-markdown 渲染消息
  const renderMessage = (message) => {
    return (
      <ReactMarkdown
        children={message.content}
        components={{
          code({node, inline, className, children, ...props}) {
            let match = /language-(\w+)/.exec(className || '');
            // 强制 js 用 javascript
            if (match && match[1] && match[1].toLowerCase() === 'js') match[1] = 'javascript';
            // 代码块
            if (!inline) {
              return (
                <CodeBlock
                  language={match ? match[1] : ''}
                  value={String(children)}
                  onCopy={() => console.log('代码已复制')}
                />
              );
            }
            // 行内代码：只加粗/变色，不用灰色背景
            return <code style={{fontWeight: 600, color: '#e8791f', fontFamily: 'Menlo, Monaco, Consolas, monospace', background: 'none', fontSize: 14}}>{children}</code>;
          },
          p({children}) {
            // 普通段落
            return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '6px 0' }}>{children}</div>;
          }
        }}
      />
    );
  };

  // 默认调试消息
  const defaultDebugMessage = {
    type: 'assistant',
    content:
      '### JavaScript 解法代码\n\n' +
      '~~~javascript\n' +
      '/**\n' +
      ' * @param {string[]} strs\n' +
      ' * @return {string[][]}\n' +
      ' */\n' +
      'var groupAnagrams = function(strs) {\n' +
      '    const map = new Map();\n' +
      '    for (const str of strs) {\n' +
      '        // 将字符串拆分成字符数组、排序后再拼接成新字符串作为键\n' +
      '        const key = str.split(\'\').sort().join(\'\');\n' +
      '        if (map.has(key)) {\n' +
      '            map.get(key).push(str);\n' +
      '        } else {\n' +
      '            map.set(key, [str]);\n' +
      '        }\n' +
      '    }\n' +
      '    // 返回所有分组的结果\n' +
      '    return Array.from(map.values());\n' +
      '};\n' +
      '~~~\n\n' +
      '### 代码解释\n' +
      '1. **创建哈希表**：使用 `Map` 对象来存储字母异位词的分组结果，其中键是排序后的字符串（因为字母异位词排序后字符串相同），值是该分组对应的原字符串数组。\n' +
      '2. **遍历输入数组**：遍历每个字符串，将其拆分为字符数组、排序后再拼接成新字符串作为键。\n' +
      '3. **分组处理**：根据排序后的键，将原字符串放入对应的分组中。如果键已存在于 `Map` 中，就将原字符串添加到该键对应的数组中；如果键不存在，就创建一个新的数组并将原字符串放入。\n' +
      '4. **返回结果**：将 `Map` 中所有值转为数组返回，即为字母异位词分组后的结果。'
  };

  const [messages, setMessages] = useState([defaultDebugMessage]);
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('doubao-seed-1-6-flash-250615')
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const modelBtnRef = useRef(null)
  const [modelMenuDirection, setModelMenuDirection] = useState('down') // 'down' or 'up'
  const modelMenuRef = useRef(null)
  const [useCurrent, setUseCurrent] = useState(false)
  const messagesEndRef = useRef(null)
  const [showTooltip, setShowTooltip] = useState(null);

  // 豆包模型列表
  // const modelOptions = [
  //   { value: 'doubao-seed-1-6-flash-250615', label: '豆包种子 1.6 Flash' },
  //   { value: 'doubao-seed-1-6-pro-250615', label: '豆包种子 1.6 Pro' },
  //   { value: 'doubao-seed-1-6-lite-250615', label: '豆包种子 1.6 Lite' },
  //   { value: 'doubao-seed-1-5-flash-250615', label: '豆包种子 1.5 Flash' },
  //   { value: 'doubao-seed-1-5-pro-250615', label: '豆包种子 1.5 Pro' },
  //   { value: 'doubao-seed-1-5-lite-250615', label: '豆包种子 1.5 Lite' },
  //   { value: 'doubao-seed-1-4-flash-250615', label: '豆包种子 1.4 Flash' },
  //   { value: 'doubao-seed-1-4-pro-250615', label: '豆包种子 1.4 Pro' },
  //   { value: 'doubao-seed-1-4-lite-250615', label: '豆包种子 1.4 Lite' }
  // ]

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

  // 关闭下拉菜单（点击外部）
  useEffect(() => {
    if (!modelMenuOpen) return;
    const handleClick = (e) => {
      if (modelBtnRef.current && !modelBtnRef.current.contains(e.target)) {
        setModelMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [modelMenuOpen])

  // 判断弹窗展开方向
  useEffect(() => {
    if (!modelMenuOpen) return;
    const btn = modelBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const menuHeight = 320; // 预估最大高度
    if (windowHeight - rect.bottom < menuHeight && rect.top > menuHeight) {
      setModelMenuDirection('up');
    } else {
      setModelMenuDirection('down');
    }
  }, [modelMenuOpen]);

  // 通过 background.js 调用豆包 API
  const callDoubaoAPI = async (message) => {
    if (!apiKey) {
      throw new Error('Please set your Volcengine API key')
    }
    if (!model) {
      throw new Error('Please set your model name')
    }
    const params = {
      apiKey: apiKey,
      model: model,
      message: message
    };
    console.log('[AIChat] 请求参数:', params);
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'callDoubaoAPI',
        data: params
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to background:', chrome.runtime.lastError);
          reject(new Error('Failed to communicate with background script'));
          return;
        }
        console.log('[AIChat] 返回结果:', response);
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
  const handleSetModel = (selectedModel) => {
    if (selectedModel) {
      setModel(selectedModel)
      localStorage.setItem('ai-chat-model', selectedModel)
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
              {renderMessage(message)}
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
        <div style={styles.inputActionsRow}>
          {/* Current 网页内容按钮 */}
          <div style={{position: 'relative'}}>
            <button
              style={{
                ...styles.iconBtn,
                ...(useCurrent ? styles.iconBtnActive : {})
              }}
              onClick={() => setUseCurrent(v => !v)}
              aria-label="让AI访问当前网页内容"
              onMouseEnter={e => setShowTooltip('current')}
              onMouseLeave={e => setShowTooltip(null)}
            >
              {/* 文档icon SVG */}
              <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h2"/></svg>
            </button>
            {showTooltip === 'current' && (
              <div style={styles.tooltip}>让AI访问当前网页内容</div>
            )}
          </div>
          {/* API Key 按钮 */}
          <div style={{position: 'relative'}}>
            <button
              style={styles.iconBtn}
              onClick={handleSetApiKey}
              aria-label="设置API Key"
              onMouseEnter={e => setShowTooltip('apikey')}
              onMouseLeave={e => setShowTooltip(null)}
            >
              {/* Feather风格钥匙icon SVG */}
              <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="3.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l1.5 1.5"/><path d="M18.5 4.5l1.5 1.5"/></svg>
            </button>
            {showTooltip === 'apikey' && (
              <div style={styles.tooltip}>设置 API Key</div>
            )}
          </div>
          {/* 模型选择按钮 */}
          <div style={{position: 'relative'}} ref={modelBtnRef}>
            <button
              style={styles.modelSelectBtn}
              onClick={() => setModelMenuOpen(v => !v)}
              aria-label="选择模型"
              onMouseEnter={e => setShowTooltip('model')}
              onMouseLeave={e => setShowTooltip(null)}
            >
              {/* AI大脑icon SVG */}
              <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-4.418 0-8 3.582-8 8 0 3.866 2.686 7.064 6.25 7.877V22h3.5v-4.123C17.314 17.064 20 13.866 20 10c0-4.418-3.582-8-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{fontWeight: 600, fontSize: UNIFIED_FONT_SIZE, color: MAIN_COLOR, marginLeft: 2, marginRight: 2, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{modelOptions.flatMap(g => g.options).find(opt => opt.value === model)?.label || '选择模型'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MAIN_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: 2}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showTooltip === 'model' && (
              <div style={styles.tooltip}>选择模型</div>
            )}
            {modelMenuOpen && (
              <div
                ref={modelMenuRef}
                style={{
                  ...styles.modelMenu,
                  top: modelMenuDirection === 'down' ? '110%' : undefined,
                  bottom: modelMenuDirection === 'up' ? '110%' : undefined,
                  marginTop: modelMenuDirection === 'down' ? 4 : undefined,
                  marginBottom: modelMenuDirection === 'up' ? 4 : undefined,
                }}
              >
                {modelOptions.map(group => (
                  <div key={group.group}>
                    <div style={styles.modelMenuGroup}>{group.group}</div>
                    {group.options.map(opt => (
                      <div
                        key={opt.value}
                        style={{
                          ...styles.modelMenuItem,
                          ...(model === opt.value ? styles.modelMenuItemActive : {}),
                        }}
                        onClick={() => {
                          setModel(opt.value)
                          localStorage.setItem('ai-chat-model', opt.value)
                          setModelMenuOpen(false)
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = MAIN_COLOR_LIGHT}
                        onMouseLeave={e => e.currentTarget.style.background = model === opt.value ? MAIN_COLOR : 'none'}
                      >
                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={MAIN_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>
                        <span style={{marginLeft: 4}}>{opt.label}</span>
                        {model === opt.value && (
                          <svg style={styles.modelMenuSelectedIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MAIN_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={styles.inputRow}>
          <textarea
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 6 * 24) + 'px';
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={2}
            style={{...styles.textarea, overflowY: 'auto', minHeight: 2*24, maxHeight: 6*24}}
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
            className="send-btn-icon"
            aria-label="发送"
            style={{
              ...styles.sendBtnFloating,
              ...(inputValue.trim() && !isLoading ? styles.sendBtnFloatingActive : {}),
              ...((!inputValue.trim() || isLoading) ? styles.sendBtnFloatingDisabled : {} )
            }}
          >
            <svg
              viewBox="0 0 1024 1024"
              className="send-icon-img"
              width="20" // 更小
              height="20"
              fill={(!inputValue.trim() || isLoading) ? '#b3b8e0' : (inputValue.trim() ? '#6366f1' : '#222')}
              stroke={(!inputValue.trim() || isLoading) ? '#b3b8e0' : (inputValue.trim() ? '#6366f1' : '#222')}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{display: 'block'}}
            >
              <path d="M865.28 202.5472c-17.1008-15.2576-41.0624-19.6608-62.5664-11.5712L177.7664 427.1104c-23.2448 8.8064-38.5024 29.696-39.6288 54.5792-1.1264 24.8832 11.9808 47.104 34.4064 58.0608l97.5872 47.7184c4.5056 2.2528 8.0896 6.0416 9.9328 10.6496l65.4336 161.1776c7.7824 19.1488 24.4736 32.9728 44.7488 37.0688 20.2752 4.096 41.0624-2.1504 55.6032-16.7936l36.352-36.352c6.4512-6.4512 16.5888-7.8848 24.576-3.3792l156.5696 88.8832c9.4208 5.3248 19.8656 8.0896 30.3104 8.0896 8.192 0 16.4864-1.6384 24.2688-5.0176 17.8176-7.68 30.72-22.8352 35.4304-41.6768l130.7648-527.1552c5.5296-22.016-1.7408-45.2608-18.8416-60.416z m-20.8896 50.7904L713.5232 780.4928c-1.536 6.2464-5.8368 11.3664-11.776 13.9264s-12.5952 2.1504-18.2272-1.024L526.9504 704.512c-9.4208-5.3248-19.8656-7.9872-30.208-7.9872-15.9744 0-31.744 6.144-43.52 17.92l-36.352 36.352c-3.8912 3.8912-8.9088 5.9392-14.2336 6.0416l55.6032-152.1664c0.512-1.3312 1.2288-2.56 2.2528-3.6864l240.3328-246.1696c8.2944-8.4992-2.048-21.9136-12.3904-16.0768L301.6704 559.8208c-4.096-3.584-8.704-6.656-13.6192-9.1136L190.464 502.9888c-11.264-5.5296-11.5712-16.1792-11.4688-19.3536 0.1024-3.1744 1.536-13.824 13.2096-18.2272L817.152 229.2736c10.4448-3.9936 18.0224 1.3312 20.8896 3.8912 2.8672 2.4576 9.0112 9.3184 6.3488 20.1728z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatSidebar 