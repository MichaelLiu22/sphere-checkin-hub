
/**
 * 任务看板组件
 * 管理和显示所有任务，包括任务筛选、创建、完成等功能
 */
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, User } from "./tasks/utils";
import { Json } from "@/integrations/supabase/types";

// 导入任务相关组件
import TaskCreationForm from "./tasks/TaskCreationForm";
import TaskItem from "./tasks/TaskItem";
import TaskFilters, { FilterType, SortType } from "./tasks/TaskFilters";
import TaskNotifications from "./tasks/TaskNotifications";
import TaskAssignmentForm from "./tasks/TaskAssignmentForm"; // 导入任务分配表单组件
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TaskBoardProps {
  canAssignTasks: boolean; // 用户是否可以分配任务给他人
  isAdmin: boolean;        // 用户是否是管理员
}

/**
 * 任务看板组件
 * 
 * @param {TaskBoardProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的任务看板
 */
const TaskBoard: React.FC<TaskBoardProps> = ({ canAssignTasks, isAdmin }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("priority");
  const [showPersonalTaskDialog, setShowPersonalTaskDialog] = useState(false);

  // 获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        // 获取所有与当前用户相关的任务
        const { data, error } = await supabase
          .from("tasks")
          .select(`
            *,
            users!tasks_assigner_id_fkey(id, full_name)
          `)
          .or(`assignee_id.eq.${user.id},assigner_id.eq.${user.id},assignee_ids.cs.{${user.id}}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // 处理任务数据，添加assigner_name属性
        const formattedTasks = (data || []).map((task: any) => ({
          ...task,
          assigner_name: task.users?.full_name || "未知",
          priority: task.priority as "high" | "medium" | "low",
          due_date: task.due_date || null, // 确保due_date属性存在
        }));
        
        // 添加assignee_name属性（如果有assignee_id）
        const assigneeIds = formattedTasks
          .filter((t: any) => t.assignee_id)
          .map((t: any) => t.assignee_id as string);
          
        if (assigneeIds.length > 0) {
          const { data: assignees } = await supabase
            .from("users")
            .select("id, full_name")
            .in("id", assigneeIds);
            
          if (assignees) {
            const assigneeMap = Object.fromEntries(
              assignees.map(a => [a.id, a.full_name])
            );
            
            formattedTasks.forEach((task: any) => {
              if (task.assignee_id && assigneeMap[task.assignee_id]) {
                task.assignee_name = assigneeMap[task.assignee_id];
              }
            });
          }
        }

        setTasks(formattedTasks as Task[]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("获取任务数据失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();

    // 实时任务更新
    const taskChannel = supabase
      .channel('task-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `assignee_id=eq.${user?.id}`
      }, () => {
        fetchTasks();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `assigner_id=eq.${user?.id}`
      }, () => {
        fetchTasks();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `assignee_ids=cs.{${user?.id}}`
      }, () => {
        fetchTasks();
      })
      .subscribe();
      
    // 组件卸载时清理订阅
    return () => {
      supabase.removeChannel(taskChannel);
    };
  }, [user]);

  /**
   * 处理任务状态更新
   * @param {Task} updatedTask - 更新后的任务
   */
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(
      tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  /**
   * 处理任务删除
   * @param {string} taskId - 要删除的任务ID
   */
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("确定要删除此任务吗？")) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      toast.success("任务已删除");
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("删除任务失败");
    }
  };

  /**
   * 处理新任务创建
   * @param {Task} newTask - 新创建的任务
   */
  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
  };
  
  /**
   * 处理个人任务创建
   * @param {Task} newTask - 新创建的个人任务
   */
  const handlePersonalTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    setShowPersonalTaskDialog(false);
  };

  /**
   * 根据筛选和排序获取任务列表
   * @returns {Task[]} 筛选和排序后的任务列表
   */
  const getFilteredTasks = () => {
    if (!user) return [];
    
    let filtered = [...tasks];
    
    // 应用筛选器
    switch (filter) {
      case "assigned":
        filtered = filtered.filter(
          task => task.assignee_id === user.id || 
                 (task.assignee_ids && task.assignee_ids.includes(user.id))
        );
        break;
      case "created":
        filtered = filtered.filter(task => task.assigner_id === user.id);
        break;
      case "incomplete":
        filtered = filtered.filter(task => {
          // 单人任务
          if (task.assignee_id === user.id) {
            return !task.completed;
          }
          // 多人任务且当前用户是接收者之一
          if (task.assignee_ids && task.assignee_ids.includes(user.id)) {
            const completedBy = task.completed_by || {};
            return !completedBy[user.id];
          }
          // 多人任务且当前用户是发布者
          if (task.assigner_id === user.id) {
            return !task.completed;
          }
          return false;
        });
        break;
      case "completed":
        filtered = filtered.filter(task => {
          // 单人任务
          if (task.assignee_id === user.id) {
            return task.completed;
          }
          // 多人任务且当前用户是接收者之一
          if (task.assignee_ids && task.assignee_ids.includes(user.id)) {
            const completedBy = task.completed_by || {};
            return !!completedBy[user.id];
          }
          // 多人任务且当前用户是发布者
          if (task.assigner_id === user.id) {
            return task.completed;
          }
          return false;
        });
        break;
      // "all" case不需要额外过滤
    }
    
    // 应用排序
    switch (sort) {
      case "priority":
        // 按优先级排序 high > medium > low
        filtered.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        break;
      case "deadline":
        // 按截止日期排序，无截止日期的排在后面
        filtered.sort((a, b) => {
          const dateA = a.due_date || a.deadline;
          const dateB = b.due_date || b.deadline;
          
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
        break;
      case "created":
        // 按创建时间排序，最新的排在前面
        filtered.sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
    }
    
    return filtered;
  };

  // 获取筛选和排序后的任务
  const filteredTasks = getFilteredTasks();
  
  // 分类任务
  const receivedTasks = filteredTasks.filter(
    task => (task.assignee_id === user?.id || 
           (task.assignee_ids && task.assignee_ids.includes(user?.id))) && 
           task.assigner_id !== user?.id
  );
  
  const assignedByMeTasks = filteredTasks.filter(
    task => task.assigner_id === user?.id && 
           (task.assignee_id !== user?.id || 
            (task.assignee_ids && !task.assignee_ids.includes(user?.id)))
  );
  
  const personalTasks = filteredTasks.filter(
    task => task.assigner_id === user?.id && 
           (task.assignee_id === user?.id || 
            (task.assignee_ids && task.assignee_ids.includes(user?.id)))
  );

  return (
    <div className="space-y-6">
      {/* 任务过滤和创建按钮区域 */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">任务管理</h2>
          <TaskNotifications />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <TaskFilters
            filter={filter}
            sort={sort}
            onFilterChange={setFilter}
            onSortChange={setSort}
            canAssignTasks={canAssignTasks}
          />
          
          {canAssignTasks && (
            <TaskCreationForm
              isAdmin={isAdmin}
              onTaskCreated={handleTaskCreated}
            />
          )}
        </div>
      </div>
      
      {/* 主任务区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 接收到的任务 */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">我收到的任务</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : receivedTasks.length > 0 ? (
              <div className="space-y-3">
                {receivedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onTaskUpdate={handleTaskUpdate}
                    showAssigner={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">没有分配给你的任务</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 个人待办区域 */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">个人待办</CardTitle>
              <Button 
                size="sm" 
                className="h-8"
                onClick={() => setShowPersonalTaskDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                添加待办
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : personalTasks.length > 0 ? (
              <div className="space-y-3">
                {personalTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onTaskUpdate={handleTaskUpdate}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">没有个人待办事项</p>
              </div>
            )}
            <Alert className="mt-4 bg-blue-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                提示：你可以点击"添加待办"按钮来创建个人任务
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        {/* 我发布的任务区域 - 只对有任务权限的用户显示 */}
        {canAssignTasks && (
          <Card className="h-full lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">我发布的任务</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : assignedByMeTasks.length > 0 ? (
                <div className="space-y-3">
                  {assignedByMeTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onTaskUpdate={handleTaskUpdate}
                      showAssignee={true}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-muted-foreground">你还没有发布任何任务</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* 个人任务创建对话框 */}
      {user && (
        <TaskCreationForm
          isAdmin={isAdmin}
          onTaskCreated={handlePersonalTaskCreated}
          open={showPersonalTaskDialog}
          onOpenChange={setShowPersonalTaskDialog}
          isPersonalTask={true}
          defaultAssigneeIds={[user.id]}
        />
      )}
      
      {/* 添加任务发布区域 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">发布新任务</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskAssignmentForm 
            isAdmin={isAdmin} 
            onTaskCreated={handleTaskCreated}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskBoard;
