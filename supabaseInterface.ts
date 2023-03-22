export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hearts: {
        Row: {
          created_at: string
          heart_users: string[] | null
          id: string
          pid: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          heart_users?: string[] | null
          id?: string
          pid?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          heart_users?: string[] | null
          id?: string
          pid?: string | null
          updated_at?: string | null
        }
      }
      leadingtech: {
        Row: {
          created_at: string | null
          id: string
          name: string
          tech_color: string | null
          uid: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          tech_color?: string | null
          uid: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          tech_color?: string | null
          uid?: string
        }
      }
      posts: {
        Row: {
          approved: boolean | null
          content: string | null
          created_at: string | null
          heartcount: number | null
          heartid: string | null
          id: string
          photo_url: string | null
          published: boolean | null
          slug: string | null
          title: string | null
          uid: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          approved?: boolean | null
          content?: string | null
          created_at?: string | null
          heartcount?: number | null
          heartid?: string | null
          id?: string
          photo_url?: string | null
          published?: boolean | null
          slug?: string | null
          title?: string | null
          uid?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          approved?: boolean | null
          content?: string | null
          created_at?: string | null
          heartcount?: number | null
          heartid?: string | null
          id?: string
          photo_url?: string | null
          published?: boolean | null
          slug?: string | null
          title?: string | null
          uid?: string | null
          updated_at?: string | null
          username?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
      }
      "technologies ": {
        Row: {
          created_at: string | null
          id: string
          "name ": string
          tech_color: string | null
          uid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          "name ": string
          tech_color?: string | null
          uid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          "name "?: string
          tech_color?: string | null
          uid?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
