import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface EmbedCodeProps {
  chatbotId: string;
  name: string;
  logoUrl?: string | null;
  avatarUrl?: string | null;
}

export function EmbedCode({ chatbotId, name, logoUrl, avatarUrl }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- AI Chat CRM Widget -->
<script>
  window.AI_CHAT_CRM_CONFIG = {
    chatbotId: "${chatbotId}",
    name: "${name}",
    logoUrl: "${logoUrl || ''}",
    avatarUrl: "${avatarUrl || ''}",
    theme: "light"
  };
</script>
<script src="${process.env.NEXTAUTH_URL}/widget.js"></script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embed Your Chatbot</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Copy and paste this code into your website&apos;s HTML, just before the closing &lt;/body&gt; tag:
        </p>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-gray-50">
          <pre className="text-sm">
            <code>{embedCode}</code>
          </pre>
        </ScrollArea>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 