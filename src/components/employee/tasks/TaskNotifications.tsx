
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadTasksCount } from "./utils";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface TaskNotificationsProps {
  className?: string;
}

const TaskNotifications: React.FC<TaskNotificationsProps> = ({ className }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!user) return;
    
    // 初始加载未读任务数量
    const fetchUnreadTasks = async () => {
      const count = await getUnreadTasksCount(user.id);
      setUnreadCount(count);
    };
    
    fetchUnreadTasks();
    
    // 实时监听新任务
    const taskChannel = supabase
      .channel('task-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `assignee_id=eq.${user.id}`
      }, () => {
        fetchUnreadTasks();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `assignee_ids=cs.{${user.id}}`
      }, () => {
        fetchUnreadTasks();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(taskChannel);
    };
  }, [user]);
  
  if (!user || unreadCount === 0) {
    return (
      <Bell className={cn("h-5 w-5", className)} />
    );
  }
  
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
