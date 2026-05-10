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
  public: {
    Tables: {
      h2h_item_snapshots: {
        Row: {
          created_at: string
          daily_kworb: number | null
          id: string
          item_id: string
          total: number
          ts: string
        }
        Insert: {
          created_at?: string
          daily_kworb?: number | null
          id?: string
          item_id: string
          total: number
          ts: string
        }
        Update: {
          created_at?: string
          daily_kworb?: number | null
          id?: string
          item_id?: string
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
          id: string
          name: string
          category: string
          program_name: string | null
          logo_url: string | null
          currencies: string[] | null
          collection_methods: string[] | null
          android_url: string | null
          ios_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          program_name?: string | null
          logo_url?: string | null
          currencies?: string[] | null
          collection_methods?: string[] | null
          android_url?: string | null
          ios_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          program_name?: string | null
          logo_url?: string | null
          currencies?: string[] | null
          collection_methods?: string[] | null
          android_url?: string | null
          ios_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      app_strategies: {
        Row: {
          id: string
          app_id: string
          content: string
          order_num: number
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          content: string
          order_num: number
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          content?: string
          order_num?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_strategies_app_id_fkey"
            columns: ["app_id"]
            referencedRelation: "voting_apps"
            referencedColumns: ["id"]
          }
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
  public: {
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const
