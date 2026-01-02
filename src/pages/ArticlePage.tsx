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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <header className="mb-8">
            {article.categories && (
              <Badge style={{ backgroundColor: `${article.categories.color}20` }} className="mb-2">
                {article.categories.name}
              </Badge>
            )}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">{article.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={article.profiles?.avatar_url || ''} alt={article.profiles?.username || 'author'} />
                  <AvatarFallback>{article.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{article.profiles?.full_name || article.profiles?.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.published_at || article.created_at}>
                  {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
            </div>
          </header>

          {article.featured_image && (
            <img src={article.featured_image} alt={article.title} className="w-full h-auto rounded-lg mb-8" />
          )}

          <RichTextEditor
            content={article.content}
            editable={false}
            className="border-none"
          />

          {article.tags && article.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </Layout>
  );
};

export default ArticlePage;
