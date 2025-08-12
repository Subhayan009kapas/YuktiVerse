import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import SmartTextFormatter from './AITextFormatter';
const backendURL = import.meta.env.VITE_BACKEND_URL;

const AiHelpers = ({ text, onClose, mode = 'chatbot' }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: '100vh' });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Use useRef instead of useState for didInitial to persist across re-renders
  const didInitialRef = useRef(false);
  const initialRequestSentRef = useRef(false);
  
  const panelRef = useRef(null);
  const resizeRef = useRef(null);
  const LOADING_ID = 'loading';

  const saved = sessionStorage.getItem('chat_messages');
  const [messages, setMessages] = useState(() => {
    if (saved) {
      return JSON.parse(saved).map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
    return [{
      id: 1,
      type: 'system',
      content: 'Hello, how can I help you today?',
      timestamp: new Date()
    }];
  });

  const messagesEndRef = useRef(null);

  // Persist to sessionStorage on every messages change
  useEffect(() => {
    sessionStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll on every messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fixed notepad mode initial request
  useEffect(() => {
    // Only proceed if:
    // 1. Mode is notepad
    // 2. We have text
    // 3. We haven't sent the initial request yet
    if (mode === 'notepad' && text && !initialRequestSentRef.current) {
      initialRequestSentRef.current = true; // Mark as sent immediately
      didInitialRef.current = true;

      // 1) user bubble
      const userMessageId = Date.now();
      setMessages(prev => [
        ...prev,
        { id: userMessageId, type: 'user', content: text, timestamp: new Date() }
      ]);

      // 2) loading bubble
      setMessages(prev => [
        ...prev,
        { id: LOADING_ID, type: 'loading', content: 'Thinking…', timestamp: new Date() }
      ]);

      // 3) fetch & replace
      axios.post(`${backendURL}/api/ai-help/detailed-explain`, { prompt: text, context: text })
        .then(res => {
          setMessages(prev => prev.map(m =>
            m.id === LOADING_ID
              ? { id: Date.now(), type: 'ai', content: res.data.response, timestamp: new Date() }
              : m
          ));
        })
        .catch(err => {
          console.error(err);
          setMessages(prev => prev.map(m =>
            m.id === LOADING_ID
              ? { id: Date.now(), type: 'ai', content: '⚠️ Failed to load.', timestamp: new Date() }
              : m
          ));
        });
    }
  }, [mode, text]); // Removed didInitial from dependencies

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    const userId = Date.now();

    // 1) immediate user bubble
    setMessages(prev => [
      ...prev,
      { id: userId, type: 'user', content: prompt, timestamp: new Date() }
    ]);

    // 2) loading bubble
    setMessages(prev => [
      ...prev,
      { id: LOADING_ID, type: 'loading', content: 'Thinking…', timestamp: new Date() }
    ]);

    const currentPrompt = prompt;
    setPrompt('');

    const endpoint = `${backendURL}/api/ai-help/simple-chat`;
    try {
      const res = await axios.post(endpoint, { prompt: currentPrompt, context: text });

      // 3) replace loading
      setMessages(prev => prev.map(m =>
        m.id === LOADING_ID
          ? { id: Date.now(), type: 'ai', content: res.data.response, timestamp: new Date() }
          : m
      ));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m =>
        m.id === LOADING_ID
          ? { id: Date.now(), type: 'ai', content: '⚠️ Something went wrong.', timestamp: new Date() }
          : m
      ));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle') || e.target.closest('.close-button') || e.target.closest('.expand-button')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      setSize({
        width: Math.max(300, resizeStart.width - deltaX),
        height: Math.max(400, resizeStart.height + deltaY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: typeof size.height === 'number' ? size.height : window.innerHeight
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setSize({ width: Math.min(800, window.innerWidth - 40), height: window.innerHeight - 40 });
      setPosition({ x: 20, y: 20 });
    } else {
      setSize({ width: 400, height: '100vh' });
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const panelStyle = {
    '--primary': '#4f46e5',
    '--primary-light': '#7c3aed',
    '--secondary': '#06b6d4',
    '--dark-bg': '#0c0a1f',
    '--dark-card': '#1a1625',
    '--dark-text': '#e0e7ff',
    '--dark-border': '#312e81',
    '--light-bg': '#f1f5f9',
    '--light-card': '#ffffff',
    '--light-text': '#1e1b4b',
    '--light-border': '#e0e7ff',
    '--danger': '#ef4444',
    '--warning': '#f59e0b',
    '--success': '#10b981',
    '--glass-bg': 'rgba(26, 22, 37, 0.95)',
    '--glass-border': 'rgba(255, 255, 255, 0.1)',
    '--shadow-heavy': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    position: isExpanded ? 'fixed' : 'fixed',
    top: isExpanded ? `${position.y}px` : '0',
    right: isExpanded ? 'auto' : '0',
    left: isExpanded ? `${position.x}px` : 'auto',
    width: typeof size.width === 'number' ? `${size.width}px` : size.width,
    height: typeof size.height === 'number' ? `${size.height}px` : size.height,
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderLeft: isExpanded ? '1px solid var(--glass-border)' : '1px solid var(--dark-border)',
    borderRadius: isExpanded ? '20px' : '0',
    boxShadow: 'var(--shadow-heavy)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    color: 'var(--dark-text)',
    cursor: isDragging ? 'grabbing' : (isExpanded ? 'grab' : 'default'),
    transition: isExpanded ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: !isExpanded ? 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
  };

  return (
    <div 
      ref={panelRef}
      style={panelStyle}
      onMouseDown={handleMouseDown}
    >
      <style>
        {`
          @keyframes slideIn {
            from { 
              right: -400px; 
              opacity: 0;
              transform: translateX(20px);
            }
            to { 
              right: 0; 
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes messageAppear {
            from { 
              opacity: 0;
              transform: translateY(10px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid var(--glass-border)',
        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
        borderRadius: isExpanded ? '20px 20px 0 0' : '0',
        cursor: isExpanded ? 'grab' : 'default'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'white',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '700'
          }}>
            ✨
          </div>
          <span>Yukti AI</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="expand-button"
            onClick={toggleExpand}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.25)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            {isExpanded ? '⤴' : '⤢'}
          </button>
          
          <button
            className="close-button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--danger)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.9)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
              gap: '12px',
              animation: 'messageAppear 0.3s ease-out'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, var(--secondary), var(--primary))' 
                : message.type === 'ai'
                ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                : 'linear-gradient(135deg, var(--warning), #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              flexShrink: 0
            }}>
              {message.type === 'user' ? '👤' : message.type === 'ai' ? '🤖' : '💡'}
            </div>
            
            <div style={{
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                : 'var(--dark-card)',
              padding: '16px',
              borderRadius: '16px',
              maxWidth: '80%',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                color: message.type === 'user' ? 'white' : 'var(--dark-text)',
                fontSize: '14px',
                lineHeight: '1.5',
                marginBottom: '8px'
              }}>
                {/* {message.content} */}
                  <SmartTextFormatter text={message.content} />
              </div>
              <div style={{
                fontSize: '11px',
                opacity: 0.6,
                color: message.type === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--dark-text)'
              }}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(26, 22, 37, 0.5)',
        borderRadius: isExpanded ? '0 0 20px 20px' : '0'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            placeholder="Ask me anything about your text..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '120px',
              resize: 'vertical',
              padding: '12px 16px',
              background: 'var(--dark-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              color: 'var(--dark-text)',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--glass-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: prompt.trim() 
                ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                : 'var(--dark-border)',
              border: 'none',
              color: 'white',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              opacity: prompt.trim() ? 1 : 0.5
            }}
            onMouseEnter={(e) => {
              if (prompt.trim()) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ➤
          </button>
        </div>
        
        <div style={{
          fontSize: '11px',
          color: 'rgba(224, 231, 255, 0.6)',
          marginTop: '8px',
          textAlign: 'center'
        }}>
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {/* Resize Handle */}
      {isExpanded && (
        <div
          ref={resizeRef}
          className="resize-handle"
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '20px',
            height: '20px',
            cursor: 'nw-resize',
            background: 'transparent'
          }}
        />
      )}
    </div>
  );
};

export default AiHelpers;