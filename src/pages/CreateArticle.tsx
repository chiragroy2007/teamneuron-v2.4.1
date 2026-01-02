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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Article</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Article Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Write your article here..."
                          className="min-h-[400px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A short summary of the article" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. neuroscience, AI, research" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
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
                      <ClubSelector
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Publish Article</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateArticle;
