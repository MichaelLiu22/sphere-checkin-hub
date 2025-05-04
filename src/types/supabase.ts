export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      files: {
        Row: {
          id: string
          name: string
          description: string
          file_type: 'pre' | 'regular'
          file_url: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          file_type: 'pre' | 'regular'
          file_url: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          file_type?: 'pre' | 'regular'
          file_url?: string
          uploaded_by?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          onboarded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string
          email?: string
          password?: string
          onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
} 