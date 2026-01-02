// Types for Clubs feature
export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  member_count?: number;
  // Add any additional fields that might be coming from your database
  [key: string]: any;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  [key: string]: any; // Allow additional properties
}

export type ClubWithMembers = Club & {
  members: ClubMember[];
};

export type ClubMemberWithUser = ClubMember & {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
};

// Extend the Supabase types
declare global {
  namespace Database {
    interface Tables {
      clubs: {
        Row: Omit<Club, 'is_member' | 'member_count'>;
        Insert: Omit<Club, 'id' | 'created_at' | 'updated_at' | 'is_member' | 'member_count'>;
        Update: Partial<Omit<Club, 'id' | 'created_at' | 'updated_at' | 'is_member' | 'member_count'>>;
      };
      club_members: {
        Row: ClubMember;
        Insert: Omit<ClubMember, 'id' | 'created_at' | 'user'>;
        Update: Partial<Omit<ClubMember, 'id' | 'created_at' | 'club_id' | 'user_id' | 'user'>>;
      };
    }
  }
}

export {}; // This file is a module
