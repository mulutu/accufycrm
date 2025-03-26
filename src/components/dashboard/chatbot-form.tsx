'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DocumentUpload } from './document-upload';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  websiteUrl: z.string().url('Please enter a valid URL').optional(),
  logo: z.any().optional(),
  avatar: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ChatbotForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      websiteUrl: '',
    },
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'avatar',
    setPreview: (preview: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        form.setError(field, { message: 'Please upload an image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        form.setError(field, { message: 'Image size should be less than 5MB' });
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      form.setValue(field, file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      setError('');

      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      
      // Add website URL if provided
      if (values.websiteUrl) {
        formData.append('websiteUrl', values.websiteUrl);
      }

      // Add logo if provided
      if (values.logo) {
        formData.append('logo', values.logo);
      }

      // Add avatar if provided
      if (values.avatar) {
        formData.append('avatar', values.avatar);
      }
      
      // Append each document
      documents.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await fetch('/api/chatbots', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create chatbot');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter chatbot name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter chatbot description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com" 
                  {...field} 
                  type="url"
                />
              </FormControl>
              <p className="text-sm text-gray-500">
                Enter a website URL to scrape content from. The chatbot will use this content as part of its knowledge base.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="logo"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Logo (Optional)</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'logo', setLogoPreview)}
                      {...field}
                    />
                    {logoPreview && (
                      <div className="relative w-32 h-32">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatar"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Avatar (Optional)</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'avatar', setAvatarPreview)}
                      {...field}
                    />
                    {avatarPreview && (
                      <div className="relative w-32 h-32">
                        <Image
                          src={avatarPreview}
                          alt="Avatar preview"
                          fill
                          className="object-contain rounded-full"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormLabel>Knowledge Base Documents</FormLabel>
          <DocumentUpload
            onDocumentsSelected={(files) => setDocuments(prev => [...prev, ...files])}
            maxFiles={5}
          />
        </div>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Chatbot'}
        </Button>
      </form>
    </Form>
  );
} 