'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotPreviewProps {
  name: string;
  description: string;
  logoUrl: string;
  avatarUrl: string;
  primaryColor: string;
  bubbleMessage: string;
}

export function ChatbotPreview({
  name,
  description,
  logoUrl,
  avatarUrl,
  primaryColor,
  bubbleMessage,
}: ChatbotPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "I understand your question. Let me help you with that.",
        "That's an interesting point. Here's what I think...",
        "I can help you with that. Here's what you need to know...",
        "Let me explain that for you...",
        "I'll help you find the information you need.",
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage: Message = {
        type: 'bot',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="relative w-full h-[600px] border rounded-lg overflow-hidden bg-white">
      {/* Chat Button - Always visible */}
      <div className="absolute bottom-4 right-4 z-10">
        <div
          className="flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: primaryColor }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Chatbot Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-500 text-sm">AI</span>
              </div>
            )}
          </div>
          <span className="text-white font-medium">{bubbleMessage}</span>
        </div>
      </div>

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="absolute bottom-20 right-4 w-[400px] h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-20">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Chatbot Logo"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">AI</span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {message.type === 'bot' && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Chatbot Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-500 text-sm">AI</span>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Chatbot Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-500 text-sm">AI</span>
                    </div>
                  )}
                </div>
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: primaryColor + '50' }}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
                disabled={isTyping || !inputMessage.trim()}
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