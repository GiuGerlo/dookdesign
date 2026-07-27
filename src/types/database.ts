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
          delivery_days: number | null
          description: string
          environment_layout: Json
          environment_renders: string[]
          featured: boolean
          height_cm: number | null
          id: string
          length_cm: number | null
          materials: string[]
          order: number
          published: boolean
          render_focus: Json
          render_focus_x: Json
          renders: string[]
          slug: string
          title: string
          updated_at: string
          width_cm: number | null
          year: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          delivery_days?: number | null
          description?: string
          environment_layout?: Json
          environment_renders?: string[]
          featured?: boolean
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          materials?: string[]
          order?: number
          published?: boolean
          render_focus?: Json
          render_focus_x?: Json
          renders?: string[]
          slug: string
          title: string
          updated_at?: string
          width_cm?: number | null
          year: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          delivery_days?: number | null
          description?: string
          environment_layout?: Json
          environment_renders?: string[]
          featured?: boolean
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          materials?: string[]
          order?: number
          published?: boolean
          render_focus?: Json
          render_focus_x?: Json
          renders?: string[]
          slug?: string
          title?: string
          updated_at?: string
          width_cm?: number | null
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
          hero_focus_mobile: number
          hero_focus_x: number
          hero_focus_x_mobile: number
          hero_image: string | null
          hero_image_mobile: string | null
          home_grid: Json
          id: string
          instagram_url: string | null
          location: string | null
          projects_grid: Json
          projects_intro: string | null
          updated_at: string
          whatsapp_url: string | null
        }
        Insert: {
          about_text?: string
          behance_url?: string | null
          email?: string | null
          hero_focus?: number
          hero_focus_mobile?: number
          hero_focus_x?: number
          hero_focus_x_mobile?: number
          hero_image?: string | null
          hero_image_mobile?: string | null
          home_grid?: Json
          id?: string
          instagram_url?: string | null
          location?: string | null
          projects_grid?: Json
          projects_intro?: string | null
          updated_at?: string
          whatsapp_url?: string | null
        }
        Update: {
          about_text?: string
          behance_url?: string | null
          email?: string | null
          hero_focus?: number
          hero_focus_mobile?: number
          hero_focus_x?: number
          hero_focus_x_mobile?: number
          hero_image?: string | null
          hero_image_mobile?: string | null
          home_grid?: Json
          id?: string
          instagram_url?: string | null
          location?: string | null
          projects_grid?: Json
          projects_intro?: string | null
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
