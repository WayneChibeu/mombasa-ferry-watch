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
      alternative_routes: {
        Row: {
          active: boolean | null
          cost: number | null
          description: string
          estimated_time: number
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          cost?: number | null
          description: string
          estimated_time: number
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          cost?: number | null
          description?: string
          estimated_time?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      operational_status: {
        Row: {
          crowd_level: string | null
          current_wait_time: number | null
          health_status: string | null
          last_departure: string | null
          location: string
          next_estimated: string | null
          updated_at: string | null
        }
        Insert: {
          crowd_level?: string | null
          current_wait_time?: number | null
          health_status?: string | null
          last_departure?: string | null
          location: string
          next_estimated?: string | null
          updated_at?: string | null
        }
        Update: {
          crowd_level?: string | null
          current_wait_time?: number | null
          health_status?: string | null
          last_departure?: string | null
          location?: string
          next_estimated?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          breakdown_detected: boolean | null
          confidence_score: number | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          location: string
          message: string
          phone: string
          processed_at: string | null
        }
        Insert: {
          breakdown_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          location: string
          message: string
          phone: string
          processed_at?: string | null
        }
        Update: {
          breakdown_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          location?: string
          message?: string
          phone?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      wait_estimates: {
        Row: {
          created_at: string | null
          crowd_level: string | null
          estimated_wait_max: number
          estimated_wait_min: number
          id: string
          location: string
          report_count: number | null
        }
        Insert: {
          created_at?: string | null
          crowd_level?: string | null
          estimated_wait_max: number
          estimated_wait_min: number
          id?: string
          location: string
          report_count?: number | null
        }
        Update: {
          created_at?: string | null
          crowd_level?: string | null
          estimated_wait_max?: number
          estimated_wait_min?: number
          id?: string
          location?: string
          report_count?: number | null
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
