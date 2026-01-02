export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string
          category_id: string | null
          club_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          published_at: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id?: string | null
          club_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: string | null
          club_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_memberships: {
        Row: {
          club_id: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          club_id: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      club_posts: {
        Row: {
          club_id: string
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          club_id: string
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          club_id?: string
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          banner_url: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string | null
          author_id: string
          content: string
          created_at: string
          discussion_id: string | null
          id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          author_id: string
          content: string
          created_at?: string
          discussion_id?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          author_id?: string
          content?: string
          created_at?: string
          discussion_id?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      discussions: {
        Row: {
          author_id: string
          category_id: string | null
          club_id: string | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id?: string | null
          club_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: string | null
          club_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          applicant_id: string
          cover_note: string | null
          created_at: string
          id: string
          project_id: string
          status: Database["public"]["Enums"]["join_request_status"]
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_note?: string | null
          created_at?: string
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["join_request_status"]
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_note?: string | null
          created_at?: string
          id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["join_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_templates: {
        Row: {
          content: string
          created_at: string
          default_collaboration_types:
            | Database["public"]["Enums"]["collaboration_type"][]
            | null
          default_commitment:
            | Database["public"]["Enums"]["commitment_level"]
            | null
          default_skills: string[] | null
          default_tags: string[] | null
          id: string
          owner_id: string | null
          scope: Database["public"]["Enums"]["template_scope"]
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          default_collaboration_types?:
            | Database["public"]["Enums"]["collaboration_type"][]
            | null
          default_commitment?:
            | Database["public"]["Enums"]["commitment_level"]
            | null
          default_skills?: string[] | null
          default_tags?: string[] | null
          id?: string
          owner_id?: string | null
          scope?: Database["public"]["Enums"]["template_scope"]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          default_collaboration_types?:
            | Database["public"]["Enums"]["collaboration_type"][]
            | null
          default_commitment?:
            | Database["public"]["Enums"]["commitment_level"]
            | null
          default_skills?: string[] | null
          default_tags?: string[] | null
          id?: string
          owner_id?: string | null
          scope?: Database["public"]["Enums"]["template_scope"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          collaboration_preferences: string[] | null
          created_at: string
          current_projects: string | null
          education: string | null
          expertise: string[] | null
          full_name: string | null
          id: string
          interests: string[] | null
          linkedin_url: string | null
          role: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          collaboration_preferences?: string[] | null
          created_at?: string
          current_projects?: string | null
          education?: string | null
          expertise?: string[] | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          linkedin_url?: string | null
          role?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          collaboration_preferences?: string[] | null
          created_at?: string
          current_projects?: string | null
          education?: string | null
          expertise?: string[] | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          linkedin_url?: string | null
          role?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          application_instructions: string | null
          areas: string[] | null
          collaboration_types: Database["public"]["Enums"]["collaboration_type"][]
          commitment: Database["public"]["Enums"]["commitment_level"]
          created_at: string
          creator_id: string
          deadline: string | null
          description: string
          id: string
          is_paid: boolean
          kind: Database["public"]["Enums"]["post_kind"]
          location: Database["public"]["Enums"]["location_type"] | null
          skills_needed: string[] | null
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          timezone: string | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          application_instructions?: string | null
          areas?: string[] | null
          collaboration_types?: Database["public"]["Enums"]["collaboration_type"][]
          commitment: Database["public"]["Enums"]["commitment_level"]
          created_at?: string
          creator_id: string
          deadline?: string | null
          description: string
          id?: string
          is_paid?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          location?: Database["public"]["Enums"]["location_type"] | null
          skills_needed?: string[] | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          timezone?: string | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          application_instructions?: string | null
          areas?: string[] | null
          collaboration_types?: Database["public"]["Enums"]["collaboration_type"][]
          commitment?: Database["public"]["Enums"]["commitment_level"]
          created_at?: string
          creator_id?: string
          deadline?: string | null
          description?: string
          id?: string
          is_paid?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          location?: Database["public"]["Enums"]["location_type"] | null
          skills_needed?: string[] | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          timezone?: string | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          email: string | null
          expertise: string[] | null
          full_name: string | null
          id: string | null
          interests: string[] | null
          skills: string[] | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_club_member: {
        Args: { p_club_id: string; p_user_id: string }
        Returns: Json
      }
      get_club_members: {
        Args: { club_id_param: string }
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          id: string
          user_id: string
          username: string
        }[]
      }
      get_club_posts: {
        Args: { club_id_param: string }
        Returns: {
          avatar_url: string
          club_id: string
          content: string
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
          username: string
        }[]
      }
      get_random_profiles: {
        Args: { profile_count: number }
        Returns: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          collaboration_preferences: string[] | null
          created_at: string
          current_projects: string | null
          education: string | null
          expertise: string[] | null
          full_name: string | null
          id: string
          interests: string[] | null
          linkedin_url: string | null
          role: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          username: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      collaboration_type:
        | "co_authoring"
        | "dataset_sharing"
        | "mentoring"
        | "implementation"
        | "analysis"
        | "review"
      commitment_level:
        | "one-time"
        | "2-4 hrs/week"
        | "5-10 hrs/week"
        | "10+ hrs/week"
        | "full-time"
      join_request_status: "pending" | "accepted" | "rejected" | "withdrawn"
      location_type: "remote" | "hybrid" | "in_person"
      post_kind: "project" | "intent"
      project_status: "open" | "closed" | "draft"
      template_scope: "global" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      collaboration_type: [
        "co_authoring",
        "dataset_sharing",
        "mentoring",
        "implementation",
        "analysis",
        "review",
      ],
      commitment_level: [
        "one-time",
        "2-4 hrs/week",
        "5-10 hrs/week",
        "10+ hrs/week",
        "full-time",
      ],
      join_request_status: ["pending", "accepted", "rejected", "withdrawn"],
      location_type: ["remote", "hybrid", "in_person"],
      post_kind: ["project", "intent"],
      project_status: ["open", "closed", "draft"],
      template_scope: ["global", "user"],
    },
  },
} as const
