import React, { useState, useRef, useEffect } from 'react'
import './ChatSidebar.css'

const ChatSidebar = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const messagesEndRef = useRef(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 从localStorage获取API key
  useEffect(() => {
    const savedApiKey = localStorage.getItem('ai-chat-api-key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  // 调用Hugging Face API
  const callHuggingFaceAPI = async (message) => {
    if (!apiKey) {
      throw new Error('Please set your Hugging Face API key')
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: message,
          options: {
            wait_for_model: true
          }
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data[0]?.generated_text || 'Sorry, I could not generate a response.'
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // 添加用户消息
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])

    try {
      const response = await callHuggingFaceAPI(userMessage)
      
      // 添加AI回复
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
    const newApiKey = prompt('Please enter your Hugging Face API key:')
    if (newApiKey) {
      setApiKey(newApiKey)
      localStorage.setItem('ai-chat-api-key', newApiKey)
    }
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h3>AI Chat</h3>
        <button className="close-btn" onClick={() => {
          const sidebar = document.getElementById('ai-chat-sidebar')
          if (sidebar) {
            const body = document.body
            body.style.marginRight = sidebar._originalMarginRight || '0'
            sidebar.remove()
          }
        }}>
          ×
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Hello! I'm your AI assistant.</p>
            <p>Click the settings button to set your Hugging Face API key.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            rows="1"
          />
          <button 
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-btn"
          >
            Send
          </button>
        </div>
        
        <button 
          onClick={handleSetApiKey}
          className="settings-btn"
        >
          {apiKey ? 'Change API Key' : 'Set API Key'}
        </button>
      </div>
    </div>
  )
}

export default ChatSidebar 