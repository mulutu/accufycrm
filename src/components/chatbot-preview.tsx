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
  logoUrl?: string;
  avatarUrl?: string;
  primaryColor?: string;
  isDarkMode?: boolean;
}

export function ChatbotPreview({
  name,
  description,
  logoUrl,
  avatarUrl,
  primaryColor = '#2563eb',
  isDarkMode = false,
}: ChatbotPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        role: 'assistant',
        content: 'This is a preview of how the chatbot will respond. The actual responses will be based on your website content and knowledge base.',
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto border rounded-lg overflow-hidden">
      {/* Chatbot Header */}
      <div
        className="p-4 border-b flex items-center gap-3"
        style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
        <div>
          <h3 className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#111827' }}>
            {name}
          </h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Bot"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div
        className="p-4 border-t"
        style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }}
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
            style={{
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#111827',
              borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
            }}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 