import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout/Layout';

import RichTextEditor from '@/components/ui/rich-text-editor';
import { ClubSelector } from '@/components/clubs/ClubSelector';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  featured_image: z.string().optional(),
  club_id: z.string().optional(),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const CreateArticle = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      club_id: '',
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.list();
        if (data) setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: ArticleFormValues) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to create an article.', variant: 'destructive' });
      return;
    }

    try {
      const articleData: any = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category_id: data.category_id,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        featured_image: data.featured_image,
        author_id: user.id,
        // published_at handled by server
      };

      // Only add club_id if it's provided
      if (data.club_id) {
        articleData.club_id = data.club_id;
      }

      await api.articles.create(articleData);

      toast({ title: 'Success', description: 'Article created successfully!' });
      navigate('/articles');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create article', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Publish Article</h1>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">Share your research findings, insights, or protocols with the community.</p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-neutral-700">Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Article Title"
                          {...field}
                          className="h-12 text-lg font-medium border-neutral-200 focus:border-neutral-900 transition-colors placeholder:text-neutral-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Excerpt */}
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-neutral-700">Abstract / Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief summary of your article..."
                          {...field}
                          className="min-h-[80px] border-neutral-200 focus:border-neutral-900 transition-colors placeholder:text-neutral-300 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold text-neutral-700">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 border-neutral-200 focus:border-neutral-900">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold text-neutral-700">Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. neuroscience, AI"
                            {...field}
                            className="h-10 border-neutral-200 focus:border-neutral-900 placeholder:text-neutral-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="featured_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-neutral-700">Featured Image URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://..."
                            {...field}
                            className="h-10 border-neutral-200 focus:border-neutral-900 placeholder:text-neutral-300 flex-1"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && user) {
                                  try {
                                    // Import dynamically to avoid circular dependencies if any, 
                                    // though direct import is fine here since utils is separate.
                                    const { uploadImage } = await import('@/utils/imageUpload');
                                    const result = await uploadImage(file, user.id);
                                    if (result.success && result.url) {
                                      field.onChange(result.url);
                                      toast({ title: 'Image uploaded', description: 'Featured image set successfully' });
                                    } else {
                                      toast({ title: 'Upload failed', description: result.error, variant: 'destructive' });
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
                                  }
                                }
                              }}
                            />
                            <Button type="button" variant="outline" className="h-10 px-4 border-neutral-200">
                              Upload
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="club_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-neutral-700">Publish to Club (Optional)</FormLabel>
                      <ClubSelector
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content Editor */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-neutral-700">Content</FormLabel>
                      <FormControl>
                        <div className="border border-neutral-200 rounded-md overflow-hidden focus-within:border-neutral-900 transition-colors">
                          <RichTextEditor
                            content={field.value}
                            onChange={field.onChange}
                            placeholder="Write your article here..."
                            className="min-h-[400px] border-none focus:ring-0"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-6 border-t border-neutral-100">
                  <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800 text-white min-w-[150px]">
                    Publish Article
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateArticle;
