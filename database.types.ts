export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      experiences: {
        Row: {
          company: string;
          created_at: string;
          id: string;
          isPresent: boolean;
          location: string;
          position: string;
          position_description: string;
          position_end_time: string | null;
          position_start_time: string;
          skills: string[] | null;
        };
        Insert: {
          company: string;
          created_at?: string;
          id?: string;
          isPresent: boolean;
          location: string;
          position: string;
          position_description: string;
          position_end_time?: string | null;
          position_start_time: string;
          skills?: string[] | null;
        };
        Update: {
          company?: string;
          created_at?: string;
          id?: string;
          isPresent?: boolean;
          location?: string;
          position?: string;
          position_description?: string;
          position_end_time?: string | null;
          position_start_time?: string;
          skills?: string[] | null;
        };
        Relationships: [];
      };
      hearts: {
        Row: {
          created_at: string;
          heart_users: string[] | null;
          id: string;
          pid: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          heart_users?: string[] | null;
          id?: string;
          pid?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          heart_users?: string[] | null;
          id?: string;
          pid?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hearts_pid_fkey";
            columns: ["pid"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
      };
      leadingtech: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          tech_color: string | null;
          uid: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          tech_color?: string | null;
          uid: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          tech_color?: string | null;
          uid?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leadingtech_uid_fkey";
            columns: ["uid"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          approved: boolean | null;
          audio: string | null;
          content: string | null;
          created_at: string | null;
          heartcount: number | null;
          heartid: string | null;
          id: string;
          photo_url: string | null;
          published: boolean | null;
          slug: string | null;
          title: string | null;
          uid: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          approved?: boolean | null;
          audio?: string | null;
          content?: string | null;
          created_at?: string | null;
          heartcount?: number | null;
          heartid?: string | null;
          id?: string;
          photo_url?: string | null;
          published?: boolean | null;
          slug?: string | null;
          title?: string | null;
          uid?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          approved?: boolean | null;
          audio?: string | null;
          content?: string | null;
          created_at?: string | null;
          heartcount?: number | null;
          heartid?: string | null;
          id?: string;
          photo_url?: string | null;
          published?: boolean | null;
          slug?: string | null;
          title?: string | null;
          uid?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_heartid_fkey";
            columns: ["heartid"];
            referencedRelation: "hearts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_photo_url_fkey";
            columns: ["photo_url"];
            referencedRelation: "profiles";
            referencedColumns: ["avatar_url"];
          },
          {
            foreignKeyName: "posts_uid_fkey";
            columns: ["uid"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_username_fkey";
            columns: ["username"];
            referencedRelation: "profiles";
            referencedColumns: ["username"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          username: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      technologies: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          tech_color: string | null;
          uid: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          tech_color?: string | null;
          uid: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          tech_color?: string | null;
          uid?: string;
        };
        Relationships: [
          {
            foreignKeyName: "technologies_uid_fkey";
            columns: ["uid"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

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
  | "published"
  | "slug"
  | "title"
  | "uid"
  | "updated_at"
  | "username"
  | "audio"
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
