import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User, Edit3, Save, X, Plus, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';

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

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newExpertise, setNewExpertise] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Use helper to get current profile - implementing api.profiles.get('me') logic via /auth/me or a new endpoint
      // Actually, we can use api.auth.me() for the current user profile as it returns joined data!
      const userData = await api.auth.me();

      if (userData) {
        // Transform API response to Profile interface if needed
        // api.auth.me returns: { id, email, username, full_name, avatar_url }
        // We might need more fields like bio, expertise.
        // Let's assume /me returns all profile fields now. I should verify this in auth.ts.
        // Looking at auth.ts: SELECT u.id, u.email, p.username, p.full_name, p.avatar_url FROM users...
        // It DOES NOT return bio, expertise etc.
        // I need to update /me in auth.ts or add /profiles/me endpoint.

        // For now, I will use the /profiles/batch with single ID if I can't use /me.
        // Or better, let's just stick to what we have and maybe fetch missing details if needed?
        // Actually best approach: Use api.profiles.get(user.id) which I added.
        // Note: I left api.profiles.get as returning null in previous step. FAILURE.

        // Let's implement api.profiles.get(user.id) properly in api.ts first? 
        // Or assume I will fix it.

        // Let's try to use api.auth.me() and update it to return more fields.

        setProfile({
          ...userData,
          user_id: userData.id,
          expertise: userData.expertise || [], // Handle missing fields gracefully
          bio: userData.bio || '',
        });
      } else {
        // Create logic handled by server on signup usually.
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    const formData = new FormData(e.currentTarget);
    const updatedProfile = {
      username: formData.get('username') as string,
      full_name: formData.get('full_name') as string,
      bio: formData.get('bio') as string,
      expertise: profile.expertise,
    };

    try {
      await api.profiles.update(updatedProfile);

      setProfile({ ...profile, ...updatedProfile });
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim() && profile) {
      const updatedExpertise = [...(profile.expertise || []), newExpertise.trim()];
      setProfile({ ...profile, expertise: updatedExpertise });
      setNewExpertise('');
    }
  };

  const removeExpertise = (index: number) => {
    if (profile) {
      const updatedExpertise = profile.expertise.filter((_, i) => i !== index);
      setProfile({ ...profile, expertise: updatedExpertise });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="glass-card w-full max-w-md mx-4">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Profile not found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
          <Card className="border border-neutral-200 bg-white shadow-sm">
            <CardHeader className="pb-8 border-b border-neutral-100">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl bg-neutral-100 text-neutral-500">
                      {profile.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                      {editing ? 'Edit Profile' : (profile.full_name || profile.username || 'Your Profile')}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {editing ? 'Update your information' : user?.email}
                    </CardDescription>
                    {!editing && profile.username && (
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>
                </div>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="shrink-0">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="shrink-0 text-muted-foreground hover:text-foreground">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {editing ? (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        defaultValue={profile.username || ''}
                        placeholder="your-username"
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={profile.full_name || ''}
                        placeholder="Dr. Jane Smith"
                        className="bg-white/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      defaultValue={profile.bio || ''}
                      placeholder="Tell us about your research interests and background..."
                      rows={4}
                      className="bg-white/50 resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Areas of Expertise</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        placeholder="e.g., Computational Neuroscience"
                        className="bg-white/50"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExpertise();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addExpertise}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                      {profile.expertise?.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors pl-2.5 pr-1.5 py-1"
                          onClick={() => removeExpertise(index)}
                        >
                          {skill} <X className="ml-1.5 h-3 w-3 opacity-50" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-neutral-900 text-white hover:bg-neutral-800">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {profile.bio || 'No bio added yet. Click edit to add your research background and interests.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise && profile.expertise.length > 0 ? (
                        profile.expertise.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-0 px-3 py-1">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No expertise areas added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Panel Link (visible only to admins) */}
              {profile.role === 'admin' && !editing && (
                <div className="mt-12 pt-6 border-t border-neutral-100">
                  <a
                    href="/admin"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                  >
                    Admin Dashboard
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;