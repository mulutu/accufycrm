'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChatModal } from '@/components/dashboard/chat-modal';
import { Plus } from 'lucide-react';

interface Chatbot {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  websiteUrl: string;
  primaryColor: string;
  bubbleMessage: string;
  welcomeMessage: string;
  isDarkMode: boolean;
  createdAt: string;
}

export default function ChatbotsPage() {
  const { toast } = useToast();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const response = await fetch('/api/chatbots');
        if (!response.ok) {
          throw new Error('Failed to fetch chatbots');
        }
        const data = await response.json();
        setChatbots(data);
      } catch (error) {
        console.error('Error fetching chatbots:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chatbots',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatbots();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading chatbots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Chatbots</h1>
          <p className="text-muted-foreground">
            Manage and test your chatbots
          </p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/chatbots/create'}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Chatbot
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chatbots.map((chatbot) => (
          <Card key={chatbot.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                {chatbot.logoUrl && (
                  <img
                    src={chatbot.logoUrl}
                    alt={chatbot.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <CardTitle>{chatbot.name}</CardTitle>
                  <CardDescription>{chatbot.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatbot.websiteUrl && (
                  <div className="text-sm">
                    <span className="font-medium">Website:</span>{' '}
                    <a
                      href={chatbot.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {chatbot.websiteUrl}
                    </a>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = `/dashboard/chatbots/${chatbot.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setSelectedChatbot(chatbot)}
                  >
                    Test Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedChatbot && (
        <ChatModal
          isOpen={!!selectedChatbot}
          onClose={() => setSelectedChatbot(null)}
          chatbot={selectedChatbot}
        />
      )}
    </div>
  );
} 