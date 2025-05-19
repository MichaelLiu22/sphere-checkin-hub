
/**
 * 任务通知组件
 * 显示未读任务数量的通知图标，实时更新未读任务计数
 * 使用Supabase实时订阅功能监听新任务
 */
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadTasksCount } from "./utils";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface TaskNotificationsProps {
  className?: string; // 可选的CSS类名，用于自定义样式
}

/**
 * 任务通知组件
 * 显示未读任务数量的小红点通知
 * 
 * @param {TaskNotificationsProps} props - 组件属性
 * @param {string} [props.className] - 可选的CSS类名
 * @returns {React.ReactElement|null} 通知图标组件或null
 */
const TaskNotifications: React.FC<TaskNotificationsProps> = ({ className }) => {
  const { user } = useAuth(); // 获取当前用户信息
  const [unreadCount, setUnreadCount] = useState(0); // 未读任务数量状态
  
  useEffect(() => {
    if (!user) return; // 如果用户未登录，则不执行
    
    // 初始加载未读任务数量
    const fetchUnreadTasks = async () => {
      const count = await getUnreadTasksCount(user.id);
      setUnreadCount(count);
    };
    
    fetchUnreadTasks();
    
    // 实时监听新任务
    const taskChannel = supabase
      .channel('task-notifications')
      // 监听直接分配给用户的任务
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `assignee_id=eq.${user.id}`
      }, () => {
        fetchUnreadTasks();
      })
      // 监听在assignee_ids数组中包含此用户的任务
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `assignee_ids=cs.{${user.id}}`
      }, () => {
        fetchUnreadTasks();
      })
      .subscribe();
    
    // 组件卸载时清理订阅
    return () => {
      supabase.removeChannel(taskChannel);
    };
  }, [user]);
  
  // 如果没有未读任务，只显示铃铛图标
  if (!user || unreadCount === 0) {
    return (
      <Bell className={cn("h-5 w-5", className)} />
    );
  }
  
  // 有未读任务时，显示带计数的通知
  return (
    <div className="relative">
      <Bell className={cn("h-5 w-5", className)} />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    </div>
  );
};

export default TaskNotifications;
