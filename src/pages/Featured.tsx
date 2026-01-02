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
      <div className="mx-auto max-w-6xl space-y-8">
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
                  className="group flex h-full flex-col border-neutral-200 bg-neutral-50/60 transition-colors hover:border-neutral-900 hover:bg-white"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          {article.profiles?.avatar_url ? (
                            <img
                              src={article.profiles.avatar_url}
                              alt={article.profiles.username || ''}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {article.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium leading-none">
                            {article.profiles?.full_name ||
                              article.profiles?.username ||
                              'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(article.created_at)}
                            {article.published_at ? ` · Featured ${formatDate(article.published_at)}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Featured article
                      </div>
                    </div>

                    <CardTitle className="text-base font-semibold leading-snug tracking-tight">
                      <Link
                        to={`/articles/${article.id}`}
                        className="line-clamp-2 decoration-neutral-400 decoration-[0.08em] underline-offset-4 hover:underline"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <Separator className="mx-4 mb-3 mt-1" />

                  <CardContent className="flex flex-1 flex-col justify-between gap-4 pb-4 pt-0 text-sm">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {article.excerpt || truncateContent(article.content, 220)}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {article.published_at && (
                          <span className="text-[11px]">
                            Published {formatDate(article.published_at)}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/articles/${article.id}`}
                        className="text-[11px] font-medium text-neutral-900 underline-offset-4 hover:underline"
                      >
                        Read article
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
