import React, { useEffect, useState } from 'react';
import UserManagement from '@/components/Admin/UserManagement';
import ClubManagement from '@/components/Admin/ClubManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserGrowthChart from '@/components/Admin/UserGrowthChart';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  expertise: string[];
  role?: string | null;
}

interface Article {
  id: string;
  title: string;
  author_id: string;
  created_at: string;
  published_at: string | null;
  is_featured?: boolean;
}

interface Discussion {
  id: string;
  title: string;
  author_id: string;
  created_at: string;
  is_pinned?: boolean;
}

const Admin: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch profile
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const data = await api.auth.me();
        setProfile(data);
      } catch (error) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAll();
    // eslint-disable-next-line
  }, [profile]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const articlesData = await api.articles.list(100); // Fetch more for admin
      const discussionsData = await api.discussions.list(100);

      setArticles(articlesData || []);
      setDiscussions(discussionsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: 'article' | 'discussion', id: string) => {
    if (!window.confirm('Are you sure you want to delete this ' + type + '?')) return;
    setLoading(true);
    setError(null);
    try {
      if (type === 'article') {
        await api.articles.delete(id);
      } else {
        await api.discussions.delete(id);
      }
      toast({ title: 'Success', description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted.` });
      fetchAll();
    } catch (err: any) {
      console.error('Delete catch error:', err);
      setError(err.message || 'Failed to delete');
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  // Placeholder for edit handlers
  const handleEdit = (type: 'article' | 'discussion', id: string) => {
    toast({ title: 'Edit', description: `Edit ${type} ${id} (not yet implemented)` });
    // TODO: Implement edit modal or navigation
  };

  if (!profile || profile.role !== 'admin') {
    return null; // Or loading spinner
  }

  return (
    <Layout>
      <div className="container mx-auto py-10 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-neutral-500 mb-8">Manage the platform content, users, and communities.</p>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Total Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{articles.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Total Discussions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{discussions.length}</div>
                </CardContent>
              </Card>
              {/* Replaced System Status with User Growth Chart */}
              <UserGrowthChart />
            </div>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle>Manage Articles</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && articles.length === 0 ? (
                  <div>Loading...</div>
                ) : articles.length === 0 ? (
                  <div>No articles found.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {articles.map((article) => (
                      <li key={article.id} className="flex items-center justify-between py-3">
                        <span className="font-medium text-sm md:text-base truncate max-w-[200px] md:max-w-md">{article.title}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-400 hidden md:block">{new Date(article.created_at).toLocaleDateString()}</span>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!article.is_featured}
                              onChange={async (e) => {
                                setLoading(true);
                                try {
                                  await api.articles.update(article.id, { is_featured: e.target.checked });
                                  toast({ title: 'Success', description: `Article ${e.target.checked ? 'featured' : 'unfeatured'}.` });
                                  fetchAll();
                                } catch (error: any) {
                                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                                }
                                setLoading(false);
                              }}
                            />
                            <span className="text-xs">Featured</span>
                          </label>
                          <Button variant="outline" size="sm" onClick={() => handleEdit('article', article.id)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete('article', article.id)}>
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions">
            <Card>
              <CardHeader>
                <CardTitle>Manage Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && discussions.length === 0 ? (
                  <div>Loading...</div>
                ) : discussions.length === 0 ? (
                  <div>No discussions found.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {discussions.map((discussion) => (
                      <li key={discussion.id} className="flex items-center justify-between py-3">
                        <span className="font-medium text-sm md:text-base truncate max-w-[200px] md:max-w-md">{discussion.title}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-400 hidden md:block">{new Date(discussion.created_at).toLocaleDateString()}</span>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!discussion.is_pinned}
                              onChange={async (e) => {
                                setLoading(true);
                                try {
                                  await api.discussions.update(discussion.id, { is_pinned: e.target.checked });
                                  toast({ title: 'Success', description: `Discussion ${e.target.checked ? 'pinned' : 'unpinned'}.` });
                                  fetchAll();
                                } catch (error: any) {
                                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                                }
                                setLoading(false);
                              }}
                            />
                            <span className="text-xs">Pinned</span>
                          </label>
                          <Button variant="outline" size="sm" onClick={() => handleEdit('discussion', discussion.id)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete('discussion', discussion.id)}>
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clubs">
            <ClubManagement />
          </TabsContent>

        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500 pb-8">
          <p>TeamNeuron Dash v2.1.4</p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} Created by <a href="https://github.com/chiragroy2007" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Chirag</a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
