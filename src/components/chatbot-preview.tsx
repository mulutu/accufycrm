'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bot, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotPreviewProps {
  name: string;
  description: string;
  logoUrl: string;
  avatarUrl: string;
  primaryColor: string;
  isDarkMode: boolean;
}

export function ChatbotPreview({
  name,
  description,
  logoUrl,
  avatarUrl,
  primaryColor,
  isDarkMode,
}: ChatbotPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot'; content: string }>>([
    {
      type: 'bot',
      content: 'Hello! How can I help you today?',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', content: message }]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: 'This is a preview message. The actual chatbot will respond based on your training data.',
        },
      ]);
    }, 1000);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
      style={{ borderColor: primaryColor }}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-4 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          style={{ backgroundColor: primaryColor, color: 'white' }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="w-8 h-8" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: primaryColor }}>
                {name.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-left">
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </button>
      ) : (
        <div className="flex flex-col h-[600px]">
          <div
            className="p-4 flex items-center justify-between border-b"
            style={{ borderColor: primaryColor }}
          >
            <div className="flex items-center space-x-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-bold" style={{ color: primaryColor }}>
                    {name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.type === 'user'
                        ? 'rounded-br-none'
                        : 'rounded-bl-none bg-gray-100 dark:bg-gray-700'
                    }`}
                    style={
                      msg.type === 'user'
                        ? { backgroundColor: primaryColor, color: 'white' }
                        : undefined
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" style={{ backgroundColor: primaryColor }}>
                Send
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 