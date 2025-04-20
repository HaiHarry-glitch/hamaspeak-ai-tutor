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
      custom_prompts: {
        Row: {
          category: string | null
          created_at: string | null
          id: number
          prompt_text: string
          suggested_duration_seconds: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: number
          prompt_text: string
          suggested_duration_seconds?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: number
          prompt_text?: string
          suggested_duration_seconds?: number | null
        }
        Relationships: []
      }
      part1_questions: {
        Row: {
          created_at: string | null
          difficulty: number | null
          id: number
          question_text: string
          topic_id: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: number | null
          id?: number
          question_text: string
          topic_id?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty?: number | null
          id?: number
          question_text?: string
          topic_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "part1_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      part2_cue_cards: {
        Row: {
          created_at: string | null
          cue_card_prompt: string
          id: number
          preparation_time_seconds: number | null
          speaking_time_seconds: number | null
          topic_id: number | null
        }
        Insert: {
          created_at?: string | null
          cue_card_prompt: string
          id?: number
          preparation_time_seconds?: number | null
          speaking_time_seconds?: number | null
          topic_id?: number | null
        }
        Update: {
          created_at?: string | null
          cue_card_prompt?: string
          id?: number
          preparation_time_seconds?: number | null
          speaking_time_seconds?: number | null
          topic_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "part2_cue_cards_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          audio_url: string
          custom_prompt_id: number | null
          duration_seconds: number | null
          feedback: string | null
          id: string
          part1_question_id: number | null
          part2_cue_card_id: number | null
          score: number | null
          submission_type: string
          submitted_at: string | null
          topic_id: number | null
          user_id: string
        }
        Insert: {
          audio_url: string
          custom_prompt_id?: number | null
          duration_seconds?: number | null
          feedback?: string | null
          id?: string
          part1_question_id?: number | null
          part2_cue_card_id?: number | null
          score?: number | null
          submission_type: string
          submitted_at?: string | null
          topic_id?: number | null
          user_id: string
        }
        Update: {
          audio_url?: string
          custom_prompt_id?: number | null
          duration_seconds?: number | null
          feedback?: string | null
          id?: string
          part1_question_id?: number | null
          part2_cue_card_id?: number | null
          score?: number | null
          submission_type?: string
          submitted_at?: string | null
          topic_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_custom_prompt_id_fkey"
            columns: ["custom_prompt_id"]
            isOneToOne: false
            referencedRelation: "custom_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_part1_question_id_fkey"
            columns: ["part1_question_id"]
            isOneToOne: false
            referencedRelation: "part1_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_part2_cue_card_id_fkey"
            columns: ["part2_cue_card_id"]
            isOneToOne: false
            referencedRelation: "part2_cue_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: number
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: number
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: number
          name?: string
          type?: string
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
