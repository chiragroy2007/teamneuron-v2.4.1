import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Edit3, Save, X, Plus } from 'lucide-react';
import Layout from '@/components/Layout/Layout';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  expertise: string[];
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create a new profile if none exists
        const newProfile = {
          user_id: user?.id,
          username: user?.email?.split('@')[0] || '',
          full_name: '',
          bio: '',
          avatar_url: '',
          expertise: [],
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
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
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, ...updatedProfile });
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Card className="card-neural animate-pulse">
              <CardHeader>
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="card-neural">
            <CardContent className="text-center py-8">
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="card-neural">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gradient">
                        {editing ? 'Edit Profile' : (profile.full_name || profile.username || 'Your Profile')}
                      </CardTitle>
                      <CardDescription>
                        {editing ? 'Update your information' : user?.email}
                      </CardDescription>
                    </div>
                  </div>
                  {!editing ? (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          defaultValue={profile.username || ''}
                          placeholder="your-username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          defaultValue={profile.full_name || ''}
                          placeholder="Dr. Jane Smith"
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Areas of Expertise</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={newExpertise}
                          onChange={(e) => setNewExpertise(e.target.value)}
                          placeholder="e.g., Computational Neuroscience"
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
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.expertise?.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeExpertise(index)}
                          >
                            {skill} <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="btn-neural w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                        <p className="text-lg">{profile.username || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p className="text-lg">{profile.full_name || 'Not set'}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                      <p className="text-base mt-1">
                        {profile.bio || 'No bio added yet. Click edit to add your research background and interests.'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Areas of Expertise</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.expertise && profile.expertise.length > 0 ? (
                          profile.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No expertise areas added yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;