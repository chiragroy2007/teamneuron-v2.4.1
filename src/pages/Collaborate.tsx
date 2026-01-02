import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CollaboratorCard from '../components/CollaboratorCard';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Layout as LayoutComponent } from '../components/Layout/Layout';
import { useToast } from '../hooks/use-toast';
import {
  User,
  GraduationCap,
  Linkedin,
  Clock,
  FileText,
  Heart,
  Zap,
  Users,
  Search,
  Edit,
  Save,
  X,
  Target,
  BookOpen,
  Globe,
  Briefcase,
  Plus,
  Filter
} from 'lucide-react';
import Layout from '../components/Layout/Layout';

const Collaborate: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Filter States
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  // ... (keeping form state simplified for brevity, assume similar structure as before but simplified visually)
  const [role, setRole] = useState('');
  const [education, setEducation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [collaborationPreferences, setCollaborationPreferences] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [currentProjects, setCurrentProjects] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await api.auth.me();

        if (data) {
          setProfile(data);
          // Pre-fill form
          setRole(data.role || '');
          setEducation(data.education || '');
          setLinkedinUrl(data.linkedin_url || '');
          setInterests(data.interests || []);
          setSkills(data.skills || []);
          setCollaborationPreferences(data.collaboration_preferences || []);
          setAvailability(data.availability || '');
          setCurrentProjects(data.current_projects || '');
          setBio(data.bio || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchCollaborators = async () => {
      if (!user) return;
      try {
        const data = await api.users.list(50);
        if (data) {
          setCollaborators(data.filter((p: any) =>
            p.user_id !== user.id &&
            !p.full_name?.toLowerCase().includes('lovable') &&
            !p.username?.toLowerCase().includes('lovable') &&
            !p.full_name?.toLowerCase().includes('bot')
          ));
        }
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      }
    };
    fetchCollaborators();
  }, [user]);

  // Matchmaking Logic (Same as before)
  const processedCollaborators = useMemo(() => {
    if (!profile) return collaborators;

    return collaborators.map(c => {
      let score = 0;
      let maxScore = 0;

      // Role Match
      if (profile.role && c.role && profile.role !== c.role) score += 10;
      maxScore += 10;

      // Interest Match
      const myInterests = new Set(profile.interests || []);
      const theirInterests = c.interests || [];
      const commonInterests = theirInterests.filter((i: string) => myInterests.has(i));
      score += commonInterests.length * 5;
      maxScore += (Math.max(myInterests.size, theirInterests.length) || 1) * 5;

      // Skill Match
      const mySkills = new Set(profile.skills || []);
      const theirSkills = c.skills || [];
      const commonSkills = theirSkills.filter((s: string) => mySkills.has(s));
      score += commonSkills.length * 2;
      maxScore += (Math.max(mySkills.size, theirSkills.length) || 1) * 2;

      const normalized = Math.min(95, Math.max(10, Math.round((score / (maxScore || 1)) * 100)));
      return { ...c, matchScore: normalized };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [collaborators, profile]);

  const filteredCollaborators = useMemo(() => {
    return processedCollaborators.filter(c => {
      const matchesRole = selectedRole === 'All' || c.role === selectedRole;
      const matchesSearch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.interests?.some((i: string) => i.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRole && matchesSearch;
    });
  }, [processedCollaborators, selectedRole, searchQuery]);

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (!role) {
        toast({
          title: "Missing Information",
          description: "Please select a Role to complete your profile.",
          variant: "destructive",
        });
        return;
      }
      setSaving(true);
      const updates = { role, education, linkedin_url: linkedinUrl, interests, skills, collaboration_preferences: collaborationPreferences, availability, current_projects: currentProjects, bio };
      const result = await api.profiles.update(updates);
      if (result.error) throw new Error(result.error);

      const data = await api.auth.me();
      if (data) {
        setProfile(data);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your researcher profile has been successfully updated.",
          className: "bg-neutral-900 text-white border-neutral-800",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Loading Network...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Profile Edit View (kept simple)
  if (isEditing || !profile || !profile.role) {
    return (
      <Layout>
        <div className="min-h-screen bg-background py-12">
          <div className="container max-w-2xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">Researcher Profile</h1>
              <p className="text-neutral-500 text-sm">Complete your details to enable matchmaking</p>
            </div>

            <Card className="border border-neutral-200 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-neutral-700 uppercase">Role</label>
                      <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-9 rounded-md border border-neutral-200 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors">
                        <option value="">Select Role</option>
                        <option value="Student">Student</option>
                        <option value="Professor">Professor</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Hobbyist">Hobbyist</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-neutral-700 uppercase">Education</label>
                      <input value={education} onChange={e => setEducation(e.target.value)} className="w-full h-9 rounded-md border border-neutral-200 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors" placeholder="Institution" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-700 uppercase">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full rounded-md border border-neutral-200 text-sm p-3 focus:outline-none focus:border-neutral-900 transition-colors" placeholder="Short professional bio" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-700 uppercase">Interests (Comma separated)</label>
                    <input value={interests.join(', ')} onChange={e => setInterests(e.target.value.split(',').map(s => s.trim()))} className="w-full h-9 rounded-md border border-neutral-200 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors" placeholder="e.g. Neuroscience, ML" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-700 uppercase">Skills (Comma separated)</label>
                    <input value={skills.join(', ')} onChange={e => setSkills(e.target.value.split(',').map(s => s.trim()))} className="w-full h-9 rounded-md border border-neutral-200 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors" placeholder="e.g. Python, R" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-700 uppercase">LinkedIn</label>
                    <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="w-full h-9 rounded-md border border-neutral-200 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors" placeholder="https://linkedin.com/..." />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                    {isEditing && <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="text-sm">Cancel</Button>}
                    <Button type="submit" disabled={saving} className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm">
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : 'Save Profile'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Main View
  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-neutral-200 pb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Find Collaborators</h1>
              <p className="text-sm text-neutral-500 mt-1">Connect with {collaborators.length} researchers in the community</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full">
                <span className="font-semibold text-neutral-900">{profile.interests?.length}</span> Interests
                <span className="w-1 h-3 border-r border-neutral-300 mx-1"></span>
                <span className="font-semibold text-neutral-900">{profile.skills?.length}</span> Skills
              </div>
              <Button onClick={() => setIsEditing(true)} size="sm" variant="outline" className="h-8 text-xs border-neutral-300 text-neutral-600 hover:text-neutral-900">
                <Edit className="mr-2 h-3.5 w-3.5" />
                Edit Profile
              </Button>
              <Link to="/projects/new">
                <Button size="sm" className="h-8 text-xs bg-neutral-900 hover:bg-neutral-800 text-white">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Post
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-8">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search people..."
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-white border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Roles */}
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Role
                </h3>
                <div className="space-y-1">
                  {['All', 'Student', 'Professor', 'Researcher', 'Hobbyist'].map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-all ${selectedRole === r
                        ? 'bg-neutral-900 text-white font-medium shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="lg:col-span-3">
              {filteredCollaborators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCollaborators.map((collaborator) => (
                    <div key={collaborator.id} className="h-full">
                      <CollaboratorCard profile={collaborator} matchScore={collaborator.matchScore} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-neutral-50 rounded-lg border border-neutral-100 border-dashed">
                  <div className="bg-white border border-neutral-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Search className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">No matches found</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    Try adjusting your filters or search terms.
                  </p>
                  <Button onClick={() => { setSelectedRole('All'); setSearchQuery(''); }} variant="link" className="mt-2 text-xs text-neutral-900">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Collaborate;
