import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import RichTextEditor from '@/components/ui/rich-text-editor';

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

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverNote, setCoverNote] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.projects.get(id);
        setProject(data);
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Project not found', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const apply = async () => {
    if (!user || !project) return;
    try {
      await api.projects.apply(project.id, coverNote);
      toast({ title: 'Request sent', description: 'Your application has been submitted.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to apply', variant: 'destructive' });
    }
  };

  if (loading) {
    return <Layout><div className="container mx-auto px-4 py-8 text-center">Loading...</div></Layout>;
  }
  if (!project) {
    return <Layout><div className="container mx-auto px-4 py-8 text-center">Not found.</div></Layout>;
  }

  const canApply = user && user.id !== project.creator_id && project.status === 'open';
  const isOwner = user && user.id === project.creator_id;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>&larr; Back</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{project.title}</span>
              <Badge variant={project.kind === 'intent' ? 'secondary' : 'default'}>{project.kind === 'intent' ? 'Looking for X' : 'Project'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{project.commitment}</Badge>
              {project.location && <Badge variant="outline">{project.location}</Badge>}
              {(project.collaboration_types || []).map((t) => (
                <Badge key={t} variant="outline">{t.replace('_', ' ')}</Badge>
              ))}
              {project.is_paid && <Badge variant="default">Paid</Badge>}
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            )}

            <div>
              <RichTextEditor content={project.description} onChange={() => { }} editable={false} className="prose" />
            </div>

            {project.application_instructions && (
              <div className="text-sm text-gray-600">
                <strong>Application Instructions:</strong> {project.application_instructions}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {isOwner ? (
                <Badge variant="outline">You are the owner</Badge>
              ) : canApply ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Apply</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to this {project.kind === 'intent' ? 'post' : 'project'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Cover Note (optional)</label>
                        <Input value={coverNote} onChange={(e) => setCoverNote(e.target.value)} placeholder="Brief intro, skills, availability..." />
                      </div>
                      <div className="text-sm text-gray-600">
                        Your profile will be attached to this request automatically.
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={apply}>Send Request</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Badge variant="secondary">Closed</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProjectPage;
