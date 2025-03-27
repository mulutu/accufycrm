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
  isDarkMode: boolean;
  bubbleMessage: string;
  welcomeMessage: string;
}

export function ChatbotPreview({
  name,
  description,
  logoUrl,
  avatarUrl,
  primaryColor,
  isDarkMode,
  bubbleMessage,
  welcomeMessage,
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
  const getImageUrl = (url: string) => {
    if (url.startsWith('data:')) {
      return url;
    }
    return url || '';
  };

  return (
    <div className="relative">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow z-10"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="w-12 h-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </div>
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg p-3 text-sm">
          {bubbleMessage}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[400px] h-[500px] bg-white rounded-lg shadow-xl z-20 flex flex-col">
          {/* Header */}
          <div
            className="p-4 rounded-t-lg flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center space-x-3">
              {logoUrl && (
                <img
                  src={getImageUrl(logoUrl)}
                  alt={name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <h3 className="font-semibold text-white">{name}</h3>
                <p className="text-sm text-white/80">{description}</p>
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
                      src={getImageUrl(avatarUrl)}
                      alt="Bot Avatar"
                      className="w-6 h-6 rounded-full mb-2"
                    />
                  )}
                  <p>{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
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