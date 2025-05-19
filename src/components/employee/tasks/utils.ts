
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  deadline: string | null;
  due_date: string | null;
  completed: boolean | null;
  completed_at: string | null;
  created_at: string | null;
  assigner_id: string | null;
  assignee_id: string | null;
  assignee_ids: string[] | null;
  department_id: string | null;
  repeat_type: string | null;
  repeat_interval: number | null;
  attachments: string[] | null;
  completed_by: Record<string, string> | null;
  comments: Comment[] | null;
  // Additional fields for UI display
  assigner_name?: string;
  assignee_name?: string;
  users?: { id: string; full_name: string };
}

export interface Comment {
  user_id: string;
  user_name?: string;
  text: string;
  created_at: string;
  [key: string]: string | undefined; // Add index signature for Json compatibility
}

export interface User {
  id: string;
  full_name: string;
  department_id?: string | null;
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const getPriorityTextColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-yellow-600";
    case "low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

export const getPriorityText = (priority: string) => {
  switch (priority) {
    case "high":
      return "紧急";
    case "medium":
      return "一般";
    case "low":
      return "宽松";
    default:
      return "未设置";
  }
};

export const getRepeatTypeText = (type: string | null) => {
  switch (type) {
    case "daily":
      return "每天";
    case "weekly":
      return "每周";
    case "monthly":
      return "每月";
    case "custom":
      return "自定义";
    case "none":
    default:
      return "不重复";
  }
};

export const formatDate = (date: string | null) => {
  if (!date) return "";
  try {
    return format(new Date(date), "yyyy-MM-dd");
  } catch (error) {
    console.error("Date format error:", error);
    return "";
  }
};

export const formatDateTime = (date: string | null) => {
  if (!date) return "";
  try {
    return format(new Date(date), "yyyy-MM-dd HH:mm");
  } catch (error) {
    console.error("Date format error:", error);
    return "";
  }
};

// Add/update comment to a task
export const addTaskComment = async (
  taskId: string, 
  userId: string, 
  userName: string, 
  text: string,
  existingComments: Comment[] | null
) => {
  try {
    const newComment: Comment = {
      user_id: userId,
      user_name: userName,
      text,
      created_at: new Date().toISOString()
    };
    
    const updatedComments = existingComments ? [...existingComments] : [];
    updatedComments.push(newComment);
    
    const { error } = await supabase
      .from("tasks")
      .update({ comments: updatedComments as unknown as Json })
      .eq("id", taskId);
      
    if (error) throw error;
    
    return { success: true, comments: updatedComments };
  } catch (error) {
    console.error("Error adding comment:", error);
    toast.error("添加评论失败");
    return { success: false, comments: existingComments };
  }
};

// Mark task as completed by a specific user
export const markTaskCompleted = async (
  task: Task,
  userId: string,
  completed: boolean
) => {
  try {
    const completedTime = completed ? new Date().toISOString() : null;
    let updatedCompletedBy = { ...(task.completed_by || {}) };
    
    if (completed) {
      updatedCompletedBy[userId] = completedTime as string;
    } else {
      delete updatedCompletedBy[userId];
    }
    
    // For single assignee tasks (backward compatibility)
    const completedAt = task.assignee_id === userId ? completedTime : task.completed_at;
    
    const { error } = await supabase
      .from("tasks")
      .update({ 
        completed: completed,
        completed_at: completedAt,
        completed_by: updatedCompletedBy as unknown as Json
      })
      .eq("id", task.id);
    
    if (error) throw error;
    
    return { 
      success: true, 
      completedBy: updatedCompletedBy,
      completedAt: completedAt 
    };
  } catch (error) {
    console.error("Error updating task completion:", error);
    toast.error("更新任务状态失败");
    return { success: false };
  }
};

// Find tasks that need notification
export const getUnreadTasksCount = async (userId: string) => {
  try {
    // First check the single assignee tasks
    const { data: singleAssigneeTasks, error: singleError } = await supabase
      .from("tasks")
      .select("id")
      .eq("assignee_id", userId)
      .is("completed", false)
      .order("created_at", { ascending: false });
      
    if (singleError) throw singleError;
    
    // Then check multi assignee tasks where user is in the assignee_ids array
    const { data: multiAssigneeTasks, error: multiError } = await supabase
      .from("tasks")
      .select("id, completed_by")
      .contains("assignee_ids", [userId])
      .is("completed", false)
      .order("created_at", { ascending: false });
      
    if (multiError) throw multiError;
    
    // For multi-assignee tasks, user might have completed their part but task is still active
    const multiTasksCount = multiAssigneeTasks.filter(task => {
      const completedBy = task.completed_by || {};
      return !completedBy[userId]; // Only count if this user hasn't completed it
    }).length;
    
    return (singleAssigneeTasks?.length || 0) + multiTasksCount;
  } catch (error) {
    console.error("Error counting unread tasks:", error);
    return 0;
  }
};
