/**
 * 任务通知组件
 * 显示未读任务数量的通知图标，实时更新未读任务计数
 * 使用Supabase实时订阅功能监听新任务
 */
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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
    
    // 从本地存储获取上次检查时间
    const storedLastCheckTime = localStorage.getItem(`task_last_check_${user.id}`);
    const checkTime = storedLastCheckTime ? new Date(storedLastCheckTime) : new Date();
    
    // 初始加载新任务数量
    const fetchNewTasks = async () => {
      try {
        // 查询在上次检查时间之后创建的任务
        const { data: directTasks, error: directError } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignee_id', user.id)
          .gt('created_at', checkTime.toISOString());
          
        if (directError) throw directError;
        
        // 查询包含当前用户的多人任务
        const { data: groupTasks, error: groupError } = await supabase
          .from('tasks')
          .select('*')
          .contains('assignee_ids', [user.id])
          .gt('created_at', checkTime.toISOString());
          
        if (groupError) throw groupError;
        
        // 计算新任务总数
        const newTaskCount = (directTasks?.length || 0) + (groupTasks?.length || 0);
        setUnreadCount(newTaskCount);
        
      } catch (error) {
        console.error("Error fetching new tasks:", error);
      }
    };
    
    fetchNewTasks();
    
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
        setUnreadCount(prev => prev + 1);
      })
      // 监听在assignee_ids数组中包含此用户的任务
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `assignee_ids=cs.{${user.id}}`
      }, () => {
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();
    
    // 组件卸载时清理订阅并更新最后检查时间
    return () => {
      supabase.removeChannel(taskChannel);
      const now = new Date();
      localStorage.setItem(`task_last_check_${user.id}`, now.toISOString());
    };
  }, [user]); // 只依赖 user
  
  // 重置未读计数并更新最后检查时间
  const resetNotificationCount = () => {
    setUnreadCount(0);
    if (user) {
      const now = new Date();
      localStorage.setItem(`task_last_check_${user.id}`, now.toISOString());
    }
  };
  
  // 如果没有未读任务，只显示铃铛图标
  if (!user || unreadCount === 0) {
    return (
      <Bell className={cn("h-5 w-5", className)} onClick={resetNotificationCount} />
    );
  }
  
  // 有未读任务时，显示带计数的通知
  return (
    <div className="relative cursor-pointer" onClick={resetNotificationCount}>
      <Bell className={cn("h-5 w-5", className)} />
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 flex items-center justify-center px-1 min-w-[16px] h-4 text-[10px] font-bold"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </div>
  );
};

export default TaskNotifications;
