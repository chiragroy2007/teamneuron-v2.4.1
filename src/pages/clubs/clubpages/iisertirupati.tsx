import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  UserPlus,
  UserMinus,
  Send,
} from "lucide-react";

import Layout from "@/components/Layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
// import {
//   joinClub,
//   leaveClub,
//   getClubMembers,
//   isUserMember,
//   getMemberCount,
//   createClubPost,
//   getClubPosts,
// } from "@/lib/clubs";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const IiserTirupatiClub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [memberCount, setMemberCount] = useState(0);

  const club = {
    id: "iiser-tirupati",
    name: "IISER Tirupati Research Club",
    description:
      "A research club for IISER Tirupati students and faculty to collaborate on scientific projects, share knowledge, and discuss the latest research developments.",
    tags: ["Research", "Science", "IISER", "Tirupati"],
    logo: "/images/iiser-tirupati-logo.png",
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load membership status
        if (user) {
          const { isMember: memberStatus } = await api.clubs.isMember(
            club.id,
            user.id,
          );
          setIsMember(memberStatus);
        } else {
          setIsMember(false);
        }

        // Load members and posts
        const [membersData, postsData] = await Promise.all([
          api.clubs.getMembers(club.id),
          api.clubs.getPosts(club.id)
        ]);

        const count = membersData ? membersData.length : 0;

        setMemberCount(count);
        // Check if user is in members list (fallback/double-check)
        if (user && membersData) {
          const userInList = membersData.some(m =>
            (m.user?.id === user.id) || (m.user_id === user.id)
          );

          if (userInList) {
            setIsMember(true);
          }
        }
      } catch (error) {
        console.error("Error loading club data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleJoinLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const wasMember = isMember;

      // Optimistic update
      setIsMember(!wasMember);
      setMemberCount((prev) => (wasMember ? Math.max(0, prev - 1) : prev + 1));

      // API call
      if (wasMember) {
        await api.clubs.leave(club.id);
      } else {
        await api.clubs.join(club.id);
      }

      // Refresh members list
      try {
        const membersData = await api.clubs.getMembers(club.id);
        setMembers(membersData || []);
      } catch (refreshError) {
        console.error("Error refreshing members list:", refreshError);
      }

    } catch (error: any) {
      console.error("Error updating membership:", error);
      console.log("Error details:", JSON.stringify(error));

      // Smart error handling
      if (error?.error === 'Already a member' || error?.message === 'Already a member') {
        console.log("Caught 'Already a member'. Forcing joined state.");
        setIsMember(true);
        // Force refresh members just in case
        api.clubs.getMembers(club.id).then(d => setMembers(d || []));
      } else {
        // Revert on other errors
        setIsMember((prev) => !prev);
        setMemberCount((prev) => prev);
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim()) return;

    const postContent = newPost.trim();
    setNewPost("");

    // Optimistic update
    const tempId = Date.now().toString();
    const newPostObj = {
      id: tempId,
      content: postContent,
      created_at: new Date().toISOString(),
      user: {
        id: user.id,
        username:
          user.username || user.email?.split("@")[0] || "user",
        avatar_url: user.avatar_url ?? null,
      },
    };

    setPosts((prev) => [newPostObj, ...prev]);

    try {
      const savedPost = await api.clubs.createPost(
        club.id,
        postContent,
      );

      if (!savedPost) throw new Error("Failed to create post");

      // Replace the temporary post with the saved one
      setPosts((prev) => [
        savedPost,
        ...prev.filter((p) => p.id !== tempId),
      ]);
    } catch (error) {
      console.error("Error creating post:", error);
      // Remove the optimistic update on error
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-background min-h-screen">
          <div className="mx-auto flex h-64 max-w-7xl items-center justify-center px-4 sm:px-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
          {/* Top bar */}
          <section className="border-b pb-3 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="hidden h-2 w-2 rounded-full bg-emerald-500 md:inline-block" />
                <span className="font-medium text-foreground">
                  {club.name}
                </span>
                <span className="hidden text-[11px] sm:inline-block">
                  Campus research community hub
                </span>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <span className="hidden text-[11px] sm:inline-block">
                    Signed in as
                  </span>
                  <span className="max-w-[220px] truncate font-medium text-foreground">
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Main layout */}
          <div className="grid gap-6 py-4 md:grid-cols-12">
            {/* Left column: club overview & members */}
            <div className="space-y-4 md:col-span-5">
              <Card className="glass-card border-neutral-200 bg-neutral-50/60">
                <div className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-neutral-50">
                        {club.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="text-base font-semibold leading-tight">
                          {club.name}
                        </h1>
                        <div className="mt-1 flex items-center text-[11px] text-muted-foreground">
                          <Users className="mr-1 h-3 w-3" />
                          <span>{memberCount} members</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs"
                      variant={isMember ? "outline" : "default"}
                      onClick={handleJoinLeave}
                    >
                      {isMember ? (
                        <>
                          <UserMinus className="mr-1 h-3 w-3" />
                          Leave
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-1 h-3 w-3" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {club.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {club.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="glass-card border-neutral-200 bg-neutral-50/60">
                <div className="border-b px-4 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                    Members
                  </h2>
                </div>
                <div className="p-4">
                  {members.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Members will appear here once people join this club.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Avatar className="h-7 w-7">
                            {member.user?.avatar_url ? (
                              <img
                                src={member.user.avatar_url}
                                alt={member.user.username}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFallback>
                                {member.user?.username
                                  ?.charAt(0)
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {member.user?.full_name || member.user?.username}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              Joined{" "}
                              {new Date(
                                member.created_at,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right column: posts */}
            <div className="space-y-4 md:col-span-7">
              {isMember && (
                <Card className="glass-card border-neutral-200 bg-neutral-50/60">
                  <div className="border-b px-4 py-3">
                    <h2 className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                      Share an update
                    </h2>
                  </div>
                  <form onSubmit={handleCreatePost} className="p-4">
                    <Textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share something with the club..."
                      className="mb-2 text-sm"
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        disabled={!newPost.trim()}
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Post
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              <Card className="glass-card border-neutral-200 bg-neutral-50/60">
                <div className="border-b px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                      Club feed
                    </h2>
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="p-4">
                  {posts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      <p>No posts yet. Be the first to share something!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <Card
                          key={post.id}
                          className="border-none bg-white/80 p-3 shadow-none"
                        >
                          <div className="flex items-start gap-2">
                            <Avatar className="h-8 w-8">
                              {post.user?.avatar_url ? (
                                <img
                                  src={post.user.avatar_url}
                                  alt={post.user.username}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <AvatarFallback>
                                  {post.user?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-xs font-medium text-foreground">
                                  {post.user?.full_name || post.user?.username}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(
                                    post.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                                {post.content}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default IiserTirupatiClub;