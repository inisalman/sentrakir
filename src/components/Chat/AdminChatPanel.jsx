import React, { useState, useEffect, useRef } from 'react';
import {
  getClientChatList,
  getChatHistory,
  createChatMessage,
} from '../../utils/supabaseChat';
import { getAllCompanies } from '../../utils/supabaseClientAuth';

const AdminChatPanel = ({ adminId }) => {
  const [clientList, setClientList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load client list & companies on mount
  useEffect(() => {
    loadClientList();
    loadCompanies();
    const interval = setInterval(loadClientList, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh chat history saat pilih client
  useEffect(() => {
    if (!selectedCompanyId) return;
    loadChatHistory(selectedCompanyId);
    const interval = setInterval(() => loadChatHistory(selectedCompanyId), 5000);
    return () => clearInterval(interval);
  }, [selectedCompanyId]);

  // Auto scroll ke bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const loadClientList = async () => {
    const list = await getClientChatList();
    setClientList(list);
  };

  const loadCompanies = async () => {
    const data = await getAllCompanies();
    setCompanies(data || []);
  };

  const loadChatHistory = async (companyId) => {
    const history = await getChatHistory(companyId, 100);
    setChatHistory(history || []);
  };

  const getCompanyName = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    return company ? company.name : companyId;
  };

  const hasUnresolved = (companyId) => {
    return clientList.some((c) => c.company_id === companyId && !c.is_resolved);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedCompanyId) return;

    setIsSending(true);
    try {
      const msg = await createChatMessage(
        selectedCompanyId,
        inputValue.trim(),
        'admin'
      );
      if (msg) {
        setChatHistory((prev) => [...prev, msg]);
        setInputValue('');
      }
    } catch (err) {
      console.error('Error sending admin message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatLastSeen = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: '620px' }}>

      {/* ===== KIRI: List Client ===== */}
      <div style={{
        width: '280px',
        flexShrink: 0,
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}>
        {/* Header list */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI Chat Client
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: '700', color: '#1C3967' }}>
            Chat Queries
          </p>
        </div>

        {/* Client list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {clientList.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              Belum ada chat masuk
            </div>
          ) : (
            clientList.map((item) => {
              const isActive = selectedCompanyId === item.company_id;
              const unresolved = hasUnresolved(item.company_id);
              return (
                <div
                  key={item.company_id}
                  onClick={() => setSelectedCompanyId(item.company_id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: isActive ? '#eff6ff' : '#fff',
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? '#1d4ed8' : '#1e293b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '180px',
                    }}>
                      {getCompanyName(item.company_id)}
                    </p>
                    {unresolved && (
                      <span style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <p style={{
                    margin: '3px 0 0 0',
                    fontSize: '11px',
                    color: '#94a3b8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatLastSeen(item.created_at)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== KANAN: Chat Window ===== */}
      <div style={{
        flex: 1,
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}>
        {!selectedCompanyId ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            gap: '8px',
          }}>
            <span style={{ fontSize: '36px' }}>💬</span>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Pilih client untuk melihat chat</p>
          </div>
        ) : (
          <>
            {/* Header chat */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: '#1C3967',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                flexShrink: 0,
              }}>
                {getCompanyName(selectedCompanyId).charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                  {getCompanyName(selectedCompanyId)}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                  {chatHistory.length} pesan
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f5f7fa',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {chatHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '24px' }}>
                  Belum ada pesan
                </div>
              ) : (
                chatHistory.map((msg, idx) => {
                  const isClient = msg.sender === 'client';
                  const isAdmin = msg.sender === 'admin';
                  const isAI = msg.sender === 'ai';

                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: isClient ? 'flex-start' : 'flex-end',
                    }}>
                      <div style={{ maxWidth: '70%' }}>
                        {/* Label sender */}
                        <p style={{
                          margin: '0 0 3px 0',
                          fontSize: '10px',
                          color: '#94a3b8',
                          fontWeight: '600',
                          textAlign: isClient ? 'left' : 'right',
                          paddingLeft: isClient ? '4px' : '0',
                          paddingRight: isClient ? '0' : '4px',
                        }}>
                          {isClient ? 'Client' : isAdmin ? 'Admin' : 'AI'}
                        </p>
                        {/* Bubble */}
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isClient
                            ? '4px 18px 18px 18px'
                            : '18px 4px 18px 18px',
                          background: isClient
                            ? '#fff'
                            : isAdmin
                            ? '#1C3967'
                            : '#2563eb',
                          color: isClient ? '#1e293b' : '#fff',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          border: isClient ? '1px solid #e2e8f0' : 'none',
                          wordBreak: 'break-word',
                        }}>
                          {msg.message}
                        </div>
                        {/* Timestamp */}
                        <p style={{
                          margin: '3px 0 0 0',
                          fontSize: '10px',
                          color: '#94a3b8',
                          textAlign: isClient ? 'left' : 'right',
                          paddingLeft: isClient ? '4px' : '0',
                          paddingRight: isClient ? '0' : '4px',
                        }}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input admin reply */}
            <form onSubmit={handleSend} style={{
              padding: '12px 16px',
              borderTop: '1px solid #e2e8f0',
              background: '#fff',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tulis balasan ke client..."
                disabled={isSending}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
                style={{
                  flex: 1,
                  border: '1px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: '#f8fafc',
                }}
              />
              <button
                type="submit"
                disabled={isSending || !inputValue.trim()}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: 'none',
                  background: inputValue.trim() && !isSending ? '#1C3967' : '#e2e8f0',
                  color: inputValue.trim() && !isSending ? '#fff' : '#94a3b8',
                  cursor: inputValue.trim() && !isSending ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '16px',
                  transition: 'all 0.2s',
                }}
              >
                ➤
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChatPanel;
