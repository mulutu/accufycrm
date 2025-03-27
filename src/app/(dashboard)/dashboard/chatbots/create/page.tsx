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
import { EmbedCode } from '@/components/dashboard/embed-code';

interface FormData {
  name: string;
  description: string;
  logo: File | null;
  logoUrl: string;
  avatar: File | null;
  avatarUrl: string;
  websiteUrl: string;
  primaryColor: string;
  bubbleMessage: string;
  instructions: string;
  welcomeMessage: string;
  documents: File[];
  isDarkMode: boolean;
}

export default function CreateChatbotPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('configure');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    logo: null,
    logoUrl: '',
    avatar: null,
    avatarUrl: '',
    websiteUrl: '',
    primaryColor: '#000000',
    bubbleMessage: 'Chat with us!',
    instructions: '',
    welcomeMessage: 'Hello! I\'m your AI assistant. How can I help you today?',
    documents: [],
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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: file, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, logo: null, logoUrl: '' }));
    }
  };

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: file, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, avatar: null, avatarUrl: '' }));
    }
  };

  const handleNext = () => {
    switch (currentTab) {
      case 'configure':
        setCurrentTab('customize');
        break;
      case 'customize':
        setCurrentTab('train');
        break;
      case 'train':
        setCurrentTab('embed');
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentTab) {
      case 'customize':
        setCurrentTab('configure');
        break;
      case 'train':
        setCurrentTab('customize');
        break;
      case 'embed':
        setCurrentTab('train');
        break;
      default:
        break;
    }
  };

  const handleDocumentUpload = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 5242880; // 5MB

      if (!isValidType) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a valid file type. Please upload PDF, DOC, DOCX, or TXT files.`,
          variant: 'destructive',
        });
      }
      if (!isValidSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is too large. Maximum file size is 5MB.`,
          variant: 'destructive',
        });
      }

      return isValidType && isValidSize;
    });

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles]
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleDocumentUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleDocumentUpload(files);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Chatbot</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={currentTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="configure">Configure</TabsTrigger>
                <TabsTrigger value="customize">Customize</TabsTrigger>
                <TabsTrigger value="train">Train</TabsTrigger>
                <TabsTrigger value="embed">Embed</TabsTrigger>
              </TabsList>

              {/* Configure Tab */}
              <TabsContent value="configure" className="space-y-4">
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
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Input
                    id="welcomeMessage"
                    name="welcomeMessage"
                    value={formData.welcomeMessage}
                    onChange={handleChange}
                    placeholder="Enter the first message users will see when they start a chat..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This message will appear when users first open the chat
                  </p>
                </div>

                <div>
                  <Label htmlFor="bubbleMessage">Bubble Message</Label>
                  <Input
                    id="bubbleMessage"
                    name="bubbleMessage"
                    value={formData.bubbleMessage}
                    onChange={handleChange}
                    placeholder="Hi! 👋 Click me to start chatting"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This message will appear on the chat bubble button
                  </p>
                </div>

                <div>
                  <Label htmlFor="instructions">Chatbot Instructions</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Enter instructions for how the chatbot should behave..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Customize Tab */}
              <TabsContent value="customize" className="space-y-4">
                <FileUpload
                  label="Logo"
                  value={formData.logoUrl}
                  onChange={handleLogoChange}
                  accept="image/*"
                  maxSize={5242880} // 5MB
                />

                <div>                  
                  <FileUpload
                    label="Avatar"                    
                    value={formData.avatarUrl}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    maxSize={5242880} // 5MB
                  />
                </div>

                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose a color that represents your brand.
                  </p>
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="h-10"
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Train Tab */}
              <TabsContent value="train" className="space-y-4">
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

                <Card>
                  <CardHeader>
                    <CardTitle>Upload Documents (Q&As, FAQs, Product Info, etc.)</CardTitle>
                    <CardDescription>
                      Upload PDF, DOC, DOCX, or TXT files to train your chatbot
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('document-upload')?.click()}
                    >
                      <input
                        id="document-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <p className="text-gray-500">Drag and drop files here</p>
                      <p className="text-sm text-gray-400 mt-2">
                        or click to select files
                      </p>
                    </div>

                    {formData.documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Uploaded Documents:</h4>
                        <div className="space-y-2">
                          {formData.documents.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    documents: prev.documents.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Embed Tab */}
              <TabsContent value="embed">
                <EmbedCode
                  chatbotId="preview"
                  name={formData.name}
                  websiteUrl={formData.websiteUrl}
                />

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Save Chatbot'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>

        {/* Right Column - Preview */}
        <div className="sticky top-6">
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
                bubbleMessage={formData.bubbleMessage}
                welcomeMessage={formData.welcomeMessage}
                isDarkMode={formData.isDarkMode}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 