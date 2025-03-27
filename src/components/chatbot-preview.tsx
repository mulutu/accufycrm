'use client';

import { useState } from 'react';

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
              <div className="flex-1">
                <div
                  className="inline-block px-4 py-2 rounded-lg"
                  style={{ backgroundColor: primaryColor + '20' }}
                >
                  <p className="text-sm">
                    Hello! I&apos;m your AI assistant. How can I help you today?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: primaryColor + '50' }}
              />
              <button
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 