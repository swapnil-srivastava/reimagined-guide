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
      booking_hosts: {
        Row: {
          active: boolean
          created_at: string
          id: string
          is_default: boolean
          name: string
          photo_url: string | null
          slug: string
          timezone: string
          title: string | null
          user_id: string | null
          feed_token_hash: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          photo_url?: string | null
          slug: string
          timezone?: string
          title?: string | null
          user_id?: string | null
          feed_token_hash?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          photo_url?: string | null
          slug?: string
          timezone?: string
          title?: string | null
          user_id?: string | null
          feed_token_hash?: string | null
        }
        Relationships: []
      }
      booking_types: {
        Row: {
          active: boolean
          buffer_after_minutes: number
          buffer_before_minutes: number
          cancel_cutoff_minutes: number
          created_at: string
          daily_limit: number | null
          description: string | null
          duration_minutes: number
          id: string
          location_kind: string
          location_value: string | null
          max_days_ahead: number
          min_notice_minutes: number
          name: string
          package_id: string | null
          slot_step_minutes: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          cancel_cutoff_minutes?: number
          created_at?: string
          daily_limit?: number | null
          description?: string | null
          duration_minutes?: number
          id?: string
          location_kind?: string
          location_value?: string | null
          max_days_ahead?: number
          min_notice_minutes?: number
          name: string
          package_id?: string | null
          slot_step_minutes?: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          cancel_cutoff_minutes?: number
          created_at?: string
          daily_limit?: number | null
          description?: string | null
          duration_minutes?: number
          id?: string
          location_kind?: string
          location_value?: string | null
          max_days_ahead?: number
          min_notice_minutes?: number
          name?: string
          package_id?: string | null
          slot_step_minutes?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_type_hosts: {
        Row: {
          booking_type_id: string
          host_id: string
          is_default: boolean
        }
        Insert: {
          booking_type_id: string
          host_id: string
          is_default?: boolean
        }
        Update: {
          booking_type_id?: string
          host_id?: string
          is_default?: boolean
        }
        Relationships: []
      }
      booking_weekly_hours: {
        Row: {
          end_time: string
          host_id: string
          id: string
          start_time: string
          weekday: number
        }
        Insert: {
          end_time: string
          host_id: string
          id?: string
          start_time: string
          weekday: number
        }
        Update: {
          end_time?: string
          host_id?: string
          id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: []
      }
      booking_date_overrides: {
        Row: {
          date: string
          end_time: string | null
          host_id: string
          id: string
          start_time: string | null
        }
        Insert: {
          date: string
          end_time?: string | null
          host_id: string
          id?: string
          start_time?: string | null
        }
        Update: {
          date?: string
          end_time?: string | null
          host_id?: string
          id?: string
          start_time?: string | null
        }
        Relationships: []
      }
      booking_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string
          host_id: string
          id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at: string
          host_id: string
          id?: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string
          host_id?: string
          id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: []
      }
      booking_entitlements: {
        Row: {
          booking_type_id: string
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          name: string | null
          order_id: string | null
          quantity: number
          revoked_at: string | null
          token_hash: string
          used: number
          nudged_at: string | null
          nudge_token_hash: string | null
        }
        Insert: {
          booking_type_id: string
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          name?: string | null
          order_id?: string | null
          quantity?: number
          revoked_at?: string | null
          token_hash: string
          used?: number
          nudged_at?: string | null
          nudge_token_hash?: string | null
        }
        Update: {
          booking_type_id?: string
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          name?: string | null
          order_id?: string | null
          quantity?: number
          revoked_at?: string | null
          token_hash?: string
          used?: number
          nudged_at?: string | null
          nudge_token_hash?: string | null
        }
        Relationships: []
      }
      booking_rate_limits: {
        Row: { key: string; window_start: string; hits: number }
        Insert: { key: string; window_start: string; hits?: number }
        Update: { key?: string; window_start?: string; hits?: number }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_type_id: string
          busy_from: string
          busy_until: string
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          ends_at: string
          entitlement_id: string | null
          host_id: string
          id: string
          invitee_email: string
          invitee_name: string
          invitee_timezone: string | null
          notes: string | null
          order_id: string | null
          rescheduled_from: string | null
          starts_at: string
          status: string
          updated_at: string
          reminder_24h_sent_at: string | null
          reminder_1h_sent_at: string | null
        }
        Insert: {
          booking_type_id: string
          busy_from: string
          busy_until: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          ends_at: string
          entitlement_id?: string | null
          host_id: string
          id?: string
          invitee_email: string
          invitee_name: string
          invitee_timezone?: string | null
          notes?: string | null
          order_id?: string | null
          rescheduled_from?: string | null
          starts_at: string
          status?: string
          updated_at?: string
          reminder_24h_sent_at?: string | null
          reminder_1h_sent_at?: string | null
        }
        Update: {
          booking_type_id?: string
          busy_from?: string
          busy_until?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          ends_at?: string
          entitlement_id?: string | null
          host_id?: string
          id?: string
          invitee_email?: string
          invitee_name?: string
          invitee_timezone?: string | null
          notes?: string | null
          order_id?: string | null
          rescheduled_from?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
          reminder_24h_sent_at?: string | null
          reminder_1h_sent_at?: string | null
        }
        Relationships: []
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
          name: string | null
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
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
          tags: string[]
          title: string
          uid: string
          updated_at: string
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
          tags?: string[]
          title: string
          uid: string
          updated_at?: string
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
          tags?: string[]
          title?: string
          uid?: string
          updated_at?: string
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
      newsletter_subscribers: {
        Row: {
          confirmation_sent_at: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          locale: string | null
          signup_ip_hash: string | null
          source: string | null
          status: string
          token: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmation_sent_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          locale?: string | null
          signup_ip_hash?: string | null
          source?: string | null
          status?: string
          token: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmation_sent_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          locale?: string | null
          signup_ip_hash?: string | null
          source?: string | null
          status?: string
          token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      post_views: {
        Row: {
          day: string
          post_id: string
          visitor_hash: string
        }
        Insert: {
          day?: string
          post_id: string
          visitor_hash: string
        }
        Update: {
          day?: string
          post_id?: string
          visitor_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
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
          view_count: number
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
          view_count?: number
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
          view_count?: number
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
          low_stock_threshold: number
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
          low_stock_threshold?: number
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
          low_stock_threshold?: number
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
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
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
      booking_book: {
        Args: {
          p_entitlement_id: string
          p_host_id: string
          p_starts_at: string
          p_ends_at: string
          p_busy_from: string
          p_busy_until: string
          p_name: string
          p_email: string
          p_timezone: string | null
          p_notes: string | null
        }
        Returns: Database["public"]["Tables"]["bookings"]["Row"]
      }
      booking_reschedule: {
        Args: {
          p_booking_id: string
          p_host_id: string
          p_starts_at: string
          p_ends_at: string
          p_busy_from: string
          p_busy_until: string
          p_timezone: string | null
        }
        Returns: Database["public"]["Tables"]["bookings"]["Row"]
      }
      booking_claim_reminders: {
        Args: { p_kind: string }
        Returns: Database["public"]["Tables"]["bookings"]["Row"][]
      }
      booking_claim_nudges: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Tables"]["booking_entitlements"]["Row"][]
      }
      booking_rate_hit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      booking_cancel: {
        Args: { p_booking_id: string; p_cancelled_by: string; p_reason?: string | null }
        Returns: Database["public"]["Tables"]["bookings"]["Row"]
      }
      create_post: {
        Args: { p_title: string }
        Returns: Database["public"]["Tables"]["posts"]["Row"]
      }
      get_page_stats: {
        Args: { p_page: string }
        Returns: Json | null
      }
      get_popular_posts: {
        Args: { p_days?: number; p_limit?: number }
        Returns: Database["public"]["Tables"]["posts"]["Row"][]
      }
      get_posts_by_tags: {
        Args: {
          p_tags?: string[]
          p_username?: string | null
          p_before?: string | null
          p_limit?: number
        }
        Returns: Database["public"]["Tables"]["posts"]["Row"][]
      }
      get_related_posts: {
        Args: { p_post_id: string; p_limit?: number }
        Returns: Database["public"]["Tables"]["posts"]["Row"][]
      }
      get_tag_counts: {
        Args: { p_username?: string | null }
        Returns: { slug: string; name: string; post_count: number }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      record_page_event: {
        Args: {
          p_page: string
          p_link_id: string | null
          p_visitor_hash: string
          p_viewer?: string | null
        }
        Returns: boolean
      }
      record_post_view: {
        Args: { p_post_id: string; p_visitor_hash: string; p_viewer?: string | null }
        Returns: number | null
      }
      request_post_changes: {
        Args: { p_post_id: string; p_note: string }
        Returns: Database["public"]["Tables"]["post_drafts"]["Row"]
      }
      admin_update_product: {
        Args: {
          p_product_id: string
          p_name: string
          p_description: string | null
          p_price: number
          p_low_stock_threshold: number
          p_stock_change?: number
        }
        Returns: Database["public"]["Tables"]["products"]["Row"][]
      }
      mark_order_refunded: {
        Args: {
          p_order_id: string
          p_amount_refunded: number
          p_full: boolean
          p_refund_ref?: string | null
          p_cancel_bookings?: boolean
        }
        Returns: Json
      }
      save_order_items: {
        Args: { p_order_id: string; p_items: Json }
        Returns: Json
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
    > & Partial<Pick<POST_ROW["Row"], "published_at" | "approved_by" | "view_count">>;

    type POST_DRAFT_TABLE = Pick<TABLES["Tables"], "post_drafts">;

    export type POST_STATUS = Database["public"]["Enums"]["post_status"];

    export type POST_DRAFT = POST_DRAFT_TABLE["post_drafts"]["Row"];

    /** A draft together with the live post it belongs to */
    export type POST_DRAFT_WITH_POST = POST_DRAFT & {
      posts: (POST & { tags?: TAG[] }) | null;
    };

    /** A topic tag as shown on chips; `slug` is used in URLs */
    export type TAG = Pick<TABLES["Tables"]["tags"]["Row"], "slug" | "name">;

    /** A tag with the number of live posts using it */
    export type TAG_COUNT = TAG & { post_count: number };
    
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