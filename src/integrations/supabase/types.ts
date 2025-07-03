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
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
          points_reward: number | null
          rarity: string | null
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          points_reward?: number | null
          rarity?: string | null
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          points_reward?: number | null
          rarity?: string | null
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      ai_analysis: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          created_at: string
          detected_changes: Json | null
          entry_id: string
          id: string
          improvement_suggestions: string[] | null
          sentiment_analysis: Json | null
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          detected_changes?: Json | null
          entry_id: string
          id?: string
          improvement_suggestions?: string[] | null
          sentiment_analysis?: Json | null
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          detected_changes?: Json | null
          entry_id?: string
          id?: string
          improvement_suggestions?: string[] | null
          sentiment_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "challenge_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          is_published: boolean | null
          participant_count: number
          pattern_data: Json
          pattern_type: string
          statistical_significance: number | null
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          participant_count: number
          pattern_data: Json
          pattern_type: string
          statistical_significance?: number | null
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          participant_count?: number
          pattern_data?: Json
          pattern_type?: string
          statistical_significance?: number | null
          updated_at?: string
        }
        Relationships: []
      }
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
      challenge_shares: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          like_count: number | null
          share_settings: Json | null
          share_type: string
          shared_by_user_id: string
          view_count: number | null
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          like_count?: number | null
          share_settings?: Json | null
          share_type: string
          shared_by_user_id: string
          view_count?: number | null
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          like_count?: number | null
          share_settings?: Json | null
          share_type?: string
          shared_by_user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_shares_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "photo_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_templates: {
        Row: {
          category: string
          created_at: string
          default_duration: number | null
          description: string | null
          difficulty_level: string | null
          guide_image_url: string | null
          id: string
          name: string
          points_per_photo: number | null
          pose_instructions: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_duration?: number | null
          description?: string | null
          difficulty_level?: string | null
          guide_image_url?: string | null
          id?: string
          name: string
          points_per_photo?: number | null
          pose_instructions?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_duration?: number | null
          description?: string | null
          difficulty_level?: string | null
          guide_image_url?: string | null
          id?: string
          name?: string
          points_per_photo?: number | null
          pose_instructions?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      citadel_upgrades: {
        Row: {
          cost: number
          created_at: string
          current_level: number | null
          description: string | null
          id: string
          is_active: boolean | null
          max_level: number | null
          name: string
          upgrade_type: string
        }
        Insert: {
          cost: number
          created_at?: string
          current_level?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_level?: number | null
          name: string
          upgrade_type: string
        }
        Update: {
          cost?: number
          created_at?: string
          current_level?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_level?: number | null
          name?: string
          upgrade_type?: string
        }
        Relationships: []
      }
      community_actions: {
        Row: {
          action_date: string
          action_type: string
          created_at: string
          daily_count: number
          id: string
          light_earned: number
          target_content_id: string | null
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          action_date?: string
          action_type: string
          created_at?: string
          daily_count?: number
          id?: string
          light_earned?: number
          target_content_id?: string | null
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          action_date?: string
          action_type?: string
          created_at?: string
          daily_count?: number
          id?: string
          light_earned?: number
          target_content_id?: string | null
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_insights: {
        Row: {
          created_at: string
          data_summary: Json
          date_range_end: string | null
          date_range_start: string | null
          description: string | null
          id: string
          insight_type: string
          is_featured: boolean | null
          participant_count: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_summary: Json
          date_range_end?: string | null
          date_range_start?: string | null
          description?: string | null
          id?: string
          insight_type: string
          is_featured?: boolean | null
          participant_count: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_summary?: Json
          date_range_end?: string | null
          date_range_start?: string | null
          description?: string | null
          id?: string
          insight_type?: string
          is_featured?: boolean | null
          participant_count?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_interactions: {
        Row: {
          comment_text: string | null
          created_at: string
          id: string
          interaction_type: string
          is_anonymous: boolean | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          is_anonymous?: boolean | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          is_anonymous?: boolean | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_activities: {
        Row: {
          activities_completed: Json
          activity_date: string
          created_at: string
          daily_light_earned: number
          id: string
          streak_bonus: number
          user_id: string
        }
        Insert: {
          activities_completed?: Json
          activity_date?: string
          created_at?: string
          daily_light_earned?: number
          id?: string
          streak_bonus?: number
          user_id: string
        }
        Update: {
          activities_completed?: Json
          activity_date?: string
          created_at?: string
          daily_light_earned?: number
          id?: string
          streak_bonus?: number
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          compatibility_score: number | null
          connection_status: string | null
          created_at: string | null
          id: number
          last_interaction_at: string | null
          match_reason: string[] | null
          notes: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          compatibility_score?: number | null
          connection_status?: string | null
          created_at?: string | null
          id?: number
          last_interaction_at?: string | null
          match_reason?: string[] | null
          notes?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          compatibility_score?: number | null
          connection_status?: string | null
          created_at?: string | null
          id?: number
          last_interaction_at?: string | null
          match_reason?: string[] | null
          notes?: string | null
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
      points_transactions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          points_amount: number
          source_id: string | null
          source_type: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_amount: number
          source_id?: string | null
          source_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_amount?: number
          source_id?: string | null
          source_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          analytics_consent: boolean | null
          avatar_url: string | null
          bio: string | null
          climate_type: string | null
          condition_duration: string | null
          consent_date: string | null
          created_at: string
          current_level: number | null
          data_sharing_level: string | null
          dislikes: string[] | null
          display_name: string | null
          education_level: string | null
          environmental_triggers: string[] | null
          exercise_types: string[] | null
          height_cm: number | null
          helpful_medications: string[] | null
          helpful_supplements: string[] | null
          household_income_range: string | null
          id: string
          last_active_date: string | null
          lifestyle_factors: string[] | null
          likes: string[] | null
          location_country: string | null
          location_region: string | null
          longest_streak: number | null
          monster_image_url: string | null
          monster_keywords: string[] | null
          monster_personality: string | null
          monster_voice_tone: string | null
          monthly_searches_used: number | null
          notification_preferences: Json | null
          occupation_category: string | null
          onboarding_completed: boolean | null
          previous_diagnoses: string[] | null
          primary_symptoms: string[] | null
          privacy_settings: Json | null
          research_participation_consent: boolean | null
          safe_foods: string[] | null
          secondary_symptoms: string[] | null
          sex: string | null
          sleep_patterns: string[] | null
          streak_count: number | null
          stress_triggers: string[] | null
          subscription_expires_at: string | null
          subscription_type: string | null
          symptom_severity: string | null
          symptoms: string[] | null
          total_points: number | null
          treatment_approaches: string[] | null
          trigger_foods: string[] | null
          unhelpful_medications: string[] | null
          unhelpful_supplements: string[] | null
          updated_at: string
          user_id: string
          username: string | null
          weather_triggers: string[] | null
          weight_kg: number | null
        }
        Insert: {
          age_range?: string | null
          analytics_consent?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          climate_type?: string | null
          condition_duration?: string | null
          consent_date?: string | null
          created_at?: string
          current_level?: number | null
          data_sharing_level?: string | null
          dislikes?: string[] | null
          display_name?: string | null
          education_level?: string | null
          environmental_triggers?: string[] | null
          exercise_types?: string[] | null
          height_cm?: number | null
          helpful_medications?: string[] | null
          helpful_supplements?: string[] | null
          household_income_range?: string | null
          id?: string
          last_active_date?: string | null
          lifestyle_factors?: string[] | null
          likes?: string[] | null
          location_country?: string | null
          location_region?: string | null
          longest_streak?: number | null
          monster_image_url?: string | null
          monster_keywords?: string[] | null
          monster_personality?: string | null
          monster_voice_tone?: string | null
          monthly_searches_used?: number | null
          notification_preferences?: Json | null
          occupation_category?: string | null
          onboarding_completed?: boolean | null
          previous_diagnoses?: string[] | null
          primary_symptoms?: string[] | null
          privacy_settings?: Json | null
          research_participation_consent?: boolean | null
          safe_foods?: string[] | null
          secondary_symptoms?: string[] | null
          sex?: string | null
          sleep_patterns?: string[] | null
          streak_count?: number | null
          stress_triggers?: string[] | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          symptom_severity?: string | null
          symptoms?: string[] | null
          total_points?: number | null
          treatment_approaches?: string[] | null
          trigger_foods?: string[] | null
          unhelpful_medications?: string[] | null
          unhelpful_supplements?: string[] | null
          updated_at?: string
          user_id: string
          username?: string | null
          weather_triggers?: string[] | null
          weight_kg?: number | null
        }
        Update: {
          age_range?: string | null
          analytics_consent?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          climate_type?: string | null
          condition_duration?: string | null
          consent_date?: string | null
          created_at?: string
          current_level?: number | null
          data_sharing_level?: string | null
          dislikes?: string[] | null
          display_name?: string | null
          education_level?: string | null
          environmental_triggers?: string[] | null
          exercise_types?: string[] | null
          height_cm?: number | null
          helpful_medications?: string[] | null
          helpful_supplements?: string[] | null
          household_income_range?: string | null
          id?: string
          last_active_date?: string | null
          lifestyle_factors?: string[] | null
          likes?: string[] | null
          location_country?: string | null
          location_region?: string | null
          longest_streak?: number | null
          monster_image_url?: string | null
          monster_keywords?: string[] | null
          monster_personality?: string | null
          monster_voice_tone?: string | null
          monthly_searches_used?: number | null
          notification_preferences?: Json | null
          occupation_category?: string | null
          onboarding_completed?: boolean | null
          previous_diagnoses?: string[] | null
          primary_symptoms?: string[] | null
          privacy_settings?: Json | null
          research_participation_consent?: boolean | null
          safe_foods?: string[] | null
          secondary_symptoms?: string[] | null
          sex?: string | null
          sleep_patterns?: string[] | null
          streak_count?: number | null
          stress_triggers?: string[] | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          symptom_severity?: string | null
          symptoms?: string[] | null
          total_points?: number | null
          treatment_approaches?: string[] | null
          trigger_foods?: string[] | null
          unhelpful_medications?: string[] | null
          unhelpful_supplements?: string[] | null
          updated_at?: string
          user_id?: string
          username?: string | null
          weather_triggers?: string[] | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      relief_strategies: {
        Row: {
          accessibility: string | null
          additional_notes: string | null
          body_areas: string[] | null
          cost_level: string | null
          created_at: string
          description: string
          duration_used: string | null
          effectiveness_rating: number | null
          evidence_level: string | null
          helpful_votes: number | null
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          last_updated_by: string | null
          not_helpful_votes: number | null
          side_effects: string | null
          strategy_type: string
          symptom_tags: string[] | null
          title: string
          treatment_category: string | null
          updated_at: string
          user_id: string
          version_number: number | null
        }
        Insert: {
          accessibility?: string | null
          additional_notes?: string | null
          body_areas?: string[] | null
          cost_level?: string | null
          created_at?: string
          description: string
          duration_used?: string | null
          effectiveness_rating?: number | null
          evidence_level?: string | null
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          last_updated_by?: string | null
          not_helpful_votes?: number | null
          side_effects?: string | null
          strategy_type: string
          symptom_tags?: string[] | null
          title: string
          treatment_category?: string | null
          updated_at?: string
          user_id: string
          version_number?: number | null
        }
        Update: {
          accessibility?: string | null
          additional_notes?: string | null
          body_areas?: string[] | null
          cost_level?: string | null
          created_at?: string
          description?: string
          duration_used?: string | null
          effectiveness_rating?: number | null
          evidence_level?: string | null
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          last_updated_by?: string | null
          not_helpful_votes?: number | null
          side_effects?: string | null
          strategy_type?: string
          symptom_tags?: string[] | null
          title?: string
          treatment_category?: string | null
          updated_at?: string
          user_id?: string
          version_number?: number | null
        }
        Relationships: []
      }
      research_requests: {
        Row: {
          created_at: string
          ethical_approval_number: string | null
          id: string
          institution: string | null
          requested_data_points: string[]
          research_description: string
          research_title: string
          researcher_email: string
          researcher_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ethical_approval_number?: string | null
          id?: string
          institution?: string | null
          requested_data_points: string[]
          research_description: string
          research_title: string
          researcher_email: string
          researcher_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ethical_approval_number?: string | null
          id?: string
          institution?: string | null
          requested_data_points?: string[]
          research_description?: string
          research_title?: string
          researcher_email?: string
          researcher_name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      timelapse_videos: {
        Row: {
          challenge_id: string
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          duration_seconds: number | null
          id: string
          is_public: boolean | null
          photo_count: number | null
          processing_status: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          duration_seconds?: number | null
          id?: string
          is_public?: boolean | null
          photo_count?: number | null
          processing_status?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          duration_seconds?: number | null
          id?: string
          is_public?: boolean | null
          photo_count?: number | null
          processing_status?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "timelapse_videos_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "photo_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          progress_value: number | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          progress_value?: number | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          progress_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_participation: {
        Row: {
          actions_completed: number | null
          challenge_id: string
          id: string
          joined_at: string
          light_earned: number | null
          user_id: string
        }
        Insert: {
          actions_completed?: number | null
          challenge_id: string
          id?: string
          joined_at?: string
          light_earned?: number | null
          user_id: string
        }
        Update: {
          actions_completed?: number | null
          challenge_id?: string
          id?: string
          joined_at?: string
          light_earned?: number | null
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
      user_citadel_contributions: {
        Row: {
          contributed_at: string
          id: string
          light_spent: number
          upgrade_id: string
          user_id: string
        }
        Insert: {
          contributed_at?: string
          id?: string
          light_spent: number
          upgrade_id: string
          user_id: string
        }
        Update: {
          contributed_at?: string
          id?: string
          light_spent?: number
          upgrade_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          app_version: string | null
          created_at: string
          device_info: Json | null
          feedback_type: string
          id: string
          message: string
          rating: number | null
          status: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_info?: Json | null
          feedback_type: string
          id?: string
          message: string
          rating?: number | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_info?: Json | null
          feedback_type?: string
          id?: string
          message?: string
          rating?: number | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reminders: {
        Row: {
          challenge_id: string | null
          created_at: string
          days_of_week: number[] | null
          id: string
          is_active: boolean | null
          reminder_time: string
          reminder_type: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean | null
          reminder_time: string
          reminder_type?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean | null
          reminder_time?: string
          reminder_type?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reminders_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "photo_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tiers: {
        Row: {
          created_at: string
          current_tier: number
          id: string
          tier_achieved_at: string
          total_light: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_tier?: number
          id?: string
          tier_achieved_at?: string
          total_light?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_tier?: number
          id?: string
          tier_achieved_at?: string
          total_light?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          base_reward: number
          challenge_type: string
          completion_bonus: number
          created_at: string
          current_participants: number | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          target_participants: number | null
          title: string
        }
        Insert: {
          base_reward?: number
          challenge_type: string
          completion_bonus?: number
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          target_participants?: number | null
          title: string
        }
        Update: {
          base_reward?: number
          challenge_type?: string
          completion_bonus?: number
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_participants?: number | null
          title?: string
        }
        Relationships: []
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
