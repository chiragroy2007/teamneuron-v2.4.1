import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_id: string;
  created_at: string;
  published_at: string | null;
  is_featured: boolean;
  featured_image?: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

const Featured: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      setLoading(true);

      const data = await api.articles.list(20, true);

      if (!data || data.length === 0) {
        console.log('No featured articles found');
        setArticles([]);
        return;
      }

      setArticles(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    const text = stripHtml(content);
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Header */}
        <header className="flex flex-col gap-3 border-b pb-5 pt-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Featured articles
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Curated work from the community. A focused list of articles highlighted by the team.
          </p>
        </header>

        {/* Loading / empty states */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="inline-flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <span>Fetching featured work…</span>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-base font-medium text-foreground">No featured work yet</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Once editors feature standout articles, they will appear here with a dedicated
              highlight.
            </p>
          </div>
        ) : (
          <>
            {/* Meta row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing <span className="font-medium text-foreground">{articles.length}</span>{' '}
                featured article{articles.length > 1 ? 's' : ''}
              </span>
              <span>Sorted by publish date</span>
            </div>

            {/* Grid of cards */}
            <section className="grid gap-5 md:grid-cols-2">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="group border border-neutral-200 bg-neutral-50/60 transition-colors hover:border-neutral-900 hover:bg-white flex flex-col"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl md:text-2xl font-bold leading-tight tracking-tight mb-1">
                      <Link
                        to={`/articles/${article.id}`}
                        className="hover:underline underline-offset-4 decoration-neutral-400"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1 pb-6 pt-0">
                    {article.featured_image && (
                      <div className="mb-4 rounded-md overflow-hidden border border-neutral-100 shadow-sm">
                        <Link to={`/articles/${article.id}`}>
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-auto max-h-[500px] object-contain bg-neutral-50 transition-transform hover:scale-[1.01] duration-500"
                          />
                        </Link>
                      </div>
                    )}

                    <div className="mb-4 text-sm text-neutral-600 leading-relaxed">
                      {article.excerpt?.slice(0, 400) || truncateContent(article.content, 400)}
                      {((article.excerpt && article.excerpt.length > 400) || (!article.excerpt && article.content.length > 400)) ? '...' : ''}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                          {article.profiles?.avatar_url ? (
                            <img
                              src={article.profiles.avatar_url}
                              alt={article.profiles.username || ''}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-neutral-100 text-neutral-600 text-[10px]">
                              {article.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-neutral-900">
                            {article.profiles?.full_name || article.profiles?.username || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(article.created_at)}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/articles/${article.id}`}
                        className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                      >
                        Read Article →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Featured;
