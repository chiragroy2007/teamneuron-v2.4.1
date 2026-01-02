import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Plus } from 'lucide-react';

// Simple tag input helper
function TagsInput({ label, values, setValues, placeholder }: { label: string; values: string[]; setValues: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (!values.includes(v)) setValues([...values, v]);
    setInput('');
  };
  const remove = (v: string) => setValues(values.filter((x) => x !== v));
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={input} placeholder={placeholder} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button type="button" onClick={add}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="cursor-pointer" onClick={() => remove(v)}>{v} ✕</Badge>
        ))}
      </div>
    </div>
  );
}

// Template type
type PostTemplate = {
  id: string;
  owner_id: string | null;
  scope: 'global' | 'user';
  title: string;
  content: string;
  default_tags: string[] | null;
  default_skills: string[] | null;
  default_commitment: 'one-time' | '2-4 hrs/week' | '5-10 hrs/week' | '10+ hrs/week' | 'full-time' | null;
  default_collaboration_types: CollabType[] | null;
};

type CollabType = 'co_authoring' | 'dataset_sharing' | 'mentoring' | 'implementation' | 'analysis' | 'review';

const CreateProject: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [kind, setKind] = useState<'project' | 'intent'>('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commitment, setCommitment] = useState<'one-time' | '2-4 hrs/week' | '5-10 hrs/week' | '10+ hrs/week' | 'full-time'>('one-time');
  const [collabTypes, setCollabTypes] = useState<CollabType[]>(['co_authoring']);
  const [location, setLocation] = useState<'remote' | 'hybrid' | 'in_person' | ''>('remote');
  const [timezone, setTimezone] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [templates, setTemplates] = useState<PostTemplate[]>([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // If user is not logged in, load only global templates
        const data = await api.templates.list(user?.id);
        setTemplates(data || []);
      } catch (error) {
        console.error(error);
      }
    };
    loadTemplates();
  }, [user?.id]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">Please sign in to create a post.</div>
      </Layout>
    );
  }

  const toggleCollabType = (val: CollabType) => {
    setCollabTypes((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));
  };

  const applyTemplate = (tpl: PostTemplate) => {
    setTitle((t) => t || tpl.title);
    setDescription((d) => d || tpl.content);
    if (tpl.default_commitment) setCommitment(tpl.default_commitment);
    if (tpl.default_collaboration_types) setCollabTypes(tpl.default_collaboration_types);
    if (tpl.default_tags) setTags(Array.from(new Set([...(tags || []), ...tpl.default_tags])));
    if (tpl.default_skills) setSkills(Array.from(new Set([...(skills || []), ...tpl.default_skills])));
  };

  const onSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: 'Missing fields', description: 'Title and description are required.', variant: 'destructive' });
      return;
    }
    const payload = {
      creator_id: user.id,
      kind,
      title: title.trim(),
      description,
      areas: areas.length ? areas : null,
      skills_needed: skills.length ? skills : null,
      tags: tags.length ? tags : null,
      commitment,
      collaboration_types: collabTypes,
      location: location || null,
      timezone: timezone || null,
      is_paid: isPaid,
      application_instructions: instructions || null,
      status: 'open' as const,
      deadline: deadline || null,
    };
    try {
      const data = await api.projects.create(payload);
      toast({ title: 'Created', description: 'Your post is live.' });
      navigate(`/projects/${data.id}`);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create project', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Create {kind === 'intent' ? 'Looking for X' : 'Project'} Post</h1>
          <div className="flex gap-2">
            <Select value={kind} onValueChange={(v: any) => setKind(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="intent">Looking for X</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary"><Plus className="h-4 w-4 mr-2" />Templates</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Apply a template</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-[60vh] overflow-auto">
                  {templates.length === 0 ? (
                    <div className="text-sm text-gray-500">No templates available.</div>
                  ) : templates.map(t => (
                    <Card key={t.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => applyTemplate(t)}>
                      <CardHeader>
                        <CardTitle className="text-base">{t.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: t.content }} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., EEG-based Sleep Stage Classification" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor content={description} onChange={setDescription} placeholder="Describe your project or intent..." className="min-h-[280px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Commitment</Label>
                <Select value={commitment} onValueChange={(v: any) => setCommitment(v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="2-4 hrs/week">2–4 hrs/week</SelectItem>
                    <SelectItem value="5-10 hrs/week">5–10 hrs/week</SelectItem>
                    <SelectItem value="10+ hrs/week">10+ hrs/week</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={location} onValueChange={(v: any) => setLocation(v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="in_person">In-person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Collaboration Types</Label>
                <div className="flex flex-wrap gap-2">
                  {(['co_authoring', 'dataset_sharing', 'mentoring', 'implementation', 'analysis', 'review'] as CollabType[]).map((t) => (
                    <Badge
                      key={t}
                      variant={collabTypes.includes(t) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleCollabType(t)}
                    >
                      {t.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deadline (optional)</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timezone (optional)</Label>
                <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g., UTC+5:30" />
              </div>
              <div className="space-y-2">
                <Label>Is Paid?</Label>
                <Select value={isPaid ? 'yes' : 'no'} onValueChange={(v) => setIsPaid(v === 'yes')}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TagsInput label="Areas" values={areas} setValues={setAreas} placeholder="Add area and press Enter" />
            <TagsInput label="Skills Needed" values={skills} setValues={setSkills} placeholder="Add skill and press Enter" />
            <TagsInput label="Tags" values={tags} setValues={setTags} placeholder="Add tag and press Enter" />

            <div className="space-y-2">
              <Label>Application Instructions (optional)</Label>
              <Input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g., Share GitHub link in your note" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => navigate('/projects')}>Cancel</Button>
              <Button onClick={onSubmit}>Publish</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateProject;
