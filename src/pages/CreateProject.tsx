import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Plus, Wand2, ArrowLeft, LayoutTemplate, Briefcase } from 'lucide-react';

// Simple tag input helper (Minimalist)
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
      <Label className="uppercase text-[10px] items-center text-neutral-500 font-semibold tracking-widest">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className="bg-neutral-50 border-neutral-200 focus:bg-white focus:border-neutral-900 transition-all font-medium text-sm"
        />
        <Button type="button" onClick={add} variant="outline" className="border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[24px]">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 rounded-md px-2 py-1 font-medium text-xs transition-colors" onClick={() => remove(v)}>
            {v} <span className="ml-1 opacity-50 block">×</span>
          </Badge>
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

const GLOBAL_TEMPLATES: PostTemplate[] = [
  {
    id: 'tpl_1', owner_id: null, scope: 'global',
    title: 'Mentorship Opportunity',
    content: '<p>I am looking for a student to mentor in the field of...</p>',
    default_tags: ['Mentorship', 'Education'],
    default_skills: [],
    default_commitment: '2-4 hrs/week',
    default_collaboration_types: ['mentoring']
  },
  {
    id: 'tpl_2', owner_id: null, scope: 'global',
    title: 'Research Project Collaborator',
    content: '<p><strong>Objective:</strong><br>We aim to investigate...</p><p><strong>Role:</strong><br>We need someone to help with data analysis...</p>',
    default_tags: ['Research', 'Collaboration'],
    default_skills: ['Data Analysis'],
    default_commitment: '5-10 hrs/week',
    default_collaboration_types: ['co_authoring', 'analysis']
  }
];

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
        const data = await api.templates.list(user?.id);
        const combined = [...GLOBAL_TEMPLATES, ...(data || [])];
        // Deduplicate by ID just in case
        const seen = new Set();
        const unique = combined.filter(t => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
        setTemplates(unique);
      } catch (error) {
        setTemplates(GLOBAL_TEMPLATES);
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
    toast({ title: 'Template Applied', description: `Loaded contents from "${tpl.title}"` });
  };

  const runSynapseAnalysis = () => {
    // Simple heuristic for demo purposes
    // In a real app, this would call an LLM endpoint
    const combinedText = (title + " " + description).toLowerCase();
    const suggestedSkills: string[] = [];
    const suggestedTags: string[] = [];

    const keywords: Record<string, string[]> = {
      'python': ['Python', 'Data Analysis'],
      'react': ['React', 'Frontend'],
      'neuroscience': ['Neuroscience', 'Biology'],
      'analysis': ['Data Analysis'],
      'design': ['Design'],
      'model': ['Machine Learning'],
      'ai': ['Artificial Intelligence']
    };

    Object.entries(keywords).forEach(([key, vals]) => {
      if (combinedText.includes(key)) {
        vals.forEach(v => {
          if (!enteredSkills.has(v)) suggestedSkills.push(v);
        });
      }
    });

    const enteredSkills = new Set(skills);
    const newSkills = suggestedSkills.filter(s => !enteredSkills.has(s));

    if (newSkills.length === 0) {
      toast({ title: 'Synapse Analysis', description: 'No new skills detected from text.' });
    } else {
      setSkills([...skills, ...newSkills]);
      // setTags([...tags, ...suggestedTags]);
      toast({
        title: 'Synapse Suggestions Applied',
        description: `Added skills: ${newSkills.join(', ')}`,
        className: "bg-neutral-900 text-white"
      });
    }
  }

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
      <div className="min-h-screen bg-neutral-50/50 py-12 font-sans text-neutral-900">
        <div className="container max-w-4xl mx-auto px-4">

          <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-6 pl-0 hover:pl-2 transition-all hover:bg-transparent text-neutral-500 hover:text-neutral-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-1">Create Post</h1>
              <p className="text-neutral-500 text-sm">Initiate a new collaboration or intent.</p>
            </div>

            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-sm">
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white border-neutral-200">
                  <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {templates.map(t => (
                      <Card key={t.id} className="hover:bg-neutral-50 cursor-pointer border-neutral-200 transition-colors bg-white group" onClick={() => applyTemplate(t)}>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm font-semibold text-neutral-900 group-hover:underline decoration-neutral-400 underline-offset-4">{t.title}</CardTitle>
                          <CardDescription className="line-clamp-2 text-xs mt-1">
                            Uses: {t.default_tags?.join(', ') || 'General'}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Select value={kind} onValueChange={(v: any) => setKind(v)}>
                <SelectTrigger className="w-40 bg-white border-neutral-200 focus:ring-neutral-200">
                  <SelectValue placeholder="Post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="intent">Looking for X</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Synapse Analysis Banner */}
              <div className="bg-gradient-to-r from-neutral-100 to-white border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full border border-neutral-200 shadow-sm">
                    <img src="/synapse.logo.png" alt="Synapse" className="w-4 h-4 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Synapse Assistant</p>
                    <p className="text-[10px] text-neutral-500">Auto-fill skills based on description</p>
                  </div>
                </div>
                <Button size="sm" onClick={runSynapseAnalysis} variant="secondary" className="bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 text-xs h-8">
                  Analyze
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="uppercase text-[10px] font-semibold text-neutral-500 tracking-widest pl-1">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={kind === 'project' ? "Project Title" : "What are you looking for?"}
                    className="h-14 text-xl font-bold border-neutral-200 bg-white focus:border-neutral-900 focus:ring-0 transition-all px-4 placeholder:text-neutral-300 rounded-xl shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="uppercase text-[10px] font-semibold text-neutral-500 tracking-widest pl-1">Description</Label>
                  <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm bg-white focus-within:border-neutral-400 transition-colors">
                    <RichTextEditor
                      content={description}
                      onChange={setDescription}
                      placeholder="Provide details about the goals, requirements, and timeline..."
                      className="min-h-[300px] border-none focus:ring-0 text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Participation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-semibold text-neutral-500 tracking-widest">Commitment</Label>
                    <Select value={commitment} onValueChange={(v: any) => setCommitment(v)}>
                      <SelectTrigger className="h-10 bg-neutral-50 border-neutral-200"><SelectValue /></SelectTrigger>
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
                    <Label className="uppercase text-[10px] font-semibold text-neutral-500 tracking-widest">Location</Label>
                    <Select value={location} onValueChange={(v: any) => setLocation(v)}>
                      <SelectTrigger className="h-10 bg-neutral-50 border-neutral-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="in_person">In-person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-semibold text-neutral-500 tracking-widest">Timezone</Label>
                    <Input value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="Optional" className="bg-neutral-50 border-neutral-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-semibold text-neutral-500 tracking-widest">Payment</Label>
                    <Select value={isPaid ? 'yes' : 'no'} onValueChange={(v) => setIsPaid(v === 'yes')}>
                      <SelectTrigger className="h-10 bg-neutral-50 border-neutral-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Unpaid / Volunteer</SelectItem>
                        <SelectItem value="yes">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Target Audience</h3>

                <TagsInput label="Areas of Research" values={areas} setValues={setAreas} placeholder="e.g. Neurology" />
                <TagsInput label="Skills Needed" values={skills} setValues={setSkills} placeholder="e.g. Python" />
                <TagsInput label="Tags" values={tags} setValues={setTags} placeholder="e.g. Urgent" />
              </div>

              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                <Label className="uppercase text-[10px] font-semibold text-neutral-500 tracking-widest block">Collaboration Type</Label>
                <div className="flex flex-wrap gap-2">
                  {(['co_authoring', 'dataset_sharing', 'mentoring', 'implementation', 'analysis', 'review'] as CollabType[]).map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className={`cursor-pointer border py-1.5 px-3 rounded-md transition-all ${collabTypes.includes(t) ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'}`}
                      onClick={() => toggleCollabType(t)}
                    >
                      {t.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={onSubmit} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-12 text-sm font-bold shadow-md rounded-xl">
                Publish Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
