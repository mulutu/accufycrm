"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type ChatWidgetProps = {
  chatbotId: string;
  apiUrl: string;
  welcomeMessage?: string;
  primaryColor?: string;
  textColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  position?: "bottom-right" | "bottom-left";
};

export function ChatWidget({
  chatbotId,
  apiUrl,
  welcomeMessage = "Hi there! How can I help you today?",
  primaryColor = "#3B82F6",
  textColor = "#FFFFFF",
  fontFamily = "inherit",
  logoUrl,
  position = "bottom-right",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: welcomeMessage,
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!hasScrolledUp) {
      scrollToBottom();
    }
  }, [messages, hasScrolledUp]);

  // Handle scroll events to show the scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // If scrolled up more than 100px from bottom, show scroll button
      setHasScrolledUp(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setHasScrolledUp(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // This would be a real API call in production
      console.log(`Sending message to chatbot ${chatbotId} via ${apiUrl}`);
      // For example: await fetch(`${apiUrl}/api/chat/${chatbotId}`, ...)
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "This is a simulated response from the AI. In a real application, this would come from your backend API that processes the message with LangChain and Gemini.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "Sorry, there was an error processing your request.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed z-50 bottom-4" 
      style={{ 
        [position === "bottom-left" ? "left" : "right"]: "1rem",
        fontFamily 
      }}
    >
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        style={{ backgroundColor: primaryColor, color: textColor }}
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:opacity-90 transition-opacity focus:outline-none"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 w-80 sm:w-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div 
            style={{ backgroundColor: primaryColor, color: textColor }}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-6 w-6 mr-2" />
              ) : (
                <MessageSquare className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">Chat Support</span>
            </div>
            <button
              onClick={toggleChat}
              className="text-current hover:opacity-80 focus:outline-none"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === "user"
                      ? `bg-blue-500 text-white`
                      : "bg-gray-100 text-gray-800"
                  }`}
                  style={
                    message.role === "user"
                      ? { backgroundColor: primaryColor, color: textColor }
                      : {}
                  }
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block text-right">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {hasScrolledUp && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-16 right-4 rounded-full bg-gray-200 p-2 shadow-md hover:bg-gray-300 focus:outline-none"
              aria-label="Scroll to bottom"
            >
              <ArrowDown size={16} />
            </button>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{ backgroundColor: primaryColor, color: textColor }}
                className="px-3 h-10 rounded-md flex items-center justify-center"
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 