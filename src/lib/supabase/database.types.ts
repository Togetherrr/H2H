export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          birth_date: string | null
          cover_image_url: string | null
          created_at: string
          full_name: string | null
          id: string
          intro: string | null
          intro_translations: Json | null
          is_active: boolean
          nationality: string | null
          position: string | null
          profile_image_url: string | null
          slug: string
          sort_order: number
          stage_name: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          cover_image_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          intro?: string | null
          intro_translations?: Json | null
          is_active?: boolean
          nationality?: string | null
          position?: string | null
          profile_image_url?: string | null
          slug: string
          sort_order?: number
          stage_name: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          cover_image_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          intro?: string | null
          intro_translations?: Json | null
          is_active?: boolean
          nationality?: string | null
          position?: string | null
          profile_image_url?: string | null
          slug?: string
          sort_order?: number
          stage_name?: string
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
          role: "user" | "admin"
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: "user" | "admin"
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: "user" | "admin"
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
          fandom_name: string | null
          group_name: string
          id: number
          labels: string | null
          logo_note: string | null
          logo_url: string | null
          official_color: string | null
          origin: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          debut_date?: string | null
          description?: string | null
          fandom_name?: string | null
          group_name: string
          id?: number
          labels?: string | null
          logo_note?: string | null
          logo_url?: string | null
          official_color?: string | null
          origin?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          debut_date?: string | null
          description?: string | null
          fandom_name?: string | null
          group_name?: string
          id?: number
          labels?: string | null
          logo_note?: string | null
          logo_url?: string | null
          official_color?: string | null
          origin?: string | null
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
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
    }
    CompositeTypes: Record<string, never>
  }
}
