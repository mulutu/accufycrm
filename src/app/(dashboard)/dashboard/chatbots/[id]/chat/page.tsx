"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, RefreshCw } from "lucide-react";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type ChatbotDetails = {
  id: string;
  name: string;
  description?: string;
  primaryColor?: string;
  textColor?: string;
  welcomeMessage?: string;
};

export default function ChatbotTestPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  const [chatbot, setChatbot] = useState<ChatbotDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    async function fetchChatbot() {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}`);
        if (response.ok) {
          const data = await response.json();
          setChatbot(data.chatbot);
          
          // Add welcome message if it exists
          if (data.chatbot.welcomeMessage) {
            setMessages([{
              id: "welcome",
              content: data.chatbot.welcomeMessage,
              role: "assistant",
              timestamp: new Date(),
            }]);
          }
        }
      } catch (error) {
        console.error("Error fetching chatbot:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChatbot();
  }, [chatbotId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const resetChat = () => {
    setMessages(chatbot?.welcomeMessage 
      ? [{
          id: "welcome",
          content: chatbot.welcomeMessage,
          role: "assistant",
          timestamp: new Date(),
        }] 
      : []);
    setConversationId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const payload = {
        message: input,
        ...(conversationId && { conversationId }),
      };

      const response = await fetch(`/api/chat/${chatbotId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      // Set conversation ID for future messages
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const botResponse: Message = {
        id: Date.now().toString() + "-response",
        content: data.message,
        role: "assistant",
        timestamp: new Date(data.timestamp),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          content: "Sorry, there was an error processing your request.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="container py-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Chatbot Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Sorry, we couldn't find the chatbot you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Testing: {chatbot.name}
        </h1>
        <Button 
          variant="outline" 
          onClick={resetChat}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Chat
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-[calc(100vh-250px)]">
        {/* Chat header */}
        <div 
          className="px-4 py-3 border-b dark:border-gray-700 flex items-center"
          style={{
            backgroundColor: chatbot.primaryColor || "#4f46e5",
            color: chatbot.textColor || "#ffffff"
          }}
        >
          <div>
            <h2 className="font-medium">{chatbot.name}</h2>
            {chatbot.description && (
              <p className="text-sm opacity-90">{chatbot.description}</p>
            )}
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                  }`}
                  style={
                    message.role === "user" && chatbot.primaryColor
                      ? { backgroundColor: chatbot.primaryColor, color: chatbot.textColor || "#ffffff" }
                      : {}
                  }
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-3 border-t dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isProcessing || !input.trim()}
              style={{
                backgroundColor: chatbot.primaryColor || "#4f46e5",
                color: chatbot.textColor || "#ffffff"
              }}
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
        <h3 className="font-semibold mb-2">About this testing page</h3>
        <p className="text-gray-600 dark:text-gray-300">
          This page allows you to test your chatbot directly in the dashboard. 
          It uses the same API endpoint that your embedded chatbot will use on your website.
          Any conversations here are stored in your database just like regular user interactions.
        </p>
      </div>
    </div>
  );
} 