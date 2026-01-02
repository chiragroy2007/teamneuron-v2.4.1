import React, { useEffect, useState } from 'react';
import UserManagement from '@/components/Admin/UserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout/Layout';
import { useNavigate } from 'react-router-dom';

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

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <section className="mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  {articles.length === 0 ? (
                    <div>No articles found.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {articles.map((article) => (
                        <li key={article.id} className="flex items-center justify-between py-2">
                          <span className="font-medium">{article.title}</span>
                          <span className="text-xs text-gray-400 ml-2">{new Date(article.created_at).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
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
            </section>
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Discussions</CardTitle>
                </CardHeader>
                <CardContent>
                  {discussions.length === 0 ? (
                    <div>No discussions found.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {discussions.map((discussion) => (
                        <li key={discussion.id} className="flex items-center justify-between py-2">
                          <span className="font-medium">{discussion.title}</span>
                          <span className="text-xs text-gray-400 ml-2">{new Date(discussion.created_at).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
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
            </section>
            <section className="mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
