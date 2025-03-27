'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotPreviewProps {
  name: string;
  description?: string;
  logoUrl?: string;
  avatarUrl?: string;
  primaryColor?: string;
  bubbleMessage?: string;
  welcomeMessage?: string;
  width?: number;
  height?: number;
  isDarkMode?: boolean;
}

export function ChatbotPreview({
  name,
  description,
  logoUrl,
  avatarUrl,
  primaryColor = '#000000',
  bubbleMessage,
  welcomeMessage = 'Hello! How can I help you today?',
  width = 400,
  height = 600,
  isDarkMode = false,
}: ChatbotPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeBotMessage: Message = {
        type: 'bot',
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeBotMessage]);
    }
  }, [isOpen, welcomeMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        type: 'bot',
        content: 'This is a preview response. The actual chatbot will provide real responses based on your training data.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Convert File to URL if needed
  const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('data:')) {
      return url;
    }
    return url;
  };

  return (
    <div className="relative h-[800px] w-full border rounded-lg bg-gray-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-lg hover:bg-gray-50"
        style={{ backgroundColor: primaryColor, color: '#ffffff' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {bubbleMessage || 'Hi! 👋 Click me to start chatting'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="absolute bottom-20 right-4 z-20 flex flex-col rounded-lg border bg-white shadow-lg transition-all duration-200"
          style={{ 
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            borderColor: isDarkMode ? '#333333' : '#e5e7eb'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b p-4"
            style={{ 
              backgroundColor: primaryColor,
              borderColor: isDarkMode ? '#333333' : '#e5e7eb'
            }}
          >
            <div className="flex items-center space-x-3">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Error loading logo:', e);
                  }}
                />
              )}
              <div>
                <h3 className="font-semibold text-white">{name}</h3>
                {description && (
                  <p className="text-sm text-white/80">{description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-white/80"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                {welcomeMessage}
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.type === 'bot' && avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt="Bot Avatar"
                      className="w-6 h-6 rounded-full mb-2 object-cover"
                      onError={(e) => {
                        console.error('Error loading avatar:', e);
                      }}
                    />
                  )}
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2"
                style={{ borderColor: primaryColor }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 