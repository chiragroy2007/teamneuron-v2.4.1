import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Filter } from 'lucide-react';

type Project = {
  id: string;
  creator_id: string;
  kind: 'project' | 'intent';
  title: string;
  description: string;
  areas: string[] | null;
  skills_needed: string[] | null;
  tags: string[] | null;
  commitment: 'one-time' | '2-4 hrs/week' | '5-10 hrs/week' | '10+ hrs/week' | 'full-time';
  collaboration_types: ('co_authoring' | 'dataset_sharing' | 'mentoring' | 'implementation' | 'analysis' | 'review')[];
  location: 'remote' | 'hybrid' | 'in_person' | null;
  timezone: string | null;
  is_paid: boolean;
  application_instructions: string | null;
  status: 'open' | 'closed' | 'draft';
  visibility: string;
  deadline: string | null;
  created_at: string;
};

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [commitment, setCommitment] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.projects.list('open');
      setProjects(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch projects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter((p) => {
    const hay = `${p.title} ${(p.tags || []).join(' ')} ${(p.skills_needed || []).join(' ')} ${(p.areas || []).join(' ')}`.toLowerCase();
    const okSearch = search ? hay.includes(search.toLowerCase()) : true;
    const okCommitment = commitment ? p.commitment === commitment : true;
    return okSearch && okCommitment;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Project Board</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchProjects}>
              <Filter className="h-4 w-4 mr-2" /> Refresh
            </Button>
            {user && (
              <Button onClick={() => navigate('/projects/new')}>
                <Plus className="h-4 w-4 mr-2" /> New Post
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 flex items-center gap-2">
            <Input
              placeholder="Search by title, tags, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" onClick={() => setSearch(search.trim())}>
              <Search className="h-4 w-4 mr-1" /> Search
            </Button>
          </div>
          <div>
            <Select value={commitment} onValueChange={(v) => setCommitment(v === 'any' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Commitment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="2-4 hrs/week">2–4 hrs/week</SelectItem>
                <SelectItem value="5-10 hrs/week">5–10 hrs/week</SelectItem>
                <SelectItem value="10+ hrs/week">10+ hrs/week</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">No projects found.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Card key={p.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="line-clamp-1">{p.title}</span>
                    <Badge variant={p.kind === 'intent' ? 'secondary' : 'default'}>
                      {p.kind === 'intent' ? 'Looking for X' : 'Project'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{p.commitment}</Badge>
                    {p.location && <Badge variant="outline">{p.location}</Badge>}
                    {(p.collaboration_types || []).slice(0, 2).map((t) => (
                      <Badge key={t} variant="outline">{t.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {p.tags.slice(0, 4).map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Link to={`/projects/${p.id}`} className="w-full">
                      <Button className="w-full" variant="default">View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
