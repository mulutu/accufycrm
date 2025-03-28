import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EmbedCodeProps {
  chatbotId: string;
  name: string;
  websiteUrl: string;
  primaryColor: string;
  bubbleMessage: string;
  isDarkMode: boolean;
  width: number;
  height: number;
}

export function EmbedCode({
  chatbotId,
  name,
  websiteUrl,
  primaryColor,
  bubbleMessage,
  isDarkMode,
  width,
  height,
}: EmbedCodeProps) {
  const { toast } = useToast();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const embedCode = `<script 
  defer 
  src="${appUrl}/vendor/chatbot/js/external-chatbot.js" 
  data-chatbot-uuid="${chatbotId}" 
  data-iframe-width="${width}" 
  data-iframe-height="${height}" >
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard',
    });
  };

  return (
    <div className="space-y-4">
      {websiteUrl ? (
        <>
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="text-sm font-medium">Website URL</span>
              </div>
              <span className="text-sm text-muted-foreground">{websiteUrl}</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-md border p-4">
              <pre className="text-sm">
                <code>{embedCode}</code>
              </pre>
            </div>
            <Button
              size="sm"
              className="absolute right-2 top-2"
              onClick={copyToClipboard}
            >
              Copy
            </Button>
          </div>

          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              </svg>
              <span>This embed code can only be used on the website URL specified above.</span>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            </svg>
            <span>Please provide a website URL in the Train tab to generate the embed code.</span>
          </div>
        </div>
      )}
    </div>
  );
} 