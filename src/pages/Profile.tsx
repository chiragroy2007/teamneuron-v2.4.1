import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User, Edit3, Save, X, Plus, Loader2, MapPin, Link as LinkIcon, Briefcase, GraduationCap, Github, Linkedin, Globe, Upload, FileText, ExternalLink } from 'lucide-react';
import Layout from '@/components/Layout/Layout';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  skills: string[];
  interests: string[];
  education: string;
  role: string | null;
  linkedin_url: string;
  current_projects: string;
  cv_url: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [uploadingCV, setUploadingCV] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const userData = await api.auth.me();

      if (userData) {
        setProfile({
          ...userData,
          user_id: userData.id,
          skills: userData.skills || [],
          interests: userData.interests || [],
          bio: userData.bio || '',
          education: userData.education || '',
          role: userData.role || '',
          linkedin_url: userData.linkedin_url || '',
          current_projects: userData.current_projects || '',
          cv_url: userData.cv_url || '',
        });
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
      role: formData.get('role') as string,
      education: formData.get('education') as string,
      linkedin_url: formData.get('linkedin_url') as string,
      skills: profile.skills,
      interests: profile.interests,
    };

    try {
      await api.profiles.update(updatedProfile);

      setProfile(prev => prev ? ({ ...prev, ...updatedProfile }) : null);
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

  const addTag = (type: 'skills' | 'interests', value: string, setter: (val: string) => void) => {
    if (value.trim() && profile) {
      const current = profile[type] || [];
      if (!current.includes(value.trim())) {
        setProfile({ ...profile, [type]: [...current, value.trim()] });
        setter('');
      }
    }
  };

  const removeTag = (type: 'skills' | 'interests', index: number) => {
    if (profile) {
      const updated = (profile[type] || []).filter((_, i) => i !== index);
      setProfile({ ...profile, [type]: updated });
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingCV(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading CV file...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const cvUrl = data.url;
      console.log('CV uploaded, URL:', cvUrl);

      // Update profile with CV URL
      console.log('Updating profile with CV URL...');
      const updateResult = await api.profiles.update({ cv_url: cvUrl });
      console.log('Profile update result:', updateResult);

      // Update local state
      setProfile(prev => prev ? { ...prev, cv_url: cvUrl } : null);

      // Refresh profile data to ensure we have the latest
      await fetchProfile();

      toast({
        title: "Success",
        description: "CV uploaded successfully",
      });
    } catch (error: any) {
      console.error('CV upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload CV",
        variant: "destructive",
      });
    } finally {
      setUploadingCV(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 shadow-sm border-neutral-200">
            <CardContent className="text-center py-12">
              <p className="text-neutral-500">Profile not found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 font-sans">
        {/* Profile Header / Cover */}
        <div className="w-full h-64 bg-neutral-900 relative overflow-hidden">
          {/* Abstract Mesh Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black opacity-80"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24 pb-20">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Left Column: Avatar & Quick Info */}
            <div className="w-full md:w-1/3 space-y-6">
              <Card className="border-neutral-200 shadow-lg overflow-visible bg-white relative">
                <CardContent className="pt-0 px-0 pb-6 flex flex-col items-center">
                  <div className="relative -mt-16 mb-5">
                    <Avatar className="h-32 w-32 border-[4px] border-white shadow-md bg-white">
                      <AvatarImage src={profile.avatar_url} className="object-cover" />
                      <AvatarFallback className="text-4xl bg-neutral-100 text-neutral-400">
                        {profile.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="w-full text-center px-6 space-y-2 mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900 break-words leading-tight">
                      {profile.full_name || profile.username}
                    </h2>
                    {profile.role && (
                      <div className="text-neutral-500 font-medium flex flex-wrap items-center justify-center gap-1.5 break-words">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-center">{profile.role}</span>
                      </div>
                    )}
                    <p className="text-sm text-neutral-400 break-all">@{profile.username}</p>
                  </div>


                  <div className="w-full px-6 flex flex-col gap-3">
                    {!editing && (
                      <Button onClick={() => setEditing(true)} variant="outline" className="w-full border-neutral-300 hover:bg-neutral-50 text-neutral-700">
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                      </Button>
                    )}

                    {(profile.linkedin_url) && !editing && (
                      <div className="flex gap-2 justify-center pt-2">
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 rounded-full text-neutral-600 hover:bg-[#0077b5] hover:text-white transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                        {/* Add more social placeholders if needed */}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats / Sidebar Info (Education etc) */}
              {!editing && (
                <Card className="border-neutral-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-neutral-100">
                    <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-neutral-500" /> Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {profile.education ? (
                      <p className="text-sm text-neutral-600 leading-relaxed">{profile.education}</p>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No education details added.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Main Content / Edit Form */}
            <div className="w-full md:w-2/3">
              <Card className="border-neutral-200 shadow-sm bg-white min-h-[400px]">
                {editing ? (
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-neutral-900">Edit Profile</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input id="full_name" name="full_name" defaultValue={profile.full_name || ''} className="bg-neutral-50 border-neutral-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" name="username" defaultValue={profile.username || ''} className="bg-neutral-50 border-neutral-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role / Title</Label>
                          <Input id="role" name="role" defaultValue={profile.role || ''} placeholder="e.g. PhD Candidate, Researcher" className="bg-neutral-50 border-neutral-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                          <Input id="linkedin_url" name="linkedin_url" defaultValue={profile.linkedin_url || ''} placeholder="https://linkedin.com/in/..." className="bg-neutral-50 border-neutral-200" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education">Education</Label>
                        <Input id="education" name="education" defaultValue={profile.education || ''} placeholder="e.g. University of Science, PhD in Biology" className="bg-neutral-50 border-neutral-200" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">About Me</Label>
                        <Textarea id="bio" name="bio" defaultValue={profile.bio || ''} rows={5} className="bg-neutral-50 border-neutral-200 resize-none" placeholder="Share your research interests..." />
                      </div>

                      {/* Skills */}
                      <div className="space-y-3">
                        <Label>Skills</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('skills', newSkill, setNewSkill))}
                            placeholder="Add skill..."
                            className="bg-neutral-50 border-neutral-200"
                          />
                          <Button type="button" onClick={() => addTag('skills', newSkill, setNewSkill)} variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="pl-3 pr-1.5 py-1">
                              {tag} <X className="ml-2 w-3 h-3 cursor-pointer opacity-50 hover:opacity-100" onClick={() => removeTag('skills', i)} />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="space-y-3">
                        <Label>Research Interests</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('interests', newInterest, setNewInterest))}
                            placeholder="Add interest..."
                            className="bg-neutral-50 border-neutral-200"
                          />
                          <Button type="button" onClick={() => addTag('interests', newInterest, setNewInterest)} variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="pl-3 pr-1.5 py-1">
                              {tag} <X className="ml-2 w-3 h-3 cursor-pointer opacity-50 hover:opacity-100" onClick={() => removeTag('interests', i)} />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                        <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">Save Changes</Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <CardContent className="p-6 md:p-8 space-y-8">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">About</h3>
                      <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                        {profile.bio || <span className="text-neutral-400 italic">No bio added yet.</span>}
                      </p>
                    </div>

                    {/* CV Upload Section */}
                    <div className="border-t border-neutral-100 pt-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">Curriculum Vitae</h3>
                      {profile.cv_url ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200">
                            <FileText className="w-5 h-5 text-neutral-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-900">CV.pdf</p>
                              <p className="text-xs text-neutral-500">Uploaded</p>
                            </div>
                            <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="text-neutral-900 hover:text-neutral-600">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <label className="block">
                            <input type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" disabled={uploadingCV} />
                            <Button type="button" variant="outline" size="sm" disabled={uploadingCV} className="w-full" onClick={(e) => e.currentTarget.previousElementSibling?.click()}>
                              {uploadingCV ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                              Replace CV
                            </Button>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="block">
                            <input type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" disabled={uploadingCV} />
                            <Button type="button" variant="outline" disabled={uploadingCV} className="w-full border-dashed border-2" onClick={(e) => e.currentTarget.previousElementSibling?.click()}>
                              {uploadingCV ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                              Upload CV (PDF)
                            </Button>
                          </label>
                          <div className="bg-neutral-50 border border-neutral-200 p-3 text-xs text-neutral-600">
                            <p className="mb-1">Don't have a CV ready?</p>
                            <a href="https://cv-generator.tools.teamneuron.blog" target="_blank" rel="noopener noreferrer" className="text-neutral-900 hover:underline font-medium inline-flex items-center gap-1">
                              Use our free CV generator <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills?.length > 0 ? profile.skills.map((tag, i) => (
                            <Badge key={i} className="bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border-0">{tag}</Badge>
                          )) : <span className="text-neutral-400 italic text-sm">No skills listed.</span>}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests?.length > 0 ? profile.interests.map((tag, i) => (
                            <Badge key={i} variant="outline" className="border-neutral-200 text-neutral-600">{tag}</Badge>
                          )) : <span className="text-neutral-400 italic text-sm">No interests listed.</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

          </div>
        </div>
      </div>
    </Layout >
  );
};

export default Profile;