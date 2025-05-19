
import { Json } from "@/integrations/supabase/types";

// 评论接口
export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

// 任务接口
export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  deadline: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  assigner_id: string;
  assigner_name?: string;
  assignee_id: string | null;
  assignee_name?: string;
  assignee_ids?: string[] | null;
  department_id?: string | null;
  comments: Comment[];
  repeat_type?: string;
  repeat_interval?: number;
  completed_by?: Record<string, boolean>;
  attachments?: string[];
}

// 用户接口
export interface User {
  id: string;
  full_name: string;
  department_id?: string;
  user_type?: string;
}

/**
 * 获取任务优先级样式
 * @param priority 优先级
 * @returns 样式对象
 */
export const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "high":
      return {
        badge: "bg-red-100 text-red-800",
        text: "text-red-800",
        border: "border-red-300",
        icon: "text-red-500"
      };
    case "medium":
      return {
        badge: "bg-yellow-100 text-yellow-800",
        text: "text-yellow-800",
        border: "border-yellow-300",
        icon: "text-yellow-500"
      };
    case "low":
      return {
        badge: "bg-green-100 text-green-800",
        text: "text-green-800",
        border: "border-green-300",
        icon: "text-green-500"
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-800",
        text: "text-gray-800",
        border: "border-gray-300",
        icon: "text-gray-500"
      };
  }
};

/**
 * 格式化日期显示
 * @param dateString 日期字符串
 * @returns 格式化的日期字符串
 */
export const formatDate = (dateString: string | null) => {
  if (!dateString) return "无截止日期";
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  
  // 计算相差天数
  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 格式化日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
  
  // 处理特殊日期显示
  if (taskDate.getTime() === today.getTime()) {
    return `今天 ${hours}:${minutes}`;
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return `明天 ${hours}:${minutes}`;
  } else if (taskDate.getTime() === yesterday.getTime()) {
    return `昨天 ${hours}:${minutes}`;
  } else if (diffDays > 0 && diffDays <= 7) {
    return `${diffDays}天后 ${formattedDate}`;
  } else if (diffDays < 0 && diffDays >= -7) {
    return `${Math.abs(diffDays)}天前 ${formattedDate}`;
  } else {
    return formattedDate;
  }
};

/**
 * 格式化评论数据
 * @param commentsData 评论原始数据
 * @returns 格式化后的评论数组
 */
export const formatComments = (commentsData: any): Comment[] => {
  if (!commentsData || !Array.isArray(commentsData)) {
    return [];
  }
  
  return commentsData.map((comment: any) => ({
    id: comment.id || crypto.randomUUID(),
    user_id: comment.user_id || "",
    user_name: comment.user_name || "未知用户",
    content: comment.content || "",
    created_at: comment.created_at || new Date().toISOString(),
  }));
};

/**
 * 获取未完成任务数量
 * @param tasks 任务数组
 * @param userId 用户ID
 * @returns 未完成任务数量
 */
export const getIncompleteTasks = (tasks: Task[], userId: string): number => {
  return tasks.filter(task => {
    // 单人任务
    if (task.assignee_id === userId) {
      return !task.completed;
    }
    // 多人任务
    if (task.assignee_ids && task.assignee_ids.includes(userId)) {
      const completedBy = task.completed_by || {};
      return !completedBy[userId];
    }
    return false;
  }).length;
};

/**
 * 格式化任务完成时间显示
 * @param dateString 日期字符串
 * @returns 格式化的日期时间字符串
 */
export const formatCompletionTime = (dateString: string | null): string => {
  if (!dateString) return "未完成";
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
