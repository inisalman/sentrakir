import React, { useState, useEffect, useRef } from 'react';
import { processUserMessage } from '../../utils/aiChat';
import { createChatMessage, getChatHistory } from '../../utils/supabaseChat';
import { createNotification } from '../../utils/supabaseNotifications';
import { supabase } from '../../utils/supabaseClient';

const ChatWidget = ({ companyId, clientName = 'Client' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Safety check - if no companyId, don't render
  if (!companyId) {
    console.warn('ChatWidget: companyId prop is missing');
    return null;
  }

  // Load chat history on mount
  useEffect(() => {
    if (!companyId) return;

    const loadChatHistory = async () => {
      try {
        const history = await getChatHistory(companyId, 50);
        setMessages(history || []);
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    };

    loadChatHistory();
    const interval = setInterval(loadChatHistory, 5000);
    return () => clearInterval(interval);
  }, [companyId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !companyId) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // Save user message to DB
      const userMsg = await createChatMessage(companyId, userMessage, 'client');

      if (userMsg) {
        setMessages(prev => [...prev, userMsg]);

        // Notify admin about new chat message
        const { data: comp } = await supabase
          .from('companies')
          .select('admin_id, name')
          .eq('id', companyId)
          .single();
        if (comp?.admin_id) {
          createNotification({
            adminId: comp.admin_id,
            type: 'ai_chat',
            title: 'Chat Baru',
            message: `${comp.name || clientName}: ${userMessage.slice(0, 80)}`,
            priority: 'normal',
            referenceId: companyId,
            referenceType: 'chat',
            metaData: { companyName: comp.name, preview: userMessage.slice(0, 100) },
          });
        }
      }

      // Get AI response
      const response = await processUserMessage(userMessage, messages);

      if (response.success) {
        // Save AI response to DB
        const aiMsg = await createChatMessage(
          companyId,
          response.answer,
          'ai',
          null,
          response.faqId || null
        );

        if (aiMsg) {
          setMessages(prev => [...prev, aiMsg]);
        }
      } else {
        // Error response
        const errorMsg = await createChatMessage(
          companyId,
          'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi admin.',
          'ai'
        );

        if (errorMsg) {
          setMessages(prev => [...prev, errorMsg]);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg = await createChatMessage(
        companyId,
        'Terjadi kesalahan teknis. Silakan hubungi admin.',
        'ai'
      );

      if (errorMsg) {
        setMessages(prev => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ pointerEvents: 'auto' }}>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
          title="Open Support Chat"
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 9999,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Window - Compact Facebook style */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          width: '360px',
          height: '480px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          border: '1px solid #e5e5ea'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '600' }}>Support Chat</h3>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>Kami siap membantu</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '0 4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#65676b',
                fontSize: '13px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '24px' }}>👋</p>
                <p style={{ margin: '8px 0 0 0' }}>Halo! Bagaimana kami bisa membantu?</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'client' ? 'flex-end' : 'flex-start',
                    marginBottom: '4px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: '18px',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      backgroundColor: msg.sender === 'client' ? '#0084ff' : '#e5e5ea',
                      color: msg.sender === 'client' ? 'white' : '#000',
                      wordWrap: 'break-word'
                    }}
                  >
                    <p style={{ margin: 0, marginBottom: '4px' }}>{msg.message}</p>
                    <p style={{
                      margin: 0,
                      fontSize: '11px',
                      opacity: 0.7,
                      marginTop: '2px'
                    }}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  backgroundColor: '#e5e5ea',
                  padding: '8px 12px',
                  borderRadius: '18px',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#999',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite'
                  }}></span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#999',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite',
                    animationDelay: '0.2s'
                  }}></span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#999',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite',
                    animationDelay: '0.4s'
                  }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            borderTop: '1px solid #e5e5ea',
            padding: '8px',
            display: 'flex',
            gap: '6px',
            backgroundColor: 'white',
            borderRadius: '0 0 12px 12px'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Aa"
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
              style={{
                flex: 1,
                border: '1px solid #d0d0d0',
                borderRadius: '20px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'inherit',
                ':focus': {
                  borderColor: '#2563eb'
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              style={{
                background: inputValue.trim() && !isLoading ? '#2563eb' : '#d0d0d0',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'background 0.2s'
              }}
            >
              ➤
            </button>
          </div>

          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { opacity: 0.4; }
              40% { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
