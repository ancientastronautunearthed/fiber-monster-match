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
      challenge_entries: {
        Row: {
          ai_feedback: string | null
          ai_sentiment: string | null
          challenge_id: string
          created_at: string
          day_number: number
          id: string
          image_url: string
          notes: string | null
          taken_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_sentiment?: string | null
          challenge_id: string
          created_at?: string
          day_number: number
          id?: string
          image_url: string
          notes?: string | null
          taken_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          ai_sentiment?: string | null
          challenge_id?: string
          created_at?: string
          day_number?: number
          id?: string
          image_url?: string
          notes?: string | null
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "photo_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          id: number
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      monster_journal_entries: {
        Row: {
          created_at: string | null
          entry_text: string
          id: number
          match_id: number
        }
        Insert: {
          created_at?: string | null
          entry_text: string
          id?: number
          match_id: number
        }
        Update: {
          created_at?: string | null
          entry_text?: string
          id?: number
          match_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "monster_journal_entries_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string | null
          id: string
          pose_guide_url: string | null
          status: string | null
          target_area: string | null
          target_days: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          description?: string | null
          id?: string
          pose_guide_url?: string | null
          status?: string | null
          target_area?: string | null
          target_days?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string | null
          id?: string
          pose_guide_url?: string | null
          status?: string | null
          target_area?: string | null
          target_days?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          dislikes: string[] | null
          display_name: string | null
          id: string
          likes: string[] | null
          monster_image_url: string | null
          monster_keywords: string[] | null
          monthly_searches_used: number | null
          subscription_expires_at: string | null
          subscription_type: string | null
          symptoms: string[] | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          dislikes?: string[] | null
          display_name?: string | null
          id?: string
          likes?: string[] | null
          monster_image_url?: string | null
          monster_keywords?: string[] | null
          monthly_searches_used?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          dislikes?: string[] | null
          display_name?: string | null
          id?: string
          likes?: string[] | null
          monster_image_url?: string | null
          monster_keywords?: string[] | null
          monthly_searches_used?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      relief_strategies: {
        Row: {
          accessibility: string | null
          additional_notes: string | null
          cost_level: string | null
          created_at: string
          description: string
          duration_used: string | null
          effectiveness_rating: number | null
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          side_effects: string | null
          strategy_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility?: string | null
          additional_notes?: string | null
          cost_level?: string | null
          created_at?: string
          description: string
          duration_used?: string | null
          effectiveness_rating?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          side_effects?: string | null
          strategy_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility?: string | null
          additional_notes?: string | null
          cost_level?: string | null
          created_at?: string
          description?: string
          duration_used?: string | null
          effectiveness_rating?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          side_effects?: string | null
          strategy_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          created_at: string
          current_streak: number | null
          id: string
          last_photo_date: string | null
          longest_streak: number | null
          points_earned: number | null
          total_photos: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          current_streak?: number | null
          id?: string
          last_photo_date?: string | null
          longest_streak?: number | null
          points_earned?: number | null
          total_photos?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          current_streak?: number | null
          id?: string
          last_photo_date?: string | null
          longest_streak?: number | null
          points_earned?: number | null
          total_photos?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "photo_challenges"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
