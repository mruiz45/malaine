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
      ease_preferences: {
        Row: {
          bust_ease: number | null
          created_at: string | null
          ease_type: string
          hip_ease: number | null
          id: string
          measurement_unit: string | null
          notes: string | null
          preference_name: string
          sleeve_ease: number | null
          updated_at: string | null
          user_id: string | null
          waist_ease: number | null
        }
        Insert: {
          bust_ease?: number | null
          created_at?: string | null
          ease_type?: string
          hip_ease?: number | null
          id?: string
          measurement_unit?: string | null
          notes?: string | null
          preference_name: string
          sleeve_ease?: number | null
          updated_at?: string | null
          user_id?: string | null
          waist_ease?: number | null
        }
        Update: {
          bust_ease?: number | null
          created_at?: string | null
          ease_type?: string
          hip_ease?: number | null
          id?: string
          measurement_unit?: string | null
          notes?: string | null
          preference_name?: string
          sleeve_ease?: number | null
          updated_at?: string | null
          user_id?: string | null
          waist_ease?: number | null
        }
        Relationships: []
      }
      garment_component_templates: {
        Row: {
          component_key: string
          configurable_attributes: Json | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          component_key: string
          configurable_attributes?: Json | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          component_key?: string
          configurable_attributes?: Json | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      garment_type_components: {
        Row: {
          component_template_id: string
          created_at: string | null
          default_quantity: number | null
          garment_type_id: string
          id: string
          is_required: boolean | null
          sort_order: number | null
        }
        Insert: {
          component_template_id: string
          created_at?: string | null
          default_quantity?: number | null
          garment_type_id: string
          id?: string
          is_required?: boolean | null
          sort_order?: number | null
        }
        Update: {
          component_template_id?: string
          created_at?: string | null
          default_quantity?: number | null
          garment_type_id?: string
          id?: string
          is_required?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "garment_type_components_component_template_id_fkey"
            columns: ["component_template_id"]
            isOneToOne: false
            referencedRelation: "garment_component_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garment_type_components_garment_type_id_fkey"
            columns: ["garment_type_id"]
            isOneToOne: false
            referencedRelation: "garment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      garment_types: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          type_key: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          type_key: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          type_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gauge_profiles: {
        Row: {
          created_at: string | null
          id: string
          measurement_unit: string
          notes: string | null
          profile_name: string
          row_count: number
          stitch_count: number
          swatch_height: number
          swatch_width: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          measurement_unit: string
          notes?: string | null
          profile_name: string
          row_count: number
          stitch_count: number
          swatch_height?: number
          swatch_width?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          measurement_unit?: string
          notes?: string | null
          profile_name?: string
          row_count?: number
          stitch_count?: number
          swatch_height?: number
          swatch_width?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      measurement_guides_content: {
        Row: {
          created_at: string | null
          description: string
          id: number
          image_url: string | null
          measurement_key: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: number
          image_url?: string | null
          measurement_key: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: number
          image_url?: string | null
          measurement_key?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      measurement_sets: {
        Row: {
          ankle_circumference: number | null
          arm_length: number | null
          chest_circumference: number | null
          created_at: string | null
          custom_measurements: Json | null
          foot_length: number | null
          head_circumference: number | null
          hip_circumference: number | null
          id: string
          inseam_length: number | null
          measurement_details: Json | null
          measurement_unit: string
          neck_circumference: number | null
          notes: string | null
          set_name: string
          shoulder_width: number | null
          torso_length: number | null
          updated_at: string | null
          user_id: string | null
          waist_circumference: number | null
          wrist_circumference: number | null
        }
        Insert: {
          ankle_circumference?: number | null
          arm_length?: number | null
          chest_circumference?: number | null
          created_at?: string | null
          custom_measurements?: Json | null
          foot_length?: number | null
          head_circumference?: number | null
          hip_circumference?: number | null
          id?: string
          inseam_length?: number | null
          measurement_details?: Json | null
          measurement_unit: string
          neck_circumference?: number | null
          notes?: string | null
          set_name: string
          shoulder_width?: number | null
          torso_length?: number | null
          updated_at?: string | null
          user_id?: string | null
          waist_circumference?: number | null
          wrist_circumference?: number | null
        }
        Update: {
          ankle_circumference?: number | null
          arm_length?: number | null
          chest_circumference?: number | null
          created_at?: string | null
          custom_measurements?: Json | null
          foot_length?: number | null
          head_circumference?: number | null
          hip_circumference?: number | null
          id?: string
          inseam_length?: number | null
          measurement_details?: Json | null
          measurement_unit?: string
          neck_circumference?: number | null
          notes?: string | null
          set_name?: string
          shoulder_width?: number | null
          torso_length?: number | null
          updated_at?: string | null
          user_id?: string | null
          waist_circumference?: number | null
          wrist_circumference?: number | null
        }
        Relationships: []
      }
      morphology_advisories: {
        Row: {
          adjustment_suggestions: string | null
          created_at: string | null
          description: string | null
          display_name: string
          ease_considerations: string | null
          id: number
          image_url: string | null
          implications: string | null
          measurement_focus: string | null
          morphology_key: string
          updated_at: string | null
        }
        Insert: {
          adjustment_suggestions?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          ease_considerations?: string | null
          id?: number
          image_url?: string | null
          implications?: string | null
          measurement_focus?: string | null
          morphology_key: string
          updated_at?: string | null
        }
        Update: {
          adjustment_suggestions?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          ease_considerations?: string | null
          id?: number
          image_url?: string | null
          implications?: string | null
          measurement_focus?: string | null
          morphology_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pattern_definition_components: {
        Row: {
          component_label: string | null
          component_template_id: string
          created_at: string | null
          ease_overrides: Json | null
          id: string
          measurement_overrides: Json | null
          notes: string | null
          pattern_definition_session_id: string
          selected_attributes: Json | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          component_label?: string | null
          component_template_id: string
          created_at?: string | null
          ease_overrides?: Json | null
          id?: string
          measurement_overrides?: Json | null
          notes?: string | null
          pattern_definition_session_id: string
          selected_attributes?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          component_label?: string | null
          component_template_id?: string
          created_at?: string | null
          ease_overrides?: Json | null
          id?: string
          measurement_overrides?: Json | null
          notes?: string | null
          pattern_definition_session_id?: string
          selected_attributes?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pattern_definition_components_component_template_id_fkey"
            columns: ["component_template_id"]
            isOneToOne: false
            referencedRelation: "garment_component_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_definition_components_pattern_definition_session_i_fkey"
            columns: ["pattern_definition_session_id"]
            isOneToOne: false
            referencedRelation: "pattern_definition_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern_definition_sessions: {
        Row: {
          craft_type: string
          created_at: string | null
          ease_type: string | null
          ease_unit: string | null
          ease_value_bust: number | null
          gauge_row_count: number | null
          gauge_stitch_count: number | null
          gauge_unit: string | null
          id: string
          parameter_snapshot: Json | null
          selected_garment_type_id: string | null
          selected_gauge_profile_id: string | null
          selected_measurement_set_id: string | null
          selected_stitch_pattern_id: string | null
          selected_yarn_profile_id: string | null
          session_name: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          craft_type: string
          created_at?: string | null
          ease_type?: string | null
          ease_unit?: string | null
          ease_value_bust?: number | null
          gauge_row_count?: number | null
          gauge_stitch_count?: number | null
          gauge_unit?: string | null
          id?: string
          parameter_snapshot?: Json | null
          selected_garment_type_id?: string | null
          selected_gauge_profile_id?: string | null
          selected_measurement_set_id?: string | null
          selected_stitch_pattern_id?: string | null
          selected_yarn_profile_id?: string | null
          session_name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          craft_type?: string
          created_at?: string | null
          ease_type?: string | null
          ease_unit?: string | null
          ease_value_bust?: number | null
          gauge_row_count?: number | null
          gauge_stitch_count?: number | null
          gauge_unit?: string | null
          id?: string
          parameter_snapshot?: Json | null
          selected_garment_type_id?: string | null
          selected_gauge_profile_id?: string | null
          selected_measurement_set_id?: string | null
          selected_stitch_pattern_id?: string | null
          selected_yarn_profile_id?: string | null
          session_name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pattern_definition_sessions_selected_garment_type_id_fkey"
            columns: ["selected_garment_type_id"]
            isOneToOne: false
            referencedRelation: "garment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_definition_sessions_selected_gauge_profile_id_fkey"
            columns: ["selected_gauge_profile_id"]
            isOneToOne: false
            referencedRelation: "gauge_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_definition_sessions_selected_measurement_set_id_fkey"
            columns: ["selected_measurement_set_id"]
            isOneToOne: false
            referencedRelation: "measurement_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_definition_sessions_selected_stitch_pattern_id_fkey"
            columns: ["selected_stitch_pattern_id"]
            isOneToOne: false
            referencedRelation: "stitch_patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_definition_sessions_selected_yarn_profile_id_fkey"
            columns: ["selected_yarn_profile_id"]
            isOneToOne: false
            referencedRelation: "yarn_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          language_preference: string | null
          role: string
        }
        Insert: {
          id: string
          language_preference?: string | null
          role?: string
        }
        Update: {
          id?: string
          language_preference?: string | null
          role?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: never
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: never
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      showcased_patterns: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          full_pattern_data: Json
          id: string
          is_published: boolean | null
          thumbnail_image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          full_pattern_data: Json
          id?: string
          is_published?: boolean | null
          thumbnail_image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          full_pattern_data?: Json
          id?: string
          is_published?: boolean | null
          thumbnail_image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stitch_patterns: {
        Row: {
          category: string | null
          common_uses: string[] | null
          craft_type: string
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          instructions_written: Json | null
          is_basic: boolean | null
          properties: Json | null
          search_keywords: string[] | null
          stitch_name: string
          stitch_repeat_height: number | null
          stitch_repeat_width: number | null
          swatch_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          common_uses?: string[] | null
          craft_type?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          instructions_written?: Json | null
          is_basic?: boolean | null
          properties?: Json | null
          search_keywords?: string[] | null
          stitch_name: string
          stitch_repeat_height?: number | null
          stitch_repeat_width?: number | null
          swatch_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          common_uses?: string[] | null
          craft_type?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          instructions_written?: Json | null
          is_basic?: boolean | null
          properties?: Json | null
          search_keywords?: string[] | null
          stitch_name?: string
          stitch_repeat_height?: number | null
          stitch_repeat_width?: number | null
          swatch_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          auth_id: string
          created_at: string | null
          email: string | null
          id: number
          is_admin: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id: string
          created_at?: string | null
          email?: string | null
          id?: never
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string
          created_at?: string | null
          email?: string | null
          id?: never
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      yarn_profiles: {
        Row: {
          brand_name: string | null
          color_hex_code: string | null
          color_name: string | null
          created_at: string | null
          dye_lot: string | null
          fiber_content: Json | null
          id: string
          notes: string | null
          purchase_link: string | null
          ravelry_id: string | null
          skein_meterage: number | null
          skein_weight_grams: number | null
          skein_yardage: number | null
          updated_at: string | null
          user_id: string | null
          yarn_name: string
          yarn_weight_category: string | null
        }
        Insert: {
          brand_name?: string | null
          color_hex_code?: string | null
          color_name?: string | null
          created_at?: string | null
          dye_lot?: string | null
          fiber_content?: Json | null
          id?: string
          notes?: string | null
          purchase_link?: string | null
          ravelry_id?: string | null
          skein_meterage?: number | null
          skein_weight_grams?: number | null
          skein_yardage?: number | null
          updated_at?: string | null
          user_id?: string | null
          yarn_name: string
          yarn_weight_category?: string | null
        }
        Update: {
          brand_name?: string | null
          color_hex_code?: string | null
          color_name?: string | null
          created_at?: string | null
          dye_lot?: string | null
          fiber_content?: Json | null
          id?: string
          notes?: string | null
          purchase_link?: string | null
          ravelry_id?: string | null
          skein_meterage?: number | null
          skein_weight_grams?: number | null
          skein_yardage?: number | null
          updated_at?: string | null
          user_id?: string | null
          yarn_name?: string
          yarn_weight_category?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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