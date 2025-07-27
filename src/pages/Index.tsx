import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Brain, MessageSquare, FileText, Users, TrendingUp, Star, Search, Plus, Filter } from 'lucide-react';
import Layout from '@/components/Layout/Layout';

const Index = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([
    'Neural Networks', 'Machine Learning', 'Brain Imaging', 'Cognitive Science', 'Artificial Intelligence'
  ]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [articlesRes, discussionsRes, categoriesRes] = await Promise.all([
        (supabase as any).from('articles').select('*').neq('published_at', null).limit(5),
        (supabase as any).from('discussions').select('*').limit(5),
        (supabase as any).from('categories').select('*').limit(6)
      ]);

      if (articlesRes.data) setArticles(articlesRes.data);
      if (discussionsRes.data) setDiscussions(discussionsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center neural-gradient-soft">
        <Card className="glass-card w-full max-w-md p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold text-neural mb-2">TeamNeuron</h1>
          <p className="text-muted-foreground mb-6">
            Join the premier neuroscience research community
          </p>
          <Link to="/auth">
            <Button className="w-full neural-gradient text-white border-0">
              Get Started
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-neural">TeamNeuron</h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search research, discussions..."
                    className="pl-9 w-80"
                  />
                </div>
                <Button size="sm" className="neural-gradient text-white border-0">
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/articles">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Write Article
                    </Button>
                  </Link>
                  <Link to="/discussions">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Discussion
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Find Collaborators
                  </Button>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Research Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between py-1">
                      <span className="text-sm">{category.name}</span>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trending */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="col-span-12 lg:col-span-6">
              <Tabs defaultValue="feed" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="feed">Feed</TabsTrigger>
                  <TabsTrigger value="articles">Articles</TabsTrigger>
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                </TabsList>

                <TabsContent value="feed" className="space-y-4">
                  {/* Feed Items */}
                  {[...articles, ...discussions].slice(0, 8).map((item, index) => (
                    <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {item.title?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Research Team</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.content ? 'Discussion' : 'Article'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {item.excerpt || item.content?.substring(0, 120) + '...'}
                        </p>
                        {item.tags && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {Math.floor(Math.random() * 50 + 10)}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {Math.floor(Math.random() * 20 + 5)}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="articles" className="space-y-4">
                  {articles.map((article, index) => (
                    <Card key={index} className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {article.excerpt}
                        </p>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="discussions" className="space-y-4">
                  {discussions.map((discussion, index) => (
                    <Card key={index} className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-lg">{discussion.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {discussion.content?.substring(0, 120)}...
                        </p>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {/* Active Researchers */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Researchers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          Dr
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Dr. Researcher {index + 1}</p>
                        <p className="text-xs text-muted-foreground">Neuroscience</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="text-xs">
                      <p className="font-medium">New research published</p>
                      <p className="text-muted-foreground">5 minutes ago</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs">
                    <p className="font-medium">Neuroscience Symposium</p>
                    <p className="text-muted-foreground">Tomorrow, 2:00 PM</p>
                  </div>
                  <div className="text-xs">
                    <p className="font-medium">AI & Brain Workshop</p>
                    <p className="text-muted-foreground">Friday, 10:00 AM</p>
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