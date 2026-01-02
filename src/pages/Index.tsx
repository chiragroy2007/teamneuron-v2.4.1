import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/Layout/Layout';
import { FileText, MessageSquare, Users } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  type Post = {
    id: string;
    created_at: string;
    title: string;
    excerpt?: string;
    content?: string;
    tags?: string[];
    profiles?: {
      user_id: string;
      username: string;
      full_name?: string;
      avatar_url?: string;
    } | null;
    type: 'article' | 'discussion';
  };

  const [feed, setFeed] = useState<Post[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [researchers, setResearchers] = useState<any[]>([]);

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        const data = await api.profiles.getRandom(4);
        setResearchers(data || []);
      } catch (error) {
        console.error('Error fetching researchers:', error);
      }
    };

    if (user) {
      fetchData();
      fetchResearchers();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [articlesData, discussionsData, categoriesData] = await Promise.all([
        api.articles.list(5),
        api.discussions.list(5),
        api.categories.list(6),
      ]);

      const articlesRes = { data: articlesData, error: null };
      const discussionsRes = { data: discussionsData, error: null };
      const categoriesRes = { data: categoriesData, error: null };

      if (articlesRes.error) throw articlesRes.error;
      if (discussionsRes.error) throw discussionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      const articles = (articlesRes.data || []).map((a) => ({
        ...a,
        type: 'article' as const,
      }));

      const discussions = (discussionsRes.data || []).map((d) => ({
        ...d,
        type: 'discussion' as const,
        excerpt: d.content?.substring(0, 150) + '...',
      }));

      const combinedContent = [...articles, ...discussions];

      const authorIds = [...new Set(combinedContent.map((item) => item.author_id))];

      if (authorIds.length > 0) {
        const profilesData = await api.profiles.getBatch(authorIds);

        const profilesMap = new Map(profilesData.map((p: any) => [p.user_id, p]));

        const combinedFeed = combinedContent
          .map((item) => ({
            ...item,
            profiles: profilesMap.get(item.author_id) || null,
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          );

        setFeed(combinedFeed as Post[]);
      } else {
        const feedWithProfiles = combinedContent
          .map((item) => ({ ...item, profiles: null }))
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          );
        setFeed(feedWithProfiles as Post[]);
      }

      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          {/* Top bar */}
          <section className="border-b pb-3 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="hidden h-2 w-2 rounded-full bg-emerald-500 md:inline-block" />
                <span className="font-medium text-foreground">Feed</span>
                <span className="hidden sm:inline-block text-[11px]">
                  Recent articles & discussions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-[11px] sm:inline-block">Signed in as</span>
                <span className="max-w-[220px] truncate font-medium text-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          </section>

          {/* Main layout: dominant left column */}
          <div className="grid grid-cols-12 gap-6 py-4">
            {/* Left: Quick actions + Articles (dominant) */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              {/* Quick actions */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                  <Link to="/articles">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex w-full items-center justify-between"
                    >
                      <span className="flex items-center text-xs sm:text-sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Write article
                      </span>
                      <span className="hidden text-[11px] text-muted-foreground sm:inline">
                        5 min
                      </span>
                    </Button>
                  </Link>
                  <Link to="/collaborate">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex w-full items-center justify-between"
                    >
                      <span className="flex items-center text-xs sm:text-sm">
                        <Users className="mr-2 h-4 w-4" />
                        Find collaborators
                      </span>
                      <span className="hidden text-[11px] text-muted-foreground sm:inline">
                        Ongoing
                      </span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Articles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-0.5 bg-foreground" />
                    <h2 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">
                      Articles
                    </h2>
                  </div>
                  <Link
                    to="/articles"
                    className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
                  >
                    View all
                  </Link>
                </div>

                {feed
                  .filter((item) => item.type === 'article')
                  .map((article) => (
                    <Card
                      key={article.id}
                      className="border border-neutral-200 bg-white transition-colors hover:border-neutral-900"
                    >
                      <CardHeader>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              {article.profiles?.avatar_url ? (
                                <img
                                  src={article.profiles.avatar_url}
                                  alt={article.profiles.username || ''}
                                  className="rounded-full"
                                />
                              ) : (
                                <AvatarFallback>
                                  {article.profiles?.username?.charAt(0).toUpperCase() ||
                                    'U'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {article.profiles?.full_name ||
                                  article.profiles?.username ||
                                  'Anonymous'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(article.created_at).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <CardTitle className="text-base font-semibold leading-snug tracking-tight">
                          <Link
                            to={`/articles/${article.id}`}
                            className="line-clamp-2 underline-offset-4 hover:underline"
                          >
                            {article.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                          {article.excerpt}
                        </p>
                        {article.tags && article.tags.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            {article.tags && article.tags.length > 0 && (
                              <span className="truncate">
                                {article.tags.slice(0, 2).join(' · ')}
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/articles/${article.id}`}
                            className="text-[11px] font-medium text-neutral-900 underline-offset-4 hover:underline"
                          >
                            Read
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Right: Discussions + Active researchers stacked (secondary) */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {/* Discussions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-0.5 bg-foreground" />
                    <h2 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">
                      Discussions
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/discussions"
                      className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
                    >
                      View all
                    </Link>
                    <Link to="/discussions">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-1.5 text-[10px]"
                      >
                        <MessageSquare className="mr-0.5 h-3 w-3" />
                        Start
                      </Button>
                    </Link>
                  </div>
                </div>

                {feed
                  .filter((item) => item.type === 'discussion')
                  .slice(0, 1)
                  .map((discussion) => (
                    <Card
                      key={discussion.id}
                      className="border border-neutral-200 bg-white transition-colors hover:border-neutral-900"
                    >
                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-neutral-100 text-neutral-600 font-normal">
                              Recent
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(discussion.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/discussions/${discussion.id}`}
                          className="block mb-2"
                        >
                          <h3 className="text-sm font-semibold leading-tight hover:underline underline-offset-4">
                            {discussion.title}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={discussion.profiles?.avatar_url} />
                            <AvatarFallback className="text-[8px]">
                              {discussion.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[100px]">
                            {discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Active researchers below discussions */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">
                    Active researchers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {researchers.map((researcher) => (
                    <div key={researcher.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {researcher.username
                            ?.substring(0, 2)
                            .toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {researcher.full_name || researcher.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {researcher.expertise?.join(', ') || 'General research'}
                        </p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Featured Club */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight uppercase text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Featured Club
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white font-bold">
                      I
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium leading-none">
                        IISER TPT Club
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Join the premier research community for IISER Tirupati.
                      </p>
                      <Link to="/clubs/iisertirupati">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 w-full text-xs"
                        >
                          View Club
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
