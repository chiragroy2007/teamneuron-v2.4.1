import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Search, Plus, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout/Layout';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  category_id: string;
  tags: string[];
  featured_image: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  profiles?: {
    user_id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
  categories: {
    name: string;
    color: string;
  };
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      // Step 1: Fetch all articles from API
      const articlesData = await api.articles.list(50); // Fetch more for the page

      if (!articlesData || articlesData.length === 0) {
        setArticles([]);
        return;
      }

      // Step 2: Get all unique author IDs
      const authorIds = [...new Set(articlesData.map((article: any) => article.author_id))] as string[];

      // Step 3: Fetch the profiles for those author IDs
      let profilesMap = new Map();
      if (authorIds.length > 0) {
        const profilesData = await api.profiles.getBatch(authorIds);
        profilesMap = new Map(profilesData.map((profile: any) => [profile.user_id, profile]));
      }

      // Step 4: Combine the articles with their author profiles
      const articlesWithAuthors = articlesData.map((article: any) => ({
        ...article,
        profiles: profilesMap.get(article.author_id) || null
      }));

      setArticles(articlesWithAuthors);

    } catch (error: any) {
      console.error("API fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Research Articles</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Discover the latest breakthroughs in neuroscience research
              </p>
            </div>
            {user && (
              <Link to="/articles/new">
                <Button size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Article
                </Button>
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles, tags, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse border-neutral-200">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-neutral-100 rounded"></div>
                      <div className="h-3 bg-neutral-100 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="group flex flex-col justify-between border border-neutral-200 bg-white transition-all hover:border-neutral-900"
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

                  <CardContent className="space-y-4 pb-4">
                    {article.featured_image && (
                      <div className="mb-3 rounded-md overflow-hidden border border-neutral-100 shadow-sm">
                        <Link to={`/articles/${article.id}`}>
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-auto max-h-[500px] object-contain bg-neutral-50 transition-transform hover:scale-[1.01] duration-500"
                          />
                        </Link>
                      </div>
                    )}

                    <p className="mb-2 text-sm text-neutral-600 leading-relaxed">
                      {article.excerpt?.slice(0, 400)}{article.excerpt && article.excerpt.length > 400 ? '...' : ''}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                          <AvatarImage src={article.profiles?.avatar_url} />
                          <AvatarFallback className="bg-neutral-100 text-neutral-600 text-[10px]">
                            {article.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-neutral-900">
                            {article.profiles?.full_name || article.profiles?.username || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(article.published_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
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
            </div>
          )}

          {filteredArticles.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 mb-4">
                <Search className="h-6 w-6 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900">No articles found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search terms or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Articles;