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
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string
          description: string | null
          file_type: string
          file_url: string
          id: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          onboarded: boolean | null
          password: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          onboarded?: boolean | null
          password?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          onboarded?: boolean | null
          password?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      SphereCheckIN: {
        Row: {
          created_at: string
          full_legal_name: string | null
          id: number
          nda_file: string | null
          user_id: string | null
          w9_file: string | null
        }
        Insert: {
          created_at?: string
          full_legal_name?: string | null
          id?: number
          nda_file?: string | null
          user_id?: string | null
          w9_file?: string | null
        }
        Update: {
          created_at?: string
          full_legal_name?: string | null
          id?: number
          nda_file?: string | null
          user_id?: string | null
          w9_file?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          assignee_ids: string[] | null
          assigner_id: string | null
          attachments: string[] | null
          comments: Json | null
          completed: boolean | null
          completed_at: string | null
          completed_by: Json | null
          created_at: string | null
          deadline: string | null
          department_id: string | null
          description: string | null
          id: string
          priority: string | null
          repeat_interval: number | null
          repeat_type: string | null
          title: string
        }
        Insert: {
          assignee_id?: string | null
          assignee_ids?: string[] | null
          assigner_id?: string | null
          attachments?: string[] | null
          comments?: Json | null
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: Json | null
          created_at?: string | null
          deadline?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          repeat_interval?: number | null
          repeat_type?: string | null
          title: string
        }
        Update: {
          assignee_id?: string | null
          assignee_ids?: string[] | null
          assigner_id?: string | null
          attachments?: string[] | null
          comments?: Json | null
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: Json | null
          created_at?: string | null
          deadline?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          repeat_interval?: number | null
          repeat_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigner_id_fkey"
            columns: ["assigner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_file_access: {
        Row: {
          created_at: string
          file_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_file_access_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_file_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          approved: boolean | null
          created_at: string
          department_id: string | null
          enabled_modules: string[] | null
          feature: Database["public"]["Enums"]["user_feature"] | null
          full_name: string
          id: string
          notes: string | null
          password_hash: string
          task_permission: boolean | null
          upload_permission: boolean | null
          user_type: Database["public"]["Enums"]["employee_role"] | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          department_id?: string | null
          enabled_modules?: string[] | null
          feature?: Database["public"]["Enums"]["user_feature"] | null
          full_name: string
          id?: string
          notes?: string | null
          password_hash: string
          task_permission?: boolean | null
          upload_permission?: boolean | null
          user_type?: Database["public"]["Enums"]["employee_role"] | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          department_id?: string | null
          enabled_modules?: string[] | null
          feature?: Database["public"]["Enums"]["user_feature"] | null
          full_name?: string
          id?: string
          notes?: string | null
          password_hash?: string
          task_permission?: boolean | null
          upload_permission?: boolean | null
          user_type?: Database["public"]["Enums"]["employee_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      employee_role:
        | "admin"
        | "manager"
        | "operator"
        | "host"
        | "influencer"
        | "warehouse"
        | "finance"
        | "others"
        | "unassigned"
        | "staff"
        | "employee"
      user_feature: "None"
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
    Enums: {
      employee_role: [
        "admin",
        "manager",
        "operator",
        "host",
        "influencer",
        "warehouse",
        "finance",
        "others",
        "unassigned",
        "staff",
        "employee",
      ],
      user_feature: ["None"],
    },
  },
} as const
