import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar } from 'lucide-react';

import RichTextEditor from '@/components/ui/rich-text-editor';

type Article = any;

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        const articleData = await api.articles.get(id);

        if (!articleData) throw new Error('Article not found');

        // Backend now returns profiles object nested, matching the structure
        setArticle(articleData);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <Layout><div className="container mx-auto px-4 py-8 text-center">Loading...</div></Layout>;
  }

  if (!article) {
    return <Layout><div className="container mx-auto px-4 py-8 text-center">Article not found.</div></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container max-w-3xl mx-auto px-4">
          <article className="prose prose-neutral max-w-none">
            <header className="mb-10 text-center not-prose">
              {article.categories && (
                <div className="flex justify-center mb-6">
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border-neutral-200 text-neutral-600 bg-neutral-50"
                  >
                    {article.categories.name}
                  </Badge>
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <AvatarImage src={article.profiles?.avatar_url || ''} alt={article.profiles?.username || 'author'} />
                    <AvatarFallback className="bg-neutral-100 text-neutral-600">{article.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-neutral-900">{article.profiles?.full_name || article.profiles?.username}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
                <div className="flex items-center gap-2">
                  <time dateTime={article.published_at || article.created_at}>
                    {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                </div>
              </div>
            </header>

            {article.featured_image && (
              <div className="mb-12 rounded-xl overflow-hidden border border-neutral-100 shadow-sm">
                <img src={article.featured_image} alt={article.title} className="w-full h-auto object-cover" />
              </div>
            )}

            <div className="mt-8">
              <RichTextEditor
                content={article.content}
                editable={false}
                className="border-none focus:ring-0 [&_.ProseMirror]:px-0 [&_.ProseMirror]:text-lg [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-neutral-800"
              />
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-neutral-100 not-prose">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
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
};

export default ArticlePage;
