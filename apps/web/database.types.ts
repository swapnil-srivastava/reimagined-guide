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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          id: number
          postal_code: string
          state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country: string
          created_at?: string | null
          id?: number
          postal_code: string
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          id?: number
          postal_code?: string
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          organizer_id: string | null
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          organizer_id?: string | null
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          organizer_id?: string | null
          time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          metadata: Record<string, unknown> | null
          order_type: string | null
          payment_intent_id: string | null
          payment_method: string | null
          status: string
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Record<string, unknown> | null
          order_type?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status: string
          total: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Record<string, unknown> | null
          order_type?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string
          total?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_drafts: {
        Row: {
          audio: string | null
          content: string
          created_at: string
          post_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["post_status"]
          submitted_at: string | null
          title: string
          uid: string
          updated_at: string
          videoLink: string | null
        }
        Insert: {
          audio?: string | null
          content?: string
          created_at?: string
          post_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          submitted_at?: string | null
          title: string
          uid: string
          updated_at?: string
          videoLink?: string | null
        }
        Update: {
          audio?: string | null
          content?: string
          created_at?: string
          post_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          submitted_at?: string | null
          title?: string
          uid?: string
          updated_at?: string
          videoLink?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_drafts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_drafts_uid_fkey"
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
          approved_by: string | null
          audio: string | null
          clap_count: number | null
          content: string | null
          created_at: string | null
          dislike_count: number | null
          heart_count: number | null
          id: string
          like_count: number | null
          photo_url: string | null
          published: boolean | null
          published_at: string | null
          slug: string | null
          title: string | null
          uid: string | null
          updated_at: string | null
          username: string | null
          videoLink: string | null
        }
        Insert: {
          approved?: boolean | null
          approved_by?: string | null
          audio?: string | null
          clap_count?: number | null
          content?: string | null
          created_at?: string | null
          dislike_count?: number | null
          heart_count?: number | null
          id?: string
          like_count?: number | null
          photo_url?: string | null
          published?: boolean | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
          uid?: string | null
          updated_at?: string | null
          username?: string | null
          videoLink?: string | null
        }
        Update: {
          approved?: boolean | null
          approved_by?: string | null
          audio?: string | null
          clap_count?: number | null
          content?: string | null
          created_at?: string | null
          dislike_count?: number | null
          heart_count?: number | null
          id?: string
          like_count?: number | null
          photo_url?: string | null
          published?: boolean | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
          uid?: string | null
          updated_at?: string | null
          username?: string | null
          videoLink?: string | null
        }
        Relationships: [
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
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          stripe_customer: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          stripe_customer?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
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
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_post: {
        Args: { p_post_id: string }
        Returns: Database["public"]["Tables"]["posts"]["Row"]
      }
      create_post: {
        Args: { p_title: string }
        Returns: Database["public"]["Tables"]["posts"]["Row"]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      request_post_changes: {
        Args: { p_post_id: string; p_note: string }
        Returns: Database["public"]["Tables"]["post_drafts"]["Row"]
      }
      unpublish_post: {
        Args: { p_post_id: string }
        Returns: Database["public"]["Tables"]["posts"]["Row"]
      }
    }
    Enums: {
      // Stored as TEXT with a CHECK constraint in post_drafts.status
      post_status:
        | "draft"
        | "copy_ready"
        | "web_ready"
        | "approved"
        | "changes_requested"
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

// REPLACE ANYTHING BEFORE THIS ONCE THE TABLE CHANGES 

// DO NOT REMOVE FROM HERE 

    type TABLES = Pick<Database["public"], "Tables">;
    type POST_TABLE = Pick<TABLES["Tables"], "posts">;
    type POST_ROW = Pick<POST_TABLE["posts"], "Row">;
    
    export type POST = Pick<
      POST_ROW["Row"],
      | "approved"
      | "content"
      | "created_at"
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
    > & Partial<Pick<POST_ROW["Row"], "published_at" | "approved_by">>;

    type POST_DRAFT_TABLE = Pick<TABLES["Tables"], "post_drafts">;

    export type POST_STATUS = Database["public"]["Enums"]["post_status"];

    export type POST_DRAFT = POST_DRAFT_TABLE["post_drafts"]["Row"];

    /** A draft together with the live post it belongs to */
    export type POST_DRAFT_WITH_POST = POST_DRAFT & {
      posts: POST | null;
    };
    
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

    type PRODUCTS_TABLE = Pick<TABLES["Tables"], "products">;
    type PRODUCTS_ROW = Pick<PRODUCTS_TABLE["products"], "Row">;
    type PRODUCT_INSERT = Pick<PRODUCTS_TABLE["products"], "Insert">;

    export type PRODUCT = Pick<
      PRODUCTS_ROW["Row"],
      | "name"
      | "created_at"
      | "id"
      | "description"
      | "price"
      | "stock"
      | "image_url"
    >;

    type ADDRESSES_TABLE = Pick<TABLES["Tables"], "addresses">;
    type ADDRESSES_ROW = Pick<ADDRESSES_TABLE["addresses"], "Row">;
    type ADDRESS_INSERT = Pick<ADDRESSES_TABLE["addresses"], "Insert">;

    export type ADDRESS = Pick<
      ADDRESSES_ROW["Row"],
      | "id"
      | "user_id"
      | "created_at"
      | "updated_at"
      | "address_line1"
      | "address_line2"
      | "postal_code"
      | "city"
      | "state"
      | "country"
    >;