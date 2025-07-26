import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Calendar, User, MessageSquare, Pin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout/Layout';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  };
  categories: {
    name: string;
    color: string;
  };
  comments: { count: number }[];
}

const Discussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles:author_id (username, full_name),
          categories:category_id (name, color),
          comments (count)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pinnedDiscussions = filteredDiscussions.filter(discussion => discussion.is_pinned);
  const regularDiscussions = filteredDiscussions.filter(discussion => !discussion.is_pinned);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gradient">Scientific Discussions</h1>
              <p className="text-muted-foreground">
                Engage with the neuroscience community on cutting-edge topics
              </p>
            </div>
            {user && (
              <Link to="/discussions/new">
                <Button className="btn-neural mt-4 md:mt-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Discussion
                </Button>
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search discussions, topics, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="card-neural animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="flex space-x-4">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Pinned Discussions */}
              {pinnedDiscussions.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-gradient">
                    <Pin className="mr-2 h-5 w-5" />
                    Pinned Discussions
                  </h2>
                  <div className="space-y-4">
                    {pinnedDiscussions.map((discussion) => (
                      <Card key={discussion.id} className="card-neural hover:bg-card/70 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <Pin className="h-4 w-4 text-primary mr-2" />
                                <CardTitle className="text-lg">
                                  {discussion.title}
                                </CardTitle>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous'}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(discussion.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  {discussion.comments?.length || 0} replies
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {discussion.categories && (
                                  <Badge 
                                    variant="secondary" 
                                    style={{ backgroundColor: `${discussion.categories.color}20` }}
                                  >
                                    {discussion.categories.name}
                                  </Badge>
                                )}
                                {discussion.tags && discussion.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4 line-clamp-2">
                            {discussion.content}
                          </CardDescription>
                          <Link to={`/discussions/${discussion.id}`}>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Join Discussion
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Discussions */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gradient">
                  Recent Discussions
                </h2>
                <div className="space-y-4">
                  {regularDiscussions.map((discussion) => (
                    <Card key={discussion.id} className="card-neural hover:bg-card/70 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">
                              {discussion.title}
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous'}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(discussion.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {discussion.comments?.length || 0} replies
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {discussion.categories && (
                                <Badge 
                                  variant="secondary" 
                                  style={{ backgroundColor: `${discussion.categories.color}20` }}
                                >
                                  {discussion.categories.name}
                                </Badge>
                              )}
                              {discussion.tags && discussion.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4 line-clamp-2">
                          {discussion.content}
                        </CardDescription>
                        <Link to={`/discussions/${discussion.id}`}>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Join Discussion
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {filteredDiscussions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No discussions found matching your search.</p>
                  {user && (
                    <Link to="/discussions/new">
                      <Button className="btn-neural">
                        <Plus className="mr-2 h-4 w-4" />
                        Start the conversation
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

export default Discussions;