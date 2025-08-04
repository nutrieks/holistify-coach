export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          client_id: string | null
          coach_id: string
          created_at: string
          end_time: string
          id: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          coach_id: string
          created_at?: string
          end_time: string
          id?: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          coach_id?: string
          created_at?: string
          end_time?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          receiver_id: string
          sender_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          receiver_id: string
          sender_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          receiver_id?: string
          sender_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_habits: {
        Row: {
          client_id: string
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          id: string
        }
        Insert: {
          client_id: string
          completed?: boolean
          created_at?: string
          date?: string
          habit_id: string
          id?: string
        }
        Update: {
          client_id?: string
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_habits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          answers: Json | null
          client_id: string
          created_at: string
          id: string
          questionnaire_id: string
          submission_date: string
        }
        Insert: {
          answers?: Json | null
          client_id: string
          created_at?: string
          id?: string
          questionnaire_id: string
          submission_date?: string
        }
        Update: {
          answers?: Json | null
          client_id?: string
          created_at?: string
          id?: string
          questionnaire_id?: string
          submission_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_submissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          client_id: string
          coach_id: string
          created_at: string
          id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_database: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          id: string
          muscle_group: string | null
          name: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          muscle_group?: string | null
          name: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          muscle_group?: string | null
          name?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_database_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_database: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          fiber: number | null
          id: string
          name: string
          protein: number | null
          serving_size_grams: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          fiber?: number | null
          id?: string
          name: string
          protein?: number | null
          serving_size_grams?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          fiber?: number | null
          id?: string
          name?: string
          protein?: number | null
          serving_size_grams?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          habit_name: string
          id: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          habit_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          habit_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_entries: {
        Row: {
          created_at: string
          day_of_week: number
          food_id: string | null
          id: string
          meal_plan_id: string
          meal_type: string
          quantity: number | null
          recipe_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: number
          food_id?: string | null
          id?: string
          meal_plan_id: string
          meal_type: string
          quantity?: number | null
          recipe_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: number
          food_id?: string | null
          id?: string
          meal_plan_id?: string
          meal_type?: string
          quantity?: number | null
          recipe_id?: string | null
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
          coach_id: string
          created_at: string
          date: string
          id: string
          plan_name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          date: string
          id?: string
          plan_name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          date?: string
          id?: string
          plan_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          profile_image_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          client_id: string
          created_at: string
          date: string
          id: string
          metric_type: string
          value: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date?: string
          id?: string
          metric_type: string
          value: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          id?: string
          metric_type?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_questions: {
        Row: {
          created_at: string
          id: string
          question_order: number | null
          question_text: string
          question_type: string
          questionnaire_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_order?: number | null
          question_text: string
          question_type: string
          questionnaire_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_order?: number | null
          question_text?: string
          question_type?: string
          questionnaire_id?: string
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
      questionnaires: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaires_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          food_id: string
          id: string
          quantity: number
          recipe_id: string
        }
        Insert: {
          created_at?: string
          food_id: string
          id?: string
          quantity: number
          recipe_id: string
        }
        Update: {
          created_at?: string
          food_id?: string
          id?: string
          quantity?: number
          recipe_id?: string
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
          coach_id: string
          created_at: string
          id: string
          image_url: string | null
          instructions: string | null
          name: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          instructions?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          instructions?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          end_date: string | null
          id: string
          plan_name: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_name: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_name?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          reps: number | null
          rest_period_seconds: number | null
          sets: number | null
          workout_session_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          reps?: number | null
          rest_period_seconds?: number | null
          sets?: number | null
          workout_session_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: number | null
          rest_period_seconds?: number | null
          sets?: number | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_database"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          session_name: string
          training_plan_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          session_name: string
          training_plan_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          session_name?: string
          training_plan_id?: string
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
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
    },
  },
} as const
