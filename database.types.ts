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
      emotions: {
        Row: {
          created_at: string | null
          emotion_type: string | null
          id: string
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emotion_type?: string | null
          id?: string
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emotion_type?: string | null
          id?: string
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emotions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emotions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          company: string
          created_at: string
          id: string
          isPresent: boolean
          location: string
          position: string
          position_description: string
          position_end_time: string | null
          position_start_time: string
          skills: string[] | null
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          isPresent: boolean
          location: string
          position: string
          position_description: string
          position_end_time?: string | null
          position_start_time: string
          skills?: string[] | null
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          isPresent?: boolean
          location?: string
          position?: string
          position_description?: string
          position_end_time?: string | null
          position_start_time?: string
          skills?: string[] | null
        }
        Relationships: []
      }
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
        Relationships: [
          {
            foreignKeyName: "hearts_pid_fkey"
            columns: ["pid"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
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
          id?: string
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
        Relationships: [
          {
            foreignKeyName: "leadingtech_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          approved: boolean | null
          audio: string | null
          clap_count: number | null
          content: string | null
          created_at: string | null
          dislike_count: number | null
          heart_count: number | null
          heartcount: number | null
          heartid: string | null
          id: string
          like_count: number | null
          photo_url: string | null
          published: boolean | null
          slug: string | null
          title: string | null
          uid: string | null
          updated_at: string | null
          username: string | null
          videoLink: string | null
        }
        Insert: {
          approved?: boolean | null
          audio?: string | null
          clap_count?: number | null
          content?: string | null
          created_at?: string | null
          dislike_count?: number | null
          heart_count?: number | null
          heartcount?: number | null
          heartid?: string | null
          id?: string
          like_count?: number | null
          photo_url?: string | null
          published?: boolean | null
          slug?: string | null
          title?: string | null
          uid?: string | null
          updated_at?: string | null
          username?: string | null
          videoLink?: string | null
        }
        Update: {
          approved?: boolean | null
          audio?: string | null
          clap_count?: number | null
          content?: string | null
          created_at?: string | null
          dislike_count?: number | null
          heart_count?: number | null
          heartcount?: number | null
          heartid?: string | null
          id?: string
          like_count?: number | null
          photo_url?: string | null
          published?: boolean | null
          slug?: string | null
          title?: string | null
          uid?: string | null
          updated_at?: string | null
          username?: string | null
          videoLink?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_heartid_fkey"
            columns: ["heartid"]
            isOneToOne: false
            referencedRelation: "hearts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_photo_url_fkey"
            columns: ["photo_url"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["avatar_url"]
          },
          {
            foreignKeyName: "posts_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["username"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          stripe_customer: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          stripe_customer?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          stripe_customer?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      technologies: {
        Row: {
          created_at: string | null
          id: string
          name: string
          tech_color: string | null
          uid: string
        }
        Insert: {
          created_at?: string | null
          id?: string
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
        Relationships: [
          {
            foreignKeyName: "technologies_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

    type TABLES = Pick<Database["public"], "Tables">;
    type POST_TABLE = Pick<TABLES["Tables"], "posts">;
    type POST_ROW = Pick<POST_TABLE["posts"], "Row">;
    
    export type POST = Pick<
      POST_ROW["Row"],
      | "approved"
      | "content"
      | "created_at"
      | "heartcount"
      | "heartid"
      | "id"
      | "photo_url"
      | "clap_count"
      | "heart_count"
      | "dislike_count"
      | "like_count"
      | "published"
      | "slug"
      | "title"
      | "uid"
      | "updated_at"
      | "username"
      | "audio"
      | "videoLink"
    >;
    
    type LEADINGTECH_TABLE = Pick<TABLES["Tables"], "leadingtech">;
    type LEADINGTECH_ROW = Pick<LEADINGTECH_TABLE["leadingtech"], "Row">;
    
    export type LEADINGTECH = Pick<
      LEADINGTECH_ROW["Row"],
      "id" | "uid" | "created_at" | "name" | "tech_color"
    >;
    
    type TECHNOLOGIES_TABLE = Pick<TABLES["Tables"], "technologies">;
    type TECHNOLOGIES_ROW = Pick<TECHNOLOGIES_TABLE["technologies"], "Row">;
    
    export type TECHNOLOGIES = Pick<
      TECHNOLOGIES_ROW["Row"],
      "id" | "uid" | "created_at" | "name" | "tech_color"
    >;
    
    type EXPERIENCES_TABLE = Pick<TABLES["Tables"], "experiences">;
    type EXPERIENCES_ROW = Pick<EXPERIENCES_TABLE["experiences"], "Row">;
    type EXPERIENCES_INSERT = Pick<EXPERIENCES_TABLE["experiences"], "Insert">;
    
    export type EXPERIENCES = Pick<
      EXPERIENCES_ROW["Row"],
      | "company"
      | "created_at"
      | "isPresent"
      | "id"
      | "location"
      | "position"
      | "position_description"
      | "position_end_time"
      | "position_start_time"
    >;
    
    export type EXPERIENCES_INSERT_DATA = Pick<
      EXPERIENCES_INSERT["Insert"],
      | "company"
      | "created_at"
      | "isPresent"
      | "location"
      | "position"
      | "position_description"
      | "position_end_time"
      | "position_start_time"
    >;