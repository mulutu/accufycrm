"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clipboard, Code, CheckCircle } from "lucide-react";

export default function ChatbotEmbedPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  const [chatbot, setChatbot] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChatbot() {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}`);
        if (response.ok) {
          const data = await response.json();
          setChatbot(data.chatbot);
        }
      } catch (error) {
        console.error("Error fetching chatbot:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChatbot();
  }, [chatbotId]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Different embed code options
  const getInlineScript = () => {
    return `<script>
  (function(w, d) {
    var s = d.createElement('script');
    s.src = '${window.location.origin}/api/embed/${chatbotId}/script.js';
    s.async = true;
    s.onload = function() {
      w.AIChatCRM.init({
        chatbotId: '${chatbotId}'
      });
    };
    d.head.appendChild(s);
  })(window, document);
</script>`;
  };

  const getTagScript = () => {
    return `<div id="ai-chat-crm-widget" data-chatbot-id="${chatbotId}"></div>
<script src="${window.location.origin}/api/embed/${chatbotId}/script.js" async></script>`;
  };

  const getReactCode = () => {
    return `import { useEffect } from 'react';

export function ChatWidget() {
  useEffect(() => {
    // Load the chat widget script
    const script = document.createElement('script');
    script.src = '${window.location.origin}/api/embed/${chatbotId}/script.js';
    script.async = true;
    script.onload = function() {
      // @ts-ignore
      window.AIChatCRM.init({
        chatbotId: '${chatbotId}'
      });
    };
    document.head.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      document.head.removeChild(script);
      // @ts-ignore
      if (window.AIChatCRM && window.AIChatCRM.destroy) {
        // @ts-ignore
        window.AIChatCRM.destroy();
      }
    };
  }, []);

  return <div id="ai-chat-crm-widget" />;
}`;
  };

  const getCopyButtonText = (code: string) => {
    return (
      <span className="flex items-center gap-1">
        {copied ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Clipboard className="h-4 w-4" />
            Copy
          </>
        )}
      </span>
    );
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
        <Card>
          <CardHeader>
            <CardTitle>Chatbot Not Found</CardTitle>
            <CardDescription>
              Sorry, we couldn't find the chatbot you're looking for.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Embed Your Chatbot</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Integration Instructions</CardTitle>
          <CardDescription>
            Choose the integration method that works best for your website or application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inline">
            <TabsList className="mb-6">
              <TabsTrigger value="inline">Inline Script</TabsTrigger>
              <TabsTrigger value="tag">Script Tag</TabsTrigger>
              <TabsTrigger value="react">React Component</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inline">
              <div className="space-y-4">
                <p>
                  Add this code to the bottom of your website's <code>&lt;body&gt;</code> tag.
                  This is the simplest way to add the chatbot to your website.
                </p>
                <div className="relative bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto">
                  <pre className="text-sm">
                    <code>{getInlineScript()}</code>
                  </pre>
                  <Button 
                    size="sm" 
                    onClick={() => handleCopy(getInlineScript())} 
                    className="absolute top-2 right-2"
                  >
                    {getCopyButtonText(getInlineScript())}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tag">
              <div className="space-y-4">
                <p>
                  Add this code anywhere in your HTML. The chatbot will be attached to 
                  the div with the ID "ai-chat-crm-widget".
                </p>
                <div className="relative bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto">
                  <pre className="text-sm">
                    <code>{getTagScript()}</code>
                  </pre>
                  <Button 
                    size="sm" 
                    onClick={() => handleCopy(getTagScript())} 
                    className="absolute top-2 right-2"
                  >
                    {getCopyButtonText(getTagScript())}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="react">
              <div className="space-y-4">
                <p>
                  Use this React component to add the chatbot to your React application.
                </p>
                <div className="relative bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto">
                  <pre className="text-sm">
                    <code>{getReactCode()}</code>
                  </pre>
                  <Button 
                    size="sm" 
                    onClick={() => handleCopy(getReactCode())} 
                    className="absolute top-2 right-2"
                  >
                    {getCopyButtonText(getReactCode())}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Customize Your Chatbot</CardTitle>
          <CardDescription>
            You can customize the appearance and behavior of your chatbot by modifying its settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Go to the <a href={`/dashboard/chatbots/${chatbotId}`} className="text-blue-600 hover:underline">chatbot settings</a> page to customize:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Appearance (colors, fonts, logo)</li>
            <li>Welcome message</li>
            <li>Chat position (bottom-left or bottom-right)</li>
            <li>Knowledge sources</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 