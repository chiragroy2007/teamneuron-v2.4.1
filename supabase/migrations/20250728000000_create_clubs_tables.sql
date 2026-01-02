-- Create clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create club_memberships table
CREATE TABLE IF NOT EXISTS public.club_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Create club_posts table
CREATE TABLE IF NOT EXISTS public.club_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_club_memberships_club_id ON public.club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_user_id ON public.club_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_club_posts_club_id ON public.club_posts(club_id);
CREATE INDEX IF NOT EXISTS idx_club_posts_user_id ON public.club_posts(user_id);

-- Enable Row Level Security
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clubs
CREATE POLICY "Enable read access for all users" ON public.clubs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.clubs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for club creators" ON public.clubs
  FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for club_memberships
CREATE POLICY "Enable read access for club members" ON public.club_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships cm 
      WHERE cm.club_id = club_memberships.club_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for authenticated users" ON public.club_memberships
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for club_posts
CREATE POLICY "Enable read access for club members" ON public.club_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships cm 
      WHERE cm.club_id = club_posts.club_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for club members" ON public.club_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships cm 
      WHERE cm.club_id = club_posts.club_id 
      AND cm.user_id = auth.uid()
    )
  );

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at columns
CREATE TRIGGER update_clubs_updated_at
BEFORE UPDATE ON public.clubs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_posts_updated_at
BEFORE UPDATE ON public.club_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
