
import { supabase } from '@/integrations/supabase/client';
import { addDays, format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 任务状态标签样式映射
export const STATUS_STYLES = {
  pending: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
  },
  inProgress: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  completed: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  overdue: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
};

// 任务优先级样式映射
export const PRIORITY_STYLES = {
  low: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    icon: '🔽',
  },
  medium: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    icon: '➖',
  },
  high: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    icon: '🔼',
  },
};

// 获取任务状态和样式
export const getTaskStatusAndStyle = (task) => {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;
  
  if (task.completed) {
    return {
      status: 'completed',
      label: '已完成',
      ...STATUS_STYLES.completed,
    };
  } else if (isOverdue) {
    return {
      status: 'overdue',
      label: '已逾期',
      ...STATUS_STYLES.overdue,
    };
  } else {
    return {
      status: 'pending',
      label: '待处理',
      ...STATUS_STYLES.pending,
    };
  }
};

// 计算新任务数量
export const calculateNewTasksCount = (tasks = []) => {
  // 筛选过去24小时内创建且未完成的任务
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  return tasks.filter(task => {
    const creationDate = new Date(task.created_at);
    return !task.completed && creationDate >= oneDayAgo;
  }).length;
};

// 格式化日期 (如: 2023年5月10日)
export const formatDate = (date) => {
  if (!date) return '未设置';
  
  let dateObj;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  
  return format(dateObj, 'yyyy年MM月dd日', { locale: zhCN });
};

// 格式化日期时间 (如: 2023年5月10日 14:30)
export const formatDateTime = (date) => {
  if (!date) return '未设置';
  
  let dateObj;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  
  return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
};

// 获取优先级颜色
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

// 获取优先级显示文本
export const getPriorityText = (priority) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低',
  };
  
  return texts[priority] || '未设置';
};

// 获取重复类型文本
export const getRepeatTypeText = (repeatType) => {
  const types = {
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    none: '不重复',
  };
  
  return types[repeatType] || '未设置';
};

// 评论接口类型
export interface Comment {
  user_id: string;
  user_name: string;
  text: string;
  timestamp: string;
}

// 添加任务评论
export const addTaskComment = async (taskId, userId, userName, commentText) => {
  try {
    // 先获取当前评论
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('comments')
      .eq('id', taskId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // 准备新评论
    const newComment = {
      user_id: userId,
      user_name: userName,
      text: commentText,
      timestamp: new Date().toISOString(),
    };
    
    const currentComments = task.comments || [];
    const updatedComments = [...currentComments, newComment];
    
    // 更新评论
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ comments: updatedComments })
      .eq('id', taskId);
      
    if (updateError) throw updateError;
    
    return updatedComments;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};
