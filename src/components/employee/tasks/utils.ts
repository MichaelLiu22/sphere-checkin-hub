
import { Json } from "@/integrations/supabase/types";

export interface User {
  id: string;
  full_name: string;
  user_type?: string;
  department_id?: string;
  enabled_modules?: string[];
  upload_permission?: boolean;
  task_permission?: boolean;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string | null;
  completed: boolean;
  completed_at?: string | null;
  created_at: string;
  assigner_id: string;
  assigner_name?: string;
  assignee_id?: string | null;
  assignee_name?: string;
  assignee_ids?: string[] | null;
  department_id?: string | null;
  repeat_type?: string;
  repeat_interval?: number;
  attachments?: string[];
  comments: Comment[];
  completed_by: Record<string, boolean>;
}

// Format date to YYYY-MM-DD
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN');
};

// Format date to YYYY-MM-DD HH:MM
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('zh-CN');
};

// Get priority styles
export const getPriorityStyles = (priority: string): { color: string; bgColor: string } => {
  switch (priority) {
    case 'high':
      return { color: 'text-red-700', bgColor: 'bg-red-100' };
    case 'medium':
      return { color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    case 'low':
      return { color: 'text-green-700', bgColor: 'bg-green-100' };
    default:
      return { color: 'text-gray-700', bgColor: 'bg-gray-100' };
  }
};

// Get priority color
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

// Get priority text
export const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '未设置';
  }
};

// Get repeat type text
export const getRepeatTypeText = (type: string): string => {
  switch (type) {
    case 'daily':
      return '每天';
    case 'weekly':
      return '每周';
    case 'monthly':
      return '每月';
    case 'yearly':
      return '每年';
    default:
      return '不重复';
  }
};

// Add comment to task
export const addTaskComment = async (
  taskId: string,
  userId: string,
  userName: string,
  content: string
): Promise<Comment> => {
  const comment: Comment = {
    id: crypto.randomUUID(),
    user_id: userId,
    user_name: userName,
    content,
    created_at: new Date().toISOString(),
  };
  
  return comment;
};
