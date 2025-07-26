import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Calendar, User, Eye } from 'lucide-react';
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
  profiles: {
    username: string;
    full_name: string;
  };
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
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, full_name),
          categories:category_id (name, color)
        `)
        .eq('published_at', 'not.is.null')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
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

  const featuredArticles = filteredArticles.filter(article => article.is_featured);
  const regularArticles = filteredArticles.filter(article => !article.is_featured);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gradient">Research Articles</h1>
              <p className="text-muted-foreground">
                Discover the latest breakthroughs in neuroscience research
              </p>
            </div>
            {user && (
              <Link to="/articles/new">
                <Button className="btn-neural mt-4 md:mt-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Article
                </Button>
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles, tags, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="card-neural animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Articles */}
              {featuredArticles.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center">
                    <span className="text-gradient">Featured Articles</span>
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {featuredArticles.map((article) => (
                      <Card key={article.id} className="card-neural hover:scale-105 transition-transform duration-300">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2 line-clamp-2">
                                {article.title}
                              </CardTitle>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {article.profiles?.full_name || article.profiles?.username || 'Anonymous'}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(article.published_at).toLocaleDateString()}
                                </div>
                              </div>
                              {article.categories && (
                                <Badge 
                                  variant="secondary" 
                                  style={{ backgroundColor: `${article.categories.color}20` }}
                                  className="mb-2"
                                >
                                  {article.categories.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4 line-clamp-3">
                            {article.excerpt}
                          </CardDescription>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {article.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Link to={`/articles/${article.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="mr-2 h-4 w-4" />
                              Read Article
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Articles */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-gradient">
                  Latest Research
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularArticles.map((article) => (
                    <Card key={article.id} className="card-neural hover:scale-105 transition-transform duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">
                          {article.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {article.profiles?.full_name || article.profiles?.username || 'Anonymous'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(article.published_at).toLocaleDateString()}
                          </div>
                        </div>
                        {article.categories && (
                          <Badge 
                            variant="secondary" 
                            style={{ backgroundColor: `${article.categories.color}20` }}
                            className="w-fit"
                          >
                            {article.categories.name}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4 line-clamp-3">
                          {article.excerpt}
                        </CardDescription>
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {article.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Link to={`/articles/${article.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            Read More
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {filteredArticles.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No articles found matching your search.</p>
                  {user && (
                    <Link to="/articles/new">
                      <Button className="btn-neural">
                        <Plus className="mr-2 h-4 w-4" />
                        Be the first to publish
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Articles;