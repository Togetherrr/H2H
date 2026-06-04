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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_strategies: {
        Row: {
          app_id: string | null
          content: string
          id: string
          order_num: number
        }
        Insert: {
          app_id?: string | null
          content: string
          id?: string
          order_num: number
        }
        Update: {
          app_id?: string | null
          content?: string
          id?: string
          order_num?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_strategies_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "voting_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      award_ceremony_wins: {
        Row: {
          category: string
          ceremony: string
          created_at: string
          href: string | null
          id: string
          year: string
        }
        Insert: {
          category: string
          ceremony: string
          created_at?: string
          href?: string | null
          id: string
          year: string
        }
        Update: {
          category?: string
          ceremony?: string
          created_at?: string
          href?: string | null
          id?: string
          year?: string
        }
        Relationships: []
      }
      award_event_apps: {
        Row: {
          app_id: string
          award_name: string | null
          awards: Json
          created_at: string
          description: string | null
          event_id: string
          guide_url: string | null
          id: string
          sort_order: number
        }
        Insert: {
          app_id: string
          award_name?: string | null
          awards?: Json
          created_at?: string
          description?: string | null
          event_id: string
          guide_url?: string | null
          id?: string
          sort_order?: number
        }
        Update: {
          app_id?: string
          award_name?: string | null
          awards?: Json
          created_at?: string
          description?: string | null
          event_id?: string
          guide_url?: string | null
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "award_event_apps_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "voting_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_event_apps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "award_events"
            referencedColumns: ["id"]
          },
        ]
      }
      award_events: {
        Row: {
          ceremony_at: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          nominations: Json
          reflection_rate: Json
          sort_order: number
        }
        Insert: {
          ceremony_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          nominations?: Json
          reflection_rate?: Json
          sort_order?: number
        }
        Update: {
          ceremony_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          nominations?: Json
          reflection_rate?: Json
          sort_order?: number
        }
        Relationships: []
      }
      feedback_messages: {
        Row: {
          category: string
          created_at: string
          email: string | null
          id: string
          message: string
          name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      guide_steps: {
        Row: {
          app_id: string | null
          description: string | null
          id: string
          image_url: string | null
          step_num: number
          title: string
        }
        Insert: {
          app_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          step_num: number
          title: string
        }
        Update: {
          app_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          step_num?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_steps_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "voting_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      h2h_item_snapshots: {
        Row: {
          created_at: string
          daily_kworb: number | null
          id: string
          item_id: string
          source_daily_kworb: number | null
          total: number
          ts: string
        }
        Insert: {
          created_at?: string
          daily_kworb?: number | null
          id?: string
          item_id: string
          source_daily_kworb?: number | null
          total: number
          ts: string
        }
        Update: {
          created_at?: string
          daily_kworb?: number | null
          id?: string
          item_id?: string
          source_daily_kworb?: number | null
          total?: number
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "h2h_item_snapshots_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "h2h_items"
            referencedColumns: ["id"]
          },
        ]
      }
      h2h_items: {
        Row: {
          cover_url: string | null
          created_at: string
          id: string
          is_active: boolean
          platform_id: string
          release_date: string | null
          source_updated_at: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          platform_id: string
          release_date?: string | null
          source_updated_at?: string | null
          title?: string
          type: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          platform_id?: string
          release_date?: string | null
          source_updated_at?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          category: string | null
          created_at: string | null
          delete_url: string | null
          id: string
          name: string
          size: number | null
          type: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          delete_url?: string | null
          id?: string
          name: string
          size?: number | null
          type?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          delete_url?: string | null
          id?: string
          name?: string
          size?: number | null
          type?: string | null
          url?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          bio_short: string | null
          bio_short_en: string | null
          birth_date: string | null
          birthplace: string | null
          blood_type: string | null
          card: Json | null
          cover_image_url: string | null
          created_at: string
          detail: Json | null
          emoji: string | null
          english_name: string | null
          favorites: Json | null
          full_name: string | null
          full_name_kr: string | null
          fun_facts_en: string[] | null
          fun_facts_vi: string[] | null
          hakyuha_character: string | null
          height_cm: number | null
          id: string
          intro: string | null
          intro_translations: Json | null
          is_active: boolean
          mbti: string | null
          metadata: Json | null
          nationality: string | null
          nicknames: string[] | null
          positions: string[] | null
          profile_image_url: string | null
          role_model: string | null
          slug: string
          sort_order: number
          source_url: string | null
          stage_name: string
          stage_name_kr: string | null
          training_years: number | null
          updated_at: string
          zodiac: string | null
        }
        Insert: {
          bio_short?: string | null
          bio_short_en?: string | null
          birth_date?: string | null
          birthplace?: string | null
          blood_type?: string | null
          card?: Json | null
          cover_image_url?: string | null
          created_at?: string
          detail?: Json | null
          emoji?: string | null
          english_name?: string | null
          favorites?: Json | null
          full_name?: string | null
          full_name_kr?: string | null
          fun_facts_en?: string[] | null
          fun_facts_vi?: string[] | null
          hakyuha_character?: string | null
          height_cm?: number | null
          id?: string
          intro?: string | null
          intro_translations?: Json | null
          is_active?: boolean
          mbti?: string | null
          metadata?: Json | null
          nationality?: string | null
          nicknames?: string[] | null
          positions?: string[] | null
          profile_image_url?: string | null
          role_model?: string | null
          slug: string
          sort_order?: number
          source_url?: string | null
          stage_name: string
          stage_name_kr?: string | null
          training_years?: number | null
          updated_at?: string
          zodiac?: string | null
        }
        Update: {
          bio_short?: string | null
          bio_short_en?: string | null
          birth_date?: string | null
          birthplace?: string | null
          blood_type?: string | null
          card?: Json | null
          cover_image_url?: string | null
          created_at?: string
          detail?: Json | null
          emoji?: string | null
          english_name?: string | null
          favorites?: Json | null
          full_name?: string | null
          full_name_kr?: string | null
          fun_facts_en?: string[] | null
          fun_facts_vi?: string[] | null
          hakyuha_character?: string | null
          height_cm?: number | null
          id?: string
          intro?: string | null
          intro_translations?: Json | null
          is_active?: boolean
          mbti?: string | null
          metadata?: Json | null
          nationality?: string | null
          nicknames?: string[] | null
          positions?: string[] | null
          profile_image_url?: string | null
          role_model?: string | null
          slug?: string
          sort_order?: number
          source_url?: string | null
          stage_name?: string
          stage_name_kr?: string | null
          training_years?: number | null
          updated_at?: string
          zodiac?: string | null
        }
        Relationships: []
      }
      music_show_wins: {
        Row: {
          created_at: string
          date: string
          headline: string
          href: string | null
          id: string
          program: string
          song: string
        }
        Insert: {
          created_at?: string
          date: string
          headline: string
          href?: string | null
          id: string
          program: string
          song: string
        }
        Update: {
          created_at?: string
          date?: string
          headline?: string
          href?: string | null
          id?: string
          program?: string
          song?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          content_en: string
          created_at: string
          id: string
          is_active: boolean
          is_pinned: boolean
          link: string | null
          link_text_en: string | null
          published_at: string
          sort_order: number
          title_en: string
          type: string
          updated_at: string
        }
        Insert: {
          content_en: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          link?: string | null
          link_text_en?: string | null
          published_at?: string
          sort_order?: number
          title_en: string
          type?: string
          updated_at?: string
        }
        Update: {
          content_en?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          link?: string | null
          link_text_en?: string | null
          published_at?: string
          sort_order?: number
          title_en?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      releases: {
        Row: {
          cover_url: string | null
          created_at: string
          id: string
          is_published: boolean
          release_date: string
          release_type: string
          slug: string
          source_url: string | null
          spotify_url: string | null
          subtitle: string | null
          summary: string | null
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          release_date: string
          release_type: string
          slug: string
          source_url?: string | null
          spotify_url?: string | null
          subtitle?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          release_date?: string
          release_type?: string
          slug?: string
          source_url?: string | null
          spotify_url?: string | null
          subtitle?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          company: string | null
          created_at: string
          debut_date: string | null
          description: string | null
          dorms: Json | null
          fandom_name: string | null
          group_name: string
          id: number
          labels: string | null
          logo_note: string | null
          logo_url: string | null
          mascot: string | null
          metadata: Json | null
          official_color: string | null
          official_greeting: string | null
          origin: string | null
          short_name: string | null
          sns: Json | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          debut_date?: string | null
          description?: string | null
          dorms?: Json | null
          fandom_name?: string | null
          group_name: string
          id?: number
          labels?: string | null
          logo_note?: string | null
          logo_url?: string | null
          mascot?: string | null
          metadata?: Json | null
          official_color?: string | null
          official_greeting?: string | null
          origin?: string | null
          short_name?: string | null
          sns?: Json | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          debut_date?: string | null
          description?: string | null
          dorms?: Json | null
          fandom_name?: string | null
          group_name?: string
          id?: number
          labels?: string | null
          logo_note?: string | null
          logo_url?: string | null
          mascot?: string | null
          metadata?: Json | null
          official_color?: string | null
          official_greeting?: string | null
          origin?: string | null
          short_name?: string | null
          sns?: Json | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          note: string | null
          platform: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          note?: string | null
          platform: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          note?: string | null
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          cover_url: string | null
          created_at: string
          event_date: string
          event_type: string
          id: string
          is_published: boolean
          slug: string
          source_url: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          event_date: string
          event_type: string
          id?: string
          is_published?: boolean
          slug: string
          source_url?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          event_date?: string
          event_type?: string
          id?: string
          is_published?: boolean
          slug?: string
          source_url?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          created_at: string
          id: string
          is_title_track: boolean
          release_id: string
          title: string
          track_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_title_track?: boolean
          release_id: string
          title: string
          track_number: number
        }
        Update: {
          created_at?: string
          id?: string
          is_title_track?: boolean
          release_id?: string
          title?: string
          track_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_apps: {
        Row: {
          android_url: string | null
          category: string
          ceremony_at: string | null
          collection_methods: string[] | null
          created_at: string | null
          currencies: string[] | null
          description: string | null
          guide_url: string | null
          id: string
          ios_url: string | null
          is_featured: boolean | null
          logo_url: string | null
          name: string
          program_name: string | null
          reflection_rate: string | null
          website_url: string | null
        }
        Insert: {
          android_url?: string | null
          category: string
          ceremony_at?: string | null
          collection_methods?: string[] | null
          created_at?: string | null
          currencies?: string[] | null
          description?: string | null
          guide_url?: string | null
          id?: string
          ios_url?: string | null
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          program_name?: string | null
          reflection_rate?: string | null
          website_url?: string | null
        }
        Update: {
          android_url?: string | null
          category?: string
          ceremony_at?: string | null
          collection_methods?: string[] | null
          created_at?: string | null
          currencies?: string[] | null
          description?: string | null
          guide_url?: string | null
          id?: string
          ios_url?: string | null
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          program_name?: string | null
          reflection_rate?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      voting_rounds: {
        Row: {
          app_id: string | null
          created_at: string | null
          display_timezone: string | null
          end_at: string
          event_id: string | null
          id: string
          is_active: boolean | null
          round_name: string
          start_at: string
        }
        Insert: {
          app_id?: string | null
          created_at?: string | null
          display_timezone?: string | null
          end_at: string
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          round_name: string
          start_at: string
        }
        Update: {
          app_id?: string | null
          created_at?: string | null
          display_timezone?: string | null
          end_at?: string
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          round_name?: string
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voting_rounds_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "voting_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_rounds_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "award_events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const
