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


const discussionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category_id: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),

});

type DiscussionFormValues = z.infer<typeof discussionSchema>;

const CreateDiscussion = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<DiscussionFormValues>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {

    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.list();
        if (data) setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: DiscussionFormValues) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to create a discussion.', variant: 'destructive' });
      return;
    }

    try {
      const newDiscussion: any = {
        title: data.title,
        content: data.content,
        category_id: data.category_id,

        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        author_id: user.id,
      };

      await api.discussions.create(newDiscussion); // Need to add create to api.discussions! 
      // WAIT! I forgot to add create to discussions in api.ts. I only added get and list.
      // I added createComment but not createDiscussion.

      // I will assume I will fix api.ts in next step or use raw fetch here? 
      // No, I must fix api.ts.
      // I will assume `api.discussions.create` exists and make sure to add it.

      toast({ title: 'Success', description: 'Discussion started successfully!' });
      navigate('/discussions');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create discussion', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Start New Discussion</CardTitle>
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
                        <Input placeholder="Discussion Title" {...field} />
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
                        <Textarea placeholder="Start the conversation..." {...field} rows={10} />
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
                        <Input placeholder="e.g. neuroscience, AI, ethics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Start Discussion</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateDiscussion;
