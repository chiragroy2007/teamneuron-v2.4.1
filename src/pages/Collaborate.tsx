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
import { Badge } from '../components/ui/badge';
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
  Filter,
  Check
} from 'lucide-react';
import Layout from '../components/Layout/Layout';

import { api_synapse } from '../lib/api_synapse';
import MatchCard from './synapse/components/MatchCard';

const RESEARCH_SKILLS = [
  // Core Sciences
  "Neuroscience", "Biology", "Chemistry", "Physics", "Genetics", "Microbiology", "Immunology",
  "Cognitive Science", "Psychology", "Biochemistry", "Molecular Biology", "Ecology", "Astronomy", "Geology", "Environmental Science",

  // Medical & Clinical
  "Medicine", "Surgery", "Pharmacology", "Public Health", "Clinical Trials", "Epidemiology",
  "Pathology", "Oncology", "Cardiology", "Neurology", "Psychiatry",

  // Data & Tech
  "Python", "R", "MATLAB", "Machine Learning", "Data Analysis", "Statistics", "Bioinformatics",
  "Computer Vision", "NLP", "Deep Learning", "SQL", "React", "TypeScript", "Node.js", "C++",
  "Linux", "Cloud Computing", "Robotics", "Signal Processing", "Julia", "SAS", "SPSS", "Stata",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Git", "TensorFlow", "PyTorch",

  // Lab & Methods
  "PCR", "Western Blot", "Microscopy", "Cell Culture", "Flow Cytometry", "ELISA", "Chromatography",
  "Mass Spectrometry", "Spectroscopy", "X-ray Crystallography", "DNA Sequencing", "CRISPR",
  "Survey Design", "Qualitative Research", "Ethnography", "fMRI/EEG", "Electrophysiology", "Optogenetics",

  // Professional
  "Grant Writing", "Academic Writing", "Public Speaking", "Project Management", "Teaching",
  "Mentoring", "Research Design", "Ethics", "Science Communication", "Peer Review",
  "Data Visualization", "Team Leadership", "Patenting", "Fundraising"
];


const Collaborate: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [synapseMatches, setSynapseMatches] = useState<any[]>([]); // Synapse Matches
  const [synapseProjects, setSynapseProjects] = useState<any[]>([]); // Recommended Projects
  const [myProjects, setMyProjects] = useState<any[]>([]); // Projects I own
  const [allProjects, setAllProjects] = useState<any[]>([]); // All Community Projects
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [activeTab, setActiveTab] = useState("explore"); // explore | synapse | projects
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

  // Matchmaking Logic (Enhanced)
  const processedCollaborators = useMemo(() => {
    if (!profile) return collaborators;

    return collaborators.map(c => {
      let score = 0;
      // We calculate max score based on the potential perfect match relative to MY profile
      // i.e., if I found someone who teaches everything I want to learn, and wants everything I can teach.

      const myInterests = new Set(profile.interests || []);
      const mySkills = new Set(profile.skills || []);
      const theirInterests = new Set(c.interests || []);
      const theirSkills = new Set(c.skills || []);

      // 1. Complementary Match (High Value): They teach what I want to learn
      // Assumes 'Skills' = Can Teach, 'Interests' = Wants to Learn
      let complementaryMatches = 0;
      theirSkills.forEach(s => { if (myInterests.has(s)) complementaryMatches++; });
      score += complementaryMatches * 20;

      // 2. Reciprocal Match (High Value): I teach what they want to learn
      let reciprocalMatches = 0;
      theirInterests.forEach(i => { if (mySkills.has(i)) reciprocalMatches++; });
      score += reciprocalMatches * 20;

      // 3. Common Ground (Medium Value): Shared Interests (Good for conversation)
      let sharedInterests = 0;
      theirInterests.forEach(i => { if (myInterests.has(i)) sharedInterests++; });
      score += sharedInterests * 5;

      // 4. Peer Match (Medium Value): Shared Skills (Good for working together on same tasks)
      let sharedSkills = 0;
      theirSkills.forEach(s => { if (mySkills.has(s)) sharedSkills++; });
      score += sharedSkills * 5;

      // Calculate a dynamic maximum based on my profile's density
      // A "Perfect" match would satisfy all my interest needs (Complementary) 
      // AND allow me to teach them something (Reciprocal - capped at say 3 things for calculation stability)
      // AND share some common ground.
      const potentialComplementary = (myInterests.size || 5) * 20;
      const potentialReciprocal = (Math.min(mySkills.size, 5) || 1) * 20; // Cap influence of having too many skills
      const potentialShared = (Math.min(myInterests.size, 3) + Math.min(mySkills.size, 3)) * 5;

      const maxPossibleScore = potentialComplementary + potentialReciprocal + potentialShared;

      // Calculate Percentage
      // We add a base 'compatibility' score of 10% just for being on the platform to encourage connection
      let rawPercentage = Math.round((score / (maxPossibleScore || 1)) * 100);

      // Bonus: Role diversity (Students <-> Professors)
      if ((profile.role === 'Student' && c.role === 'Professor') || (profile.role === 'Professor' && c.role === 'Student')) {
        rawPercentage += 15;
      }

      // Clamp between 15% and 98%
      const finalScore = Math.min(98, Math.max(15, rawPercentage));

      return { ...c, matchScore: finalScore };
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

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;

      // Default: Fetch My Projects for Filtering
      try {
        const projects = await api.projects.list('open');
        if (projects) {
          setAllProjects(projects);
          setMyProjects(projects.filter((p: any) => p.creator_id === user.id));
        }
      } catch (e) { console.error(e); }

      if (activeTab === 'synapse') {
        try {
          setLoadingMatches(true);
          const data = await api_synapse.getMatches();
          setSynapseMatches(data || []);
        } catch (error) {
          console.error("Failed to fetch matches", error);
        } finally {
          setLoadingMatches(false);
        }
      } else if (activeTab === 'projects') {
        try {
          setLoadingMatches(true);
          const exploreData = await api_synapse.getExplore();
          if (exploreData) {
            // Filter for projects
            setSynapseProjects(exploreData.filter((i: any) => i.type === 'project'));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingMatches(false);
        }
      }
    };
    fetchMatches();
  }, [user, activeTab]);

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

      // --- SYNAPSE SYNC ---
      // Sync basic skills to Synapse matching engine
      try {
        await api_synapse.onboarding({
          teachSkills: skills, // Map Profile Skills -> Teach
          learnSkills: interests, // Map Profile Interests -> Learn
          bio: bio,
          role: role,
          education: education,
          linkedin_url: linkedinUrl
        });
      } catch (synapseError) {
        console.warn("Synapse sync failed silently", synapseError);
      }
      // --------------------

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
                      <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Role</label>
                      <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-9 border border-neutral-300 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors bg-white">
                        <option value="">Select Role</option>
                        <option value="Student">Student</option>
                        <option value="Professor">Professor</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Hobbyist">Hobbyist</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Education</label>
                      <input value={education} onChange={e => setEducation(e.target.value)} className="w-full h-9 border border-neutral-300 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors bg-white" placeholder="Institution" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full border border-neutral-300 text-sm p-3 focus:outline-none focus:border-neutral-900 transition-colors bg-white" placeholder="Short professional bio" />
                  </div>


                  {/* Synapse Matchmaking Section */}
                  <div className="space-y-4 pt-6 border-t border-neutral-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-neutral-100 p-2 border border-neutral-200">
                        <img src="/synapse.logo.png" alt="Synapse" className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 text-sm">Synapse Matchmaking</h3>
                        <p className="text-xs text-neutral-500">Configure your AI-powered collaboration preferences</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Skills I Can Teach */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                            Skills I Can Teach
                          </label>
                          <span className="text-[10px] text-neutral-400 font-medium">{skills.length} selected</span>
                        </div>

                        <div className="min-h-[160px] p-4 bg-neutral-50 border border-neutral-200">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {skills.map(s => (
                              <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-neutral-900 text-xs font-medium border border-neutral-300 hover:border-neutral-400 transition-colors">
                                {s}
                                <button type="button" onClick={() => setSkills(skills.filter(i => i !== s))} className="hover:text-neutral-600">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {skills.length === 0 && <span className="text-xs text-neutral-400">No skills selected</span>}
                          </div>

                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                              <select
                                className="w-full text-xs pl-9 pr-3 h-8 border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                                onChange={(e) => {
                                  if (e.target.value && !skills.includes(e.target.value)) {
                                    setSkills([...skills, e.target.value]);
                                    e.target.value = "";
                                  }
                                }}
                              >
                                <option value="">Select from list...</option>
                                {RESEARCH_SKILLS.filter(s => !skills.includes(s)).sort().map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div className="relative">
                              <Plus className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                              <input
                                type="text"
                                className="w-full text-xs pl-9 pr-3 h-8 border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                                placeholder="Add custom skill..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.currentTarget.value.trim();
                                    if (val && !skills.includes(val)) {
                                      setSkills([...skills, val]);
                                      e.currentTarget.value = '';
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills I Want to Learn */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                            Skills I Want to Learn
                          </label>
                          <span className="text-[10px] text-neutral-400 font-medium">{interests.length} selected</span>
                        </div>

                        <div className="min-h-[160px] p-4 bg-neutral-50 border border-neutral-200">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {interests.map(s => (
                              <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-neutral-900 text-xs font-medium border border-neutral-300 hover:border-neutral-400 transition-colors">
                                {s}
                                <button type="button" onClick={() => setInterests(interests.filter(i => i !== s))} className="hover:text-neutral-600">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {interests.length === 0 && <span className="text-xs text-neutral-400">No interests selected</span>}
                          </div>

                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                              <select
                                className="w-full text-xs pl-9 pr-3 h-8 border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                                onChange={(e) => {
                                  if (e.target.value && !interests.includes(e.target.value)) {
                                    setInterests([...interests, e.target.value]);
                                    e.target.value = "";
                                  }
                                }}
                              >
                                <option value="">Select from list...</option>
                                {RESEARCH_SKILLS.filter(s => !interests.includes(s)).sort().map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div className="relative">
                              <Plus className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                              <input
                                type="text"
                                className="w-full text-xs pl-9 pr-3 h-8 border border-neutral-300 bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                                placeholder="Add custom interest..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.currentTarget.value.trim();
                                    if (val && !interests.includes(val)) {
                                      setInterests([...interests, val]);
                                      e.currentTarget.value = '';
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Matchmaking Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Collaboration Preferences</label>
                        <input
                          value={collaborationPreferences}
                          onChange={e => setCollaborationPreferences(e.target.value)}
                          className="w-full h-9 border border-neutral-300 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
                          placeholder="e.g., Remote, Part-time, Academic"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Availability</label>
                        <input
                          value={availability}
                          onChange={e => setAvailability(e.target.value)}
                          className="w-full h-9 border border-neutral-300 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
                          placeholder="e.g., 10 hrs/week, Weekends"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Current Projects</label>
                      <input
                        value={currentProjects}
                        onChange={e => setCurrentProjects(e.target.value)}
                        className="w-full h-9 border border-neutral-300 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
                        placeholder="Brief description of ongoing research"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">LinkedIn URL</label>
                      <input
                        value={linkedinUrl}
                        onChange={e => setLinkedinUrl(e.target.value)}
                        className="w-full h-9 border border-neutral-300 text-sm px-3 focus:outline-none focus:border-neutral-900 transition-colors bg-white"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    {isEditing && <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="text-sm">Cancel</Button>}
                    <Button type="submit" disabled={saving} className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm px-8">
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Saving Profile...
                        </>
                      ) : 'Save & Sync Synapse'}
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
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-neutral-500 font-medium">Connect with {collaborators.length} researchers in the community</p>
              </div>
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-neutral-100 p-1 rounded-lg">
              <TabsTrigger value="explore" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">All Researchers</TabsTrigger>
              <TabsTrigger value="synapse" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2 items-center">
                <img src="/synapse.logo.png" alt="Synapse" className="w-4 h-4 object-contain" /> Smart Matches
              </TabsTrigger>
              <TabsTrigger value="projects" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2 items-center">
                <Briefcase className="w-4 h-4 text-neutral-500" /> Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explore" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                        <img src="/synapse.logo.png" alt="Synapse" className="w-5 h-5 object-contain" />
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
            </TabsContent>

            <TabsContent value="synapse" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Recruitment Filter */}
              <div className="bg-neutral-50 p-4 border border-neutral-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Find researchers who match your project needs.</p>
                </div>
                <div className="w-full md:w-64">
                  <select
                    className="w-full h-9 border border-neutral-300 text-sm px-3 bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                    onChange={(e) => {
                      const pid = e.target.value;
                      if (!pid) {
                        // Reset
                        api_synapse.getMatches().then(setSynapseMatches);
                      } else {
                        const proj = myProjects.find(p => p.id === pid);
                        if (proj && proj.skills_needed) {
                          // Filter matches who have these skills
                          const needed = new Set(proj.skills_needed.map((s: string) => s.toLowerCase()));
                          api_synapse.getMatches().then(matches => {
                            const filtered = matches.filter((m: any) =>
                              m.teach.some((s: string) => needed.has(s.toLowerCase()))
                            );
                            setSynapseMatches(filtered);
                            toast({
                              title: "Recruiting Filter Active",
                              description: `Showing ${filtered.length} researchers who match '${proj.title}' requirements.`
                            });
                          });
                        }
                      }
                    }}
                  >
                    <option value="">Show All Matches for Me</option>
                    {myProjects.map(p => (
                      <option key={p.id} value={p.id}>Recruit for: {p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingMatches ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mb-4"></div>
                  <p className="text-neutral-500 text-sm">Synthesizing Matches...</p>
                </div>
              ) : synapseMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {synapseMatches.map((match) => (
                    <MatchCard key={match.user_id} user={match} score={match.score} reasons={match.reasons} badges={match.badges} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-neutral-50 rounded-lg border border-neutral-100 border-dashed">
                  <div className="bg-white border border-neutral-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <img src="/synapse.logo.png" alt="Synapse" className="w-4 h-4 object-contain" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">No Projects Matches</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    We couldn't find anyone matching the specific skills for this project. Try adding more general skills to the project.
                  </p>
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-4 text-xs">
                    Update Profile
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Recommendations */}
                {synapseProjects.length > 0 && (
                  <div className="lg:col-span-3 mb-6">
                    <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <img src="/synapse.logo.png" alt="Synapse" className="w-4 h-4 object-contain" /> Recommended for You
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {synapseProjects.map((proj: any) => (
                        <Link to={`/projects/${proj.id}`} key={proj.id} className="group">
                          <Card className="h-full hover:shadow-md transition-all border-amber-200 bg-amber-50/30">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">95% Match</Badge>
                              </div>
                              <CardTitle className="text-lg mt-2 group-hover:text-amber-700 transition-colors">{proj.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-neutral-500 line-clamp-3 mb-4">{proj.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {proj.details?.skills_needed?.slice(0, 3).map((s: string) => (
                                  <Badge key={s} variant="outline" className="text-[10px] bg-white">{s}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    <Separator className="my-8" />
                  </div>
                )}

                {/* All Projects Grid */}
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900">Community Projects</h3>
                    <Link to="/projects/new"><Button size="sm" variant="outline">Post New</Button></Link>
                  </div>
                  {allProjects.length === 0 ? (
                    <div className="text-center text-sm text-neutral-500 py-10">No active projects found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allProjects.map((proj: any) => (
                        <Card key={proj.id} className="hover:shadow-md transition-all">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <Badge variant={proj.kind === 'intent' ? 'secondary' : 'outline'}>{proj.kind === 'intent' ? 'Intent' : 'Project'}</Badge>
                            </div>
                            <CardTitle className="text-lg mt-2 line-clamp-1">{proj.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-neutral-500 line-clamp-2 mb-4">{proj.description}</p>
                            <Link to={`/projects/${proj.id}`}>
                              <Button size="sm" className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200">View Project</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Synapse Branding Footer */}
          <div className="mt-12 flex items-center justify-center gap-2 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Powered by</span>
            <img src="/synapse.logo.png" alt="Synapse" className="w-4 h-4 object-contain" />
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Collaborate;
