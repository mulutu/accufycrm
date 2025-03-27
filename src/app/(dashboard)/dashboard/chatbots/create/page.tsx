'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChatbotPreview } from '@/components/chatbot-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';

interface FormData {
  name: string;
  description: string;
  logo: File | null;
  logoUrl: string;
  avatar: File | null;
  avatarUrl: string;
  websiteUrl: string;
  primaryColor: string;
  isDarkMode: boolean;
}

export default function CreateChatbotPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    logo: null,
    logoUrl: '',
    avatar: null,
    avatarUrl: '',
    websiteUrl: '',
    primaryColor: '#2563eb',
    isDarkMode: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if ((key === 'logo' || key === 'avatar') && value instanceof File) {
            formDataToSend.append(key, value);
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      const response = await fetch('/api/chatbots', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create chatbot');
      }

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Chatbot created successfully',
      });
      router.push(`/dashboard/chatbots/${data.id}`);
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chatbot',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, logo: file }));
  };

  const handleAvatarChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, avatar: file }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Chatbot</h1>
      </div>
      
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <FileUpload
                  label="Logo"
                  value={formData.logoUrl}
                  onChange={handleLogoChange}
                  accept="image/*"
                  maxSize={5242880} // 5MB
                />

                <FileUpload
                  label="Avatar"
                  value={formData.avatarUrl}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  maxSize={5242880} // 5MB
                />

                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="h-10"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDarkMode"
                    checked={formData.isDarkMode}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) => ({ ...prev, isDarkMode: checked }))
                    }
                  />
                  <Label htmlFor="isDarkMode">Dark Mode</Label>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Documents</CardTitle>
                    <CardDescription>
                      Upload PDF, DOC, DOCX, or TXT files to train your chatbot
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <p className="text-gray-500">Drag and drop files here</p>
                      <p className="text-sm text-gray-400 mt-2">
                        or click to select files
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Chatbot'}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Preview</CardTitle>
              <CardDescription>
                See how your chatbot will look on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatbotPreview
                name={formData.name || 'Your Chatbot Name'}
                description={formData.description || 'Your chatbot description'}
                logoUrl={formData.logoUrl}
                avatarUrl={formData.avatarUrl}
                primaryColor={formData.primaryColor}
                isDarkMode={formData.isDarkMode}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 