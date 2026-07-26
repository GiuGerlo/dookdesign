export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: { created_at: string; id: string; name: string; slug: string }
        Insert: { created_at?: string; id?: string; name: string; slug: string }
        Update: { created_at?: string; id?: string; name?: string; slug?: string }
        Relationships: []
      }
      projects: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          environment_layout: Json
          environment_renders: string[]
          featured: boolean
          id: string
          materials: string[]
          order: number
          published: boolean
          render_focus: Json
          render_focus_x: Json
          renders: string[]
          slug: string
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string
          environment_layout?: Json
          environment_renders?: string[]
          featured?: boolean
          id?: string
          materials?: string[]
          order?: number
          published?: boolean
          render_focus?: Json
          render_focus_x?: Json
          renders?: string[]
          slug: string
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          environment_layout?: Json
          environment_renders?: string[]
          featured?: boolean
          id?: string
          materials?: string[]
          order?: number
          published?: boolean
          render_focus?: Json
          render_focus_x?: Json
          renders?: string[]
          slug?: string
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'projects_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      site_settings: {
        Row: {
          about_text: string
          behance_url: string | null
          email: string | null
          hero_focus: number
          hero_focus_x: number
          hero_image: string | null
          home_grid: Json
          id: string
          instagram_url: string | null
          location: string | null
          updated_at: string
          whatsapp_url: string | null
        }
        Insert: {
          about_text?: string
          behance_url?: string | null
          email?: string | null
          hero_focus?: number
          hero_focus_x?: number
          hero_image?: string | null
          home_grid?: Json
          id?: string
          instagram_url?: string | null
          location?: string | null
          updated_at?: string
          whatsapp_url?: string | null
        }
        Update: {
          about_text?: string
          behance_url?: string | null
          email?: string | null
          hero_focus?: number
          hero_focus_x?: number
          hero_image?: string | null
          home_grid?: Json
          id?: string
          instagram_url?: string | null
          location?: string | null
          updated_at?: string
          whatsapp_url?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
