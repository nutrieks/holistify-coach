export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assigned_questionnaires: {
        Row: {
          assigned_at: string
          assigned_by: string
          client_id: string
          completed_at: string | null
          created_at: string | null
          follow_up_questions: Json | null
          id: string
          questionnaire_id: string
          status: Database["public"]["Enums"]["questionnaire_status"]
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          follow_up_questions?: Json | null
          id?: string
          questionnaire_id: string
          status?: Database["public"]["Enums"]["questionnaire_status"]
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          follow_up_questions?: Json | null
          id?: string
          questionnaire_id?: string
          status?: Database["public"]["Enums"]["questionnaire_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assigned_questionnaires_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      client_anthropometric_data: {
        Row: {
          body_fat_manual: number | null
          body_fat_navy: number | null
          client_id: string
          created_at: string
          digit_ratio_2d4d: number | null
          fat_mass: number | null
          height: number | null
          hip_circumference: number | null
          id: string
          lean_body_mass: number | null
          measurement_date: string
          neck_circumference: number | null
          notes: string | null
          updated_at: string
          waist_circumference: number | null
          weight: number | null
          wrist_circumference: number | null
        }
        Insert: {
          body_fat_manual?: number | null
          body_fat_navy?: number | null
          client_id: string
          created_at?: string
          digit_ratio_2d4d?: number | null
          fat_mass?: number | null
          height?: number | null
          hip_circumference?: number | null
          id?: string
          lean_body_mass?: number | null
          measurement_date?: string
          neck_circumference?: number | null
          notes?: string | null
          updated_at?: string
          waist_circumference?: number | null
          weight?: number | null
          wrist_circumference?: number | null
        }
        Update: {
          body_fat_manual?: number | null
          body_fat_navy?: number | null
          client_id?: string
          created_at?: string
          digit_ratio_2d4d?: number | null
          fat_mass?: number | null
          height?: number | null
          hip_circumference?: number | null
          id?: string
          lean_body_mass?: number | null
          measurement_date?: string
          neck_circumference?: number | null
          notes?: string | null
          updated_at?: string
          waist_circumference?: number | null
          weight?: number | null
          wrist_circumference?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_anthropometric_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["user_id"]
          },
        ]
      }
      client_habits: {
        Row: {
          client_id: string
          created_at: string | null
          habit_id: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          habit_id: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          habit_id?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_habits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_habits_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      client_submissions: {
        Row: {
          answers: Json
          client_id: string
          created_at: string | null
          id: string
          questionnaire_id: string
          submitted_at: string | null
        }
        Insert: {
          answers: Json
          client_id: string
          created_at?: string | null
          id?: string
          questionnaire_id: string
          submitted_at?: string | null
        }
        Update: {
          answers?: Json
          client_id?: string
          created_at?: string | null
          id?: string
          questionnaire_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_submissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_submissions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string
          gender: string | null
          height: number | null
          id: string
          notes: string | null
          phone: string | null
          sessions_remaining: number | null
          starting_weight: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name: string
          gender?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          sessions_remaining?: number | null
          starting_weight?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          sessions_remaining?: number | null
          starting_weight?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_training_types: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          macro_adjustment: Json | null
          meal_plan_id: string
          training_day_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          macro_adjustment?: Json | null
          meal_plan_id: string
          training_day_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          macro_adjustment?: Json | null
          meal_plan_id?: string
          training_day_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_training_types_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_database: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          muscle_group: string
          name: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          muscle_group: string
          name: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          muscle_group?: string
          name?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      food_categories: {
        Row: {
          avg_calories: number | null
          avg_carbs: number | null
          avg_fats: number | null
          avg_protein: number | null
          category_name: string
          created_at: string | null
          id: string
          standard_portion_size: string | null
          updated_at: string | null
        }
        Insert: {
          avg_calories?: number | null
          avg_carbs?: number | null
          avg_fats?: number | null
          avg_protein?: number | null
          category_name: string
          created_at?: string | null
          id?: string
          standard_portion_size?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_calories?: number | null
          avg_carbs?: number | null
          avg_fats?: number | null
          avg_protein?: number | null
          category_name?: string
          created_at?: string | null
          id?: string
          standard_portion_size?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      food_database: {
        Row: {
          calories: number
          carbs: number
          category_id: string | null
          created_at: string | null
          fats: number
          id: string
          name: string
          portion_size: string | null
          protein: number
          updated_at: string | null
        }
        Insert: {
          calories: number
          carbs: number
          category_id?: string | null
          created_at?: string | null
          fats: number
          id?: string
          name: string
          portion_size?: string | null
          protein: number
          updated_at?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          category_id?: string | null
          created_at?: string | null
          fats?: number
          id?: string
          name?: string
          portion_size?: string | null
          protein?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_database_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      meal_plan_entries: {
        Row: {
          created_at: string | null
          day_of_week: number
          food_id: string | null
          id: string
          meal_gradient_color: string | null
          meal_plan_id: string
          meal_type: string
          notes: string | null
          quantity: number
          recipe_id: string | null
          scheduled_time: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          food_id?: string | null
          id?: string
          meal_gradient_color?: string | null
          meal_plan_id: string
          meal_type: string
          notes?: string | null
          quantity: number
          recipe_id?: string | null
          scheduled_time?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          food_id?: string | null
          id?: string
          meal_gradient_color?: string | null
          meal_plan_id?: string
          meal_type?: string
          notes?: string | null
          quantity?: number
          recipe_id?: string | null
          scheduled_time?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_entries_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "food_database"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_entries_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          client_id: string
          created_at: string | null
          daily_calories_target: number | null
          daily_carbs_target: number | null
          daily_fats_target: number | null
          daily_protein_target: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          start_date: string | null
          training_integration: boolean | null
          updated_at: string | null
          view_mode: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          daily_calories_target?: number | null
          daily_carbs_target?: number | null
          daily_fats_target?: number | null
          daily_protein_target?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          start_date?: string | null
          training_integration?: boolean | null
          updated_at?: string | null
          view_mode?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          daily_calories_target?: number | null
          daily_carbs_target?: number | null
          daily_fats_target?: number | null
          daily_protein_target?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          start_date?: string | null
          training_integration?: boolean | null
          updated_at?: string | null
          view_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          profile_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          id: string
          metric_type: string
          notes: string | null
          value: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date: string
          id?: string
          metric_type: string
          notes?: string | null
          value: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          id?: string
          metric_type?: string
          notes?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["user_id"]
          },
        ]
      }
      questionnaire_drafts: {
        Row: {
          answers: Json
          client_id: string
          created_at: string | null
          current_question_index: number | null
          id: string
          questionnaire_id: string
          updated_at: string | null
        }
        Insert: {
          answers: Json
          client_id: string
          created_at?: string | null
          current_question_index?: number | null
          id?: string
          questionnaire_id: string
          updated_at?: string | null
        }
        Update: {
          answers?: Json
          client_id?: string
          created_at?: string | null
          current_question_index?: number | null
          id?: string
          questionnaire_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_drafts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "questionnaire_drafts_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_questions: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          order_index: number | null
          question_text: string
          question_type: string | null
          questionnaire_id: string
          section: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number | null
          question_text: string
          question_type?: string | null
          questionnaire_id: string
          section?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number | null
          question_text?: string
          question_type?: string | null
          questionnaire_id?: string
          section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_scores: {
        Row: {
          category: string
          created_at: string | null
          id: string
          max_score: number
          percentage: number | null
          score: number
          severity_level: string | null
          submission_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          max_score: number
          percentage?: number | null
          score: number
          severity_level?: string | null
          submission_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          max_score?: number
          percentage?: number | null
          score?: number
          severity_level?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_scores_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "client_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          questionnaire_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          questionnaire_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          questionnaire_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          food_id: string
          id: string
          quantity: number
          recipe_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          food_id: string
          id?: string
          quantity: number
          recipe_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          food_id?: string
          id?: string
          quantity?: number
          recipe_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "food_database"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time: number | null
          created_at: string | null
          description: string | null
          id: string
          instructions: string | null
          name: string
          prep_time: number | null
          servings: number | null
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_protein: number | null
          updated_at: string | null
        }
        Insert: {
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          name: string
          prep_time?: number | null
          servings?: number | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_protein?: number | null
          updated_at?: string | null
        }
        Update: {
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          name?: string
          prep_time?: number | null
          servings?: number | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_protein?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          client_id: string
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["user_id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string | null
          day_of_week: number
          duration_minutes: number
          during_workout_notes: string | null
          gradient_color: string | null
          id: string
          intensity: string
          meal_plan_id: string
          post_workout_notes: string | null
          pre_workout_notes: string | null
          scheduled_time: string
          training_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          duration_minutes: number
          during_workout_notes?: string | null
          gradient_color?: string | null
          id?: string
          intensity: string
          meal_plan_id: string
          post_workout_notes?: string | null
          pre_workout_notes?: string | null
          scheduled_time: string
          training_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          duration_minutes?: number
          during_workout_notes?: string | null
          gradient_color?: string | null
          id?: string
          intensity?: string
          meal_plan_id?: string
          post_workout_notes?: string | null
          pre_workout_notes?: string | null
          scheduled_time?: string
          training_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          last_seen: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          last_seen?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          last_seen?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          exercises: Json
          id: string
          notes: string | null
          session_name: string
          training_plan_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          exercises: Json
          id?: string
          notes?: string | null
          session_name: string
          training_plan_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          exercises?: Json
          id?: string
          notes?: string | null
          session_name?: string
          training_plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
      questionnaire_status: "sent" | "viewed" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client"],
      questionnaire_status: ["sent", "viewed", "completed"],
    },
  },
} as const
