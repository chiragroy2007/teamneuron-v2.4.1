import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Search, Plus, Calendar, MessageSquare, Pin, ArrowRight } from 'lucide-react';
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
  profiles?: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  } | null;
  categories: {
    name: string;
    color: string;
  };
  comments?: { count: number }[];
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
      // Step 1: Fetch all discussions from API
      const discussionsData = await api.discussions.list(50);

      if (!discussionsData || discussionsData.length === 0) {
        setDiscussions([]);
        return;
      }

      // Step 2: Get all unique author IDs
      const authorIds = [...new Set(discussionsData.map((discussion: any) => discussion.author_id))] as string[];

      // Step 3: Fetch the profiles for those author IDs
      let profilesMap = new Map();
      if (authorIds.length > 0) {
        const profilesData = await api.profiles.getBatch(authorIds);
        profilesMap = new Map(profilesData.map((profile: any) => [profile.user_id, profile]));
      }

      // Step 4: Combine the discussions with their author profiles
      const discussionsWithAuthors = discussionsData.map((discussion: any) => ({
        ...discussion,
        profiles: profilesMap.get(discussion.author_id) || null,
        comments: discussion.comments_count ? Array(parseInt(discussion.comments_count)).fill({ count: 1 }) : [] // Mocking the array structure for compatibility if needed, or better, update the interface.
        // Actually, let's just make sure the interface supports 'comments_count' or we map it to 'comments' length.
        // The display uses `discussion.comments?.length`. So if I mock an array of that length, it works.
      }));

      setDiscussions(discussionsWithAuthors);

    } catch (error: any) {
      console.error("API fetch error:", error);
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
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Scientific Discussions</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Engage with the neuroscience community on cutting-edge topics
              </p>
            </div>
            {user && (
              <Link to="/discussions/new">
                <Button size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Discussion
                </Button>
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search discussions, topics, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse border-neutral-200">
                  <CardHeader>
                    <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                    <div className="flex space-x-4">
                      <div className="h-4 bg-neutral-100 rounded w-20"></div>
                      <div className="h-4 bg-neutral-100 rounded w-24"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-100 rounded"></div>
                      <div className="h-4 bg-neutral-100 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pinned Discussions */}
              {pinnedDiscussions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    Pinned
                  </h2>
                  <div className="grid gap-4">
                    {pinnedDiscussions.map((discussion) => (
                      <DiscussionCard key={discussion.id} discussion={discussion} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Discussions */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Discussions
                </h2>
                <div className="grid gap-4">
                  {regularDiscussions.map((discussion) => (
                    <DiscussionCard key={discussion.id} discussion={discussion} />
                  ))}
                </div>
              </div>

              {filteredDiscussions.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 mb-4">
                    <MessageSquare className="h-6 w-6 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900">No discussions found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search terms or start a new discussion.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Extracted Card Component for reusability and cleaner code
const DiscussionCard = ({ discussion }: { discussion: Discussion }) => (
  <Card className="group border border-neutral-200 bg-white transition-all hover:border-neutral-900">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={discussion.profiles?.avatar_url} />
                <AvatarFallback className="text-[9px]">
                  {discussion.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-neutral-700">
                {discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous'}
              </span>
            </div>
            <span>•</span>
            <span>
              {new Date(discussion.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              })}
            </span>
            {discussion.categories && (
              <>
                <span>•</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-normal bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-0"
                >
                  {discussion.categories.name}
                </Badge>
              </>
            )}
          </div>

          <Link to={`/discussions/${discussion.id}`} className="block">
            <CardTitle className="text-lg font-semibold leading-tight group-hover:underline underline-offset-4 decoration-neutral-400">
              {discussion.title}
            </CardTitle>
          </Link>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-neutral-100/50 px-2 py-1 rounded-full">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{discussion.comments?.length || 0}</span>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
        {discussion.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {discussion.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-muted-foreground bg-neutral-100 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
        <Link
          to={`/discussions/${discussion.id}`}
          className="text-xs font-medium flex items-center gap-1 text-neutral-900 hover:text-neutral-600 transition-colors"
        >
          Join Discussion <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </CardContent>
  </Card>
);

export default Discussions;