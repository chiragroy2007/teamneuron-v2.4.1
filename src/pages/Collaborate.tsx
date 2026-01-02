import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CollaboratorCard from '../components/CollaboratorCard';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  UserPlus,
  Target,
  BookOpen,
  Globe,
  Briefcase,
  Plus
} from 'lucide-react';
import Layout from '../components/Layout/Layout';

const Collaborate: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null); // Changed to any as Tables is removed
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<any[]>([]); // Changed to any as Tables is removed
  const [isEditing, setIsEditing] = useState(false);

  // Form state
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
          // Pre-fill form if data exists
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
        const data = await api.users.list(50); // Fetch generic list for now
        // Filter out current user on client side if needed, or api returns all users
        if (data) {
          setCollaborators(data.filter((p: any) => p.user_id !== user.id));
        }
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      }
    };
    fetchCollaborators();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updates = {
        role,
        education,
        linkedin_url: linkedinUrl,
        interests,
        skills,
        collaboration_preferences: collaborationPreferences,
        availability,
        current_projects: currentProjects,
        bio,
        // updated_at: new Date().toISOString(), // handled by DB or ignored
      };

      const result = await api.profiles.update(updates);

      if (result.error) {
        throw new Error(result.error);
      }

      // Re-fetch profile to update the UI
      const data = await api.auth.me();

      if (data) {
        setProfile(data);
        setIsEditing(false); // Exit edit mode after successful update
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading collaboration hub...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // If profile is incomplete or user is in edit mode, show the form.
  if (isEditing || !profile || !profile.role) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {isEditing ? 'Update Your Profile' : 'Join Our Research Community'}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Share your expertise and interests to connect with like-minded researchers and collaborators
              </p>
            </div>

            {/* Profile Form */}
            <Card className="max-w-4xl mx-auto shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Basic Info
                      </TabsTrigger>
                      <TabsTrigger value="expertise" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Expertise
                      </TabsTrigger>
                      <TabsTrigger value="collaboration" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Collaboration
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Role */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <GraduationCap className="w-4 h-4" />
                            Professional Role
                          </label>
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          >
                            <option value="">Select your role</option>
                            <option value="Student">Student</option>
                            <option value="Professor">Professor</option>
                            <option value="Researcher">Researcher</option>
                            <option value="Hobbyist">Hobbyist</option>
                          </select>
                        </div>

                        {/* Education */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <BookOpen className="w-4 h-4" />
                            Education Background
                          </label>
                          <input
                            type="text"
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            placeholder="e.g., PhD in Neuroscience, MIT"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* LinkedIn URL */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Linkedin className="w-4 h-4" />
                            LinkedIn Profile
                          </label>
                          <input
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Availability */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Clock className="w-4 h-4" />
                            Weekly Availability
                          </label>
                          <input
                            type="text"
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            placeholder="e.g., 5-10 hours/week"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FileText className="w-4 h-4" />
                          Professional Bio
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          placeholder="Tell us about your background, research interests, and what drives your passion for science..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="expertise" className="space-y-6 mt-6">
                      {/* Current Projects */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Zap className="w-4 h-4" />
                          Current Projects
                        </label>
                        <textarea
                          value={currentProjects}
                          onChange={(e) => setCurrentProjects(e.target.value)}
                          rows={4}
                          placeholder="Describe your ongoing research projects, publications, or initiatives..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Interests */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Heart className="w-4 h-4" />
                          Research Interests
                        </label>
                        <input
                          type="text"
                          value={interests.join(', ')}
                          onChange={(e) => setInterests(e.target.value.split(',').map(s => s.trim()))}
                          placeholder="e.g., Machine Learning, Neuroscience, Data Analysis"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-500">Separate multiple interests with commas</p>
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Globe className="w-4 h-4" />
                          Technical Skills
                        </label>
                        <input
                          type="text"
                          value={skills.join(', ')}
                          onChange={(e) => setSkills(e.target.value.split(',').map(s => s.trim()))}
                          placeholder="e.g., Python, R, MATLAB, Statistics, Deep Learning"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-500">Separate multiple skills with commas</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="collaboration" className="space-y-6 mt-6">
                      {/* Collaboration Preferences */}
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Users className="w-4 h-4" />
                          I'm looking for collaboration in:
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['Co-authoring papers', 'Side projects', 'Mentorship', 'Quick help', 'Long-term collaboration'].map(pref => (
                            <Card key={pref} className={`p-4 cursor-pointer transition-all hover:shadow-md ${collaborationPreferences.includes(pref)
                              ? 'border-gray-700 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id={pref}
                                  checked={collaborationPreferences.includes(pref)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCollaborationPreferences([...collaborationPreferences, pref]);
                                    } else {
                                      setCollaborationPreferences(collaborationPreferences.filter(p => p !== pref));
                                    }
                                  }}
                                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                />
                                <label htmlFor={pref} className="text-sm font-medium text-gray-900 cursor-pointer">
                                  {pref}
                                </label>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-4">
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-black hover:via-gray-900 hover:to-black flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isEditing ? 'Update Profile' : 'Save Profile'}
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

  // If profile is complete and not in edit mode, show the collaborators view.
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">

          {/* Profile Summary Card */}
          {profile && (
            <Card className="max-w-4xl mx-auto mb-12 shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Profile Summary
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Link to="/projects">
                    <Button variant="secondary" size="sm" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Browse Projects
                    </Button>
                  </Link>
                  <Link to="/projects/new">
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Post Opportunity
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border-white/20"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                      <GraduationCap className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{profile.role || 'Not specified'}</h3>
                    <p className="text-sm text-gray-600">{profile.education || 'Education not specified'}</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                      <Heart className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{profile.interests?.length || 0} Interests</h3>
                    <p className="text-sm text-gray-600">Research areas</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                      <Zap className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{profile.skills?.length || 0} Skills</h3>
                    <p className="text-sm text-gray-600">Technical expertise</p>
                  </div>
                </div>

                {profile.bio && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-gray-700 text-center italic">"{profile.bio}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Collaborators Section */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                <Search className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Discover Collaborators</h2>
                <p className="text-gray-600">Connect with researchers who share your interests and expertise</p>
              </div>
            </div>

            {collaborators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborators.map(collaborator => (
                  <div key={collaborator.id} className="transform transition-all hover:scale-105">
                    <CollaboratorCard profile={collaborator} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Collaborators Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Be among the first to join our research community! More collaborators will appear as our network grows.
                  </p>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-black hover:via-gray-900 hover:to-black"
                  >
                    Complete Your Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Call to Action Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-0">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Collaborate?</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Join our growing community of researchers and scientists. Share your expertise,
                  discover new opportunities, and advance scientific knowledge together.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link to="/projects">
                    <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Browse Projects
                    </Button>
                  </Link>
                  <Link to="/projects/new">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Post Opportunity
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Collaborate;
