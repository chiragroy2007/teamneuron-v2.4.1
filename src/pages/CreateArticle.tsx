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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [isPreviewing, setIsPreviewing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      club_id: '',
      title: '',
      content: '',
      excerpt: '',
      category_id: '',
      tags: '',
      featured_image: ''
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

  const handleReview = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsPreviewing(true);
      window.scrollTo(0, 0);
    }
  };

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

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Category';

  if (isPreviewing) {
    const values = form.getValues();
    const tags = values.tags ? values.tags.split(',').map(t => t.trim()) : [];

    return (
      <Layout>
        <div className="min-h-screen bg-background py-16">
          <div className="container max-w-3xl mx-auto px-4">

            <div className="mb-8 flex justify-between items-center bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="font-bold">Preview Mode:</span>
                <span>Review your article before publishing.</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsPreviewing(false)}>
                  Back to Edit
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)} className="bg-neutral-900 text-white">
                  Confirm & Publish
                </Button>
              </div>
            </div>

            <article className="prose prose-neutral max-w-none bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
              <header className="mb-10 text-center not-prose">
                <div className="flex justify-center mb-6">
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border-neutral-200 text-neutral-600 bg-neutral-50"
                  >
                    {getCategoryName(values.category_id)}
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight">
                  {values.title}
                </h1>

                <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                      <AvatarImage src={user?.avatar_url || ''} />
                      <AvatarFallback className="bg-neutral-100 text-neutral-600">{user?.full_name?.charAt(0) || user?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-neutral-900">{user?.full_name || user?.username}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
                  <div className="flex items-center gap-2">
                    <time>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  </div>
                </div>
              </header>

              {values.featured_image && (
                <div className="mb-12 rounded-xl overflow-hidden border border-neutral-100 shadow-sm">
                  <img src={values.featured_image} alt={values.title} className="w-full h-auto object-cover" />
                </div>
              )}

              <div className="mt-8">
                <RichTextEditor
                  content={values.content}
                  editable={false}
                  className="border-none focus:ring-0 [&_.ProseMirror]:px-0 [&_.ProseMirror]:text-lg [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-neutral-800"
                />
              </div>

              {tags.length > 0 && (
                <div className="mt-16 pt-8 border-t border-neutral-100 not-prose">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md px-3 py-1 font-normal">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>
      </Layout>
    );
  }

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
              <form className="space-y-8">

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
                  <Button type="button" onClick={handleReview} className="bg-neutral-900 hover:bg-neutral-800 text-white min-w-[150px]">
                    Review & Publish
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
