
/**
 * 任务管理工具函数和类型定义
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * 任务接口定义
 * 描述任务的完整属性
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  deadline: string | null;
  due_date?: string | null;  // 兼容旧版本
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at?: string;
  assigner_id: string;
  assigner_name?: string;
  assignee_id: string | null;
  assignee_name?: string;
  assignee_ids?: string[];
  completed_by?: {
    [key: string]: string | null;  // 用户ID映射到完成时间
  };
  repeat_type?: string;
  repeat_interval?: number;
  department_id?: string;
  attachments?: string[];
}

/**
 * 用户接口定义
 * 描述系统中用户的属性
 */
export interface User {
  id: string;
  full_name: string;
  department_id: string | null;
  user_type: string;
}

/**
 * 部门接口定义
 * 描述部门的属性
 */
export interface Department {
  id: string;
  name: string;
}

/**
 * 获取未读任务数量
 * @param {string} userId - 用户ID
 * @returns {Promise<number>} 未读任务数量
 */
export async function getUnreadTasksCount(userId: string): Promise<number> {
  try {
    const lastCheckTime = localStorage.getItem(`task_last_check_${userId}`);
    
    if (!lastCheckTime) {
      return 0;
    }
    
    // 查询上次检查后创建的直接分配给用户的任务
    const { data: directTasks, error: directError } = await supabase
      .from('tasks')
      .select('count', { count: 'exact', head: true })
      .eq('assignee_id', userId)
      .gt('created_at', lastCheckTime);
      
    if (directError) throw directError;
    
    // 查询上次检查后创建的多人任务中包含此用户的任务
    const { data: groupTasks, error: groupError } = await supabase
      .from('tasks')
      .select('count', { count: 'exact', head: true })
      .contains('assignee_ids', [userId])
      .gt('created_at', lastCheckTime);
      
    if (groupError) throw groupError;
    
    return (directTasks || 0) + (groupTasks || 0);
  } catch (error) {
    console.error("Error fetching unread tasks count:", error);
    return 0;
  }
}

/**
 * 格式化任务优先级
 * @param {string} priority - 任务优先级
 * @returns {string} 格式化后的优先级文本
 */
export function formatPriority(priority: string): string {
  switch (priority) {
    case 'high':
      return '紧急';
    case 'medium':
      return '一般';
    case 'low':
      return '宽松';
    default:
      return '未定义';
  }
}
