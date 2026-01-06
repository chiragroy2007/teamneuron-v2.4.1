import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

// Define types locally if Supabase types aren't easily imported/referenced correctly in this context
// Or use 'any' if necessary to unblock, but matching previous structure is better.
type Discussion = any;

const DiscussionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const fetchDiscussion = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const discussionData = await api.discussions.get(id);

      if (!discussionData) throw new Error('Discussion not found');

      // Sort comments properly if needed (backend sorts by created_at ASC already)
      // Ensure profiles are attached (backend does this)

      setDiscussion(discussionData);

    } catch (error) {
      console.error('Error fetching discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !user || user.id !== discussion?.author_id) return;

    const isConfirmed = window.confirm('Are you sure you want to delete this discussion?');
    if (!isConfirmed) return;

    try {
      // We need api.discussions.delete(id)
      // TODO: Implement delete in api.ts and server
      // For now, let's keep it as is or comment out/implement later.
      // Assuming I'll implement it:
      // await api.discussions.delete(id);
      toast({ title: 'Error', description: "Delete not implemented yet on server", variant: "destructive" });

      // toast({ title: 'Success', description: 'Discussion deleted.' });
      // navigate('/discussions');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !id || !newComment.trim()) return;

    try {
      await api.comments.create({
        content: newComment,
        discussion_id: id
      });

      setNewComment('');
      fetchDiscussion(); // Refresh comments
      toast({ title: 'Success', description: 'Comment posted!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to post comment', variant: 'destructive' });
    }
  };

  if (loading) {
    return <Layout><div className="container mx-auto px-4 py-8 text-center">Loading...</div></Layout>;
  }

  if (!discussion) {
    return <Layout><div className="container mx-auto px-4 py-8 text-center">Discussion not found.</div></Layout>;
  }

  return (
    <Layout>
      <SEO
        title={discussion.title}
        description={discussion.content ? discussion.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Join the discussion on TeamNeuron.'}
        type="article"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              {discussion.categories && (
                <Badge style={{ backgroundColor: `${discussion.categories.color}20` }}>
                  {discussion.categories.name}
                </Badge>
              )}
              {discussion.is_pinned && <Badge variant="destructive">Pinned</Badge>}
            </div>
            <div className="flex justify-between items-start">
              <CardTitle className="text-3xl mt-2">{discussion.title}</CardTitle>
              {user && user.id === discussion.author_id && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={discussion.profiles?.avatar_url || ''} alt={discussion.profiles?.username || 'author'} />
                  <AvatarFallback>{discussion.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={discussion.created_at}>
                  {new Date(discussion.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none mb-8" dangerouslySetInnerHTML={{ __html: discussion.content }} />
            {discussion.tags && discussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {discussion.tags.map((tag: any, index: number) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Comments ({discussion.comments ? discussion.comments.length : 0})</h3>
          <div className="space-y-6">
            {discussion.comments && discussion.comments.map((comment: any) => (
              <Card key={comment.id} className="bg-muted/50">
                <CardHeader className='flex-row items-center gap-4 pb-2'>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.profiles?.avatar_url || ''} alt={comment.profiles?.username || 'commenter'} />
                    <AvatarFallback>{comment.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{comment.profiles?.full_name || comment.profiles?.username || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {user && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Join the Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  rows={4}
                />
                <Button onClick={handleCommentSubmit} className="mt-4">Post Comment</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DiscussionPage;
