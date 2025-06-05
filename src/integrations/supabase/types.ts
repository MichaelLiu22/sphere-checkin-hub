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
      fixed_costs: {
        Row: {
          amount: number
          cost_name: string
          cost_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          start_date: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cost_name: string
          cost_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cost_name?: string
          cost_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_costs_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      host_payroll: {
        Row: {
          commission: number | null
          created_at: string
          created_by: string | null
          department: string | null
          host_name: string
          hourly_rate: number
          hours_worked: number
          id: string
          notes: string | null
          payment_type: string | null
          payroll_period: string | null
          period: string | null
          settlement_frequency: string | null
          total_amount: number
          updated_at: string
          work_date: string
        }
        Insert: {
          commission?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          host_name: string
          hourly_rate: number
          hours_worked: number
          id?: string
          notes?: string | null
          payment_type?: string | null
          payroll_period?: string | null
          period?: string | null
          settlement_frequency?: string | null
          total_amount: number
          updated_at?: string
          work_date: string
        }
        Update: {
          commission?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          host_name?: string
          hourly_rate?: number
          hours_worked?: number
          id?: string
          notes?: string | null
          payment_type?: string | null
          payroll_period?: string | null
          period?: string | null
          settlement_frequency?: string | null
          total_amount?: number
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_payroll_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          batch_number: string | null
          created_at: string
          created_by: string | null
          expiration_date: string | null
          id: string
          image_url: string | null
          in_reason: Database["public"]["Enums"]["inventory_in_reason"] | null
          min_stock_alert: number | null
          product_name: string
          quantity: number
          sku: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          expiration_date?: string | null
          id?: string
          image_url?: string | null
          in_reason?: Database["public"]["Enums"]["inventory_in_reason"] | null
          min_stock_alert?: number | null
          product_name: string
          quantity?: number
          sku: string
          unit_cost: number
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          expiration_date?: string | null
          id?: string
          image_url?: string | null
          in_reason?: Database["public"]["Enums"]["inventory_in_reason"] | null
          min_stock_alert?: number | null
          product_name?: string
          quantity?: number
          sku?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_history: {
        Row: {
          batch_number: string | null
          created_at: string
          created_by: string | null
          expiration_date: string | null
          id: string
          in_reason: Database["public"]["Enums"]["inventory_in_reason"] | null
          operation_type: string
          product_name: string
          quantity: number
          reason: string | null
          sku: string
          unit_cost: number | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          expiration_date?: string | null
          id?: string
          in_reason?: Database["public"]["Enums"]["inventory_in_reason"] | null
          operation_type: string
          product_name: string
          quantity: number
          reason?: string | null
          sku: string
          unit_cost?: number | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          expiration_date?: string | null
          id?: string
          in_reason?: Database["public"]["Enums"]["inventory_in_reason"] | null
          operation_type?: string
          product_name?: string
          quantity?: number
          reason?: string | null
          sku?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_payroll: {
        Row: {
          base_salary: number
          bonus: number | null
          commission: number | null
          created_at: string
          created_by: string | null
          department: string | null
          employee_name: string
          hourly_rate: number | null
          hours_worked: number | null
          id: string
          notes: string | null
          payment_type: string
          payroll_period: string | null
          period: string
          settlement_frequency: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          base_salary?: number
          bonus?: number | null
          commission?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          employee_name: string
          hourly_rate?: number | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          payment_type?: string
          payroll_period?: string | null
          period: string
          settlement_frequency?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          commission?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          employee_name?: string
          hourly_rate?: number | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          payment_type?: string
          payroll_period?: string | null
          period?: string
          settlement_frequency?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_payroll_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_exports: {
        Row: {
          created_at: string
          department_breakdown: Json | null
          export_data: Json | null
          export_period: string
          exported_by: string | null
          id: string
          period_end: string
          period_start: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          department_breakdown?: Json | null
          export_data?: Json | null
          export_period: string
          exported_by?: string | null
          id?: string
          period_end: string
          period_start: string
          total_amount?: number
        }
        Update: {
          created_at?: string
          department_breakdown?: Json | null
          export_data?: Json | null
          export_period?: string
          exported_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          total_amount?: number
        }
        Relationships: []
      }
      product_cache: {
        Row: {
          cached_data: Json | null
          created_at: string | null
          data_source: string
          expires_at: string | null
          id: string
          product_name: string
        }
        Insert: {
          cached_data?: Json | null
          created_at?: string | null
          data_source: string
          expires_at?: string | null
          id?: string
          product_name: string
        }
        Update: {
          cached_data?: Json | null
          created_at?: string | null
          data_source?: string
          expires_at?: string | null
          id?: string
          product_name?: string
        }
        Relationships: []
      }
      product_costs: {
        Row: {
          cost: number
          created_at: string
          id: string
          notes: string | null
          sku: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          notes?: string | null
          sku: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          notes?: string | null
          sku?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          pdf_url: string | null
          product_name: string
          report_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          pdf_url?: string | null
          product_name: string
          report_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          pdf_url?: string | null
          product_name?: string
          report_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
      profit_analysis: {
        Row: {
          analysis_date: string
          analysis_name: string
          cost_breakdown: Json
          created_at: string
          created_by: string | null
          id: string
          payout_data: Json
          profit_summary: Json
        }
        Insert: {
          analysis_date: string
          analysis_name: string
          cost_breakdown: Json
          created_at?: string
          created_by?: string | null
          id?: string
          payout_data: Json
          profit_summary: Json
        }
        Update: {
          analysis_date?: string
          analysis_name?: string
          cost_breakdown?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          payout_data?: Json
          profit_summary?: Json
        }
        Relationships: []
      }
      spherecheckin: {
        Row: {
          created_at: string
          full_legal_name: string
          id: string
          nda_file: string | null
          updated_at: string
          user_id: string | null
          w9_file: string | null
        }
        Insert: {
          created_at?: string
          full_legal_name: string
          id?: string
          nda_file?: string | null
          updated_at?: string
          user_id?: string | null
          w9_file?: string | null
        }
        Update: {
          created_at?: string
          full_legal_name?: string
          id?: string
          nda_file?: string | null
          updated_at?: string
          user_id?: string | null
          w9_file?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spherecheckin_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streamer_salary: {
        Row: {
          base_amount: number
          commission_rate: number | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          salary_type: string
          streamer_name: string
          updated_at: string
          work_schedule: Json | null
        }
        Insert: {
          base_amount: number
          commission_rate?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          salary_type: string
          streamer_name: string
          updated_at?: string
          work_schedule?: Json | null
        }
        Update: {
          base_amount?: number
          commission_rate?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          salary_type?: string
          streamer_name?: string
          updated_at?: string
          work_schedule?: Json | null
        }
        Relationships: []
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
      warehouse_payroll: {
        Row: {
          base_salary: number | null
          created_at: string
          created_by: string | null
          department: string | null
          employee_name: string
          hourly_rate: number
          hours_worked: number | null
          id: string
          notes: string | null
          overtime_hours: number | null
          overtime_rate: number | null
          payment_type: string
          payroll_period: string | null
          period: string
          settlement_frequency: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          base_salary?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          employee_name: string
          hourly_rate?: number
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          payment_type?: string
          payroll_period?: string | null
          period: string
          settlement_frequency?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          base_salary?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          employee_name?: string
          hourly_rate?: number
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          payment_type?: string
          payroll_period?: string | null
          period?: string
          settlement_frequency?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_payroll_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_task: {
        Args: {
          title: string
          description: string
          priority: string
          deadline: string
          assigner_id: string
          assignee_id: string
          completed: boolean
          completed_at: string
          department_id: string
        }
        Returns: Json
      }
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
      inventory_in_reason: "买货" | "return" | "赠送" | "盘点" | "调拨" | "其它"
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
      inventory_in_reason: ["买货", "return", "赠送", "盘点", "调拨", "其它"],
      user_feature: ["None"],
    },
  },
} as const
