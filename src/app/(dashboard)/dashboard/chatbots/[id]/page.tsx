'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChatbotPreview } from '@/components/chatbot-preview';
import { EmbedCode } from '@/components/dashboard/embed-code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Chatbot {
  id: string;
  uuid: string;
  name: string;
  description: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  websiteUrl: string;
  primaryColor: string;
  bubbleMessage: string;
  welcomeMessage: string;
  instructions: string | null;
  isDarkMode: boolean;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export default function ChatbotPage() {
  const params = useParams();
  const { toast } = useToast();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('preview');

  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        const response = await fetch(`/api/chatbots/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chatbot');
        }
        const data = await response.json();
        setChatbot(data);
      } catch (error) {
        console.error('Error fetching chatbot:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chatbot details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchChatbot();
    }
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading chatbot details...</p>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Chatbot Not Found</h1>
          <p className="text-muted-foreground mt-2">The chatbot you're looking for doesn't exist or has been deleted.</p>
          <Button
            className="mt-4"
            onClick={() => window.location.href = '/dashboard/chatbots'}
          >
            View All Chatbots
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{chatbot.name}</h1>
          <p className="text-muted-foreground">{chatbot.description}</p>
        </div>
        <Button
          onClick={() => window.location.href = '/dashboard/chatbots'}
        >
          View All Chatbots
        </Button>
      </div>

      <Tabs value={currentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Preview</CardTitle>
              <CardDescription>
                See how your chatbot looks on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatbotPreview
                name={chatbot.name}
                description={chatbot.description || ''}
                logoUrl={chatbot.logoUrl || ''}
                avatarUrl={chatbot.avatarUrl || ''}
                primaryColor={chatbot.primaryColor}
                bubbleMessage={chatbot.bubbleMessage}
                welcomeMessage={chatbot.welcomeMessage}
                isDarkMode={chatbot.isDarkMode}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Get the code to embed your chatbot on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmbedCode
                chatbotId={chatbot.uuid}
                name={chatbot.name}
                websiteUrl={chatbot.websiteUrl}
                primaryColor={chatbot.primaryColor}
                bubbleMessage={chatbot.bubbleMessage}
                isDarkMode={chatbot.isDarkMode}
                width={chatbot.width}
                height={chatbot.height}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 