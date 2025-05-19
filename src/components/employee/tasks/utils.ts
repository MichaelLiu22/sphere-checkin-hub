
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
  completed_by: Record<string, boolean | string>;
  is_new?: boolean; // 添加标记是否为新任务的属性
  read_by?: Record<string, boolean>; // 添加已读标记属性
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

// Helper function to check if a task is new for a user
export const isTaskNewForUser = (task: Task, userId: string): boolean => {
  if (!task.read_by) return true;
  return !task.read_by[userId];
};

// Helper function to mark task as read
export const markTaskAsRead = async (
  taskId: string, 
  userId: string,
  supabase: any
): Promise<void> => {
  try {
    const { data: task } = await supabase
      .from('tasks')
      .select('read_by')
      .eq('id', taskId)
      .single();
    
    const readBy = task?.read_by || {};
    readBy[userId] = true;
    
    await supabase
      .from('tasks')
      .update({ read_by: readBy })
      .eq('id', taskId);
      
  } catch (error) {
    console.error("Error marking task as read:", error);
  }
};

// Helper function to convert database task to Task interface
export const convertDatabaseTaskToTask = (dbTask: any): Task => {
  // Make sure to properly convert the priority type
  const priority = dbTask.priority as 'high' | 'medium' | 'low';
  
  // Parse comments from JSON if needed
  const comments: Comment[] = Array.isArray(dbTask.comments) 
    ? dbTask.comments.map((c: any) => ({
        id: c.id || crypto.randomUUID(),
        user_id: c.user_id || '',
        user_name: c.user_name || '',
        content: c.content || '',
        created_at: c.created_at || new Date().toISOString()
      }))
    : [];
  
  // Parse completed_by from JSON if needed
  const completed_by: Record<string, boolean | string> = 
    typeof dbTask.completed_by === 'object' ? dbTask.completed_by : {};
  
  // Parse read_by from JSON if needed
  const read_by: Record<string, boolean> =
    typeof dbTask.read_by === 'object' ? dbTask.read_by : {};
    
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    priority: priority || 'medium',
    deadline: dbTask.deadline,
    completed: Boolean(dbTask.completed),
    completed_at: dbTask.completed_at,
    created_at: dbTask.created_at || new Date().toISOString(),
    assigner_id: dbTask.assigner_id,
    assigner_name: dbTask.assigner_name,
    assignee_id: dbTask.assignee_id,
    assignee_name: dbTask.assignee_name,
    assignee_ids: Array.isArray(dbTask.assignee_ids) ? dbTask.assignee_ids : [],
    department_id: dbTask.department_id,
    repeat_type: dbTask.repeat_type || 'never',
    repeat_interval: dbTask.repeat_interval || 1,
    attachments: Array.isArray(dbTask.attachments) ? dbTask.attachments : [],
    comments: comments,
    completed_by: completed_by,
    is_new: dbTask.is_new || false,
    read_by: read_by
  };
};

// Helper function to convert Task to database format
export const convertTaskToDatabase = (task: Task): any => {
  return {
    ...task,
    comments: task.comments || [],
    completed_by: task.completed_by || {},
    read_by: task.read_by || {}
  };
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
