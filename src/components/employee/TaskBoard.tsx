
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import refactored components
import TaskAssignmentForm from "./tasks/TaskAssignmentForm";
import AssignedTasksList from "./tasks/AssignedTasksList";
import ReceivedTasksList from "./tasks/ReceivedTasksList";
import PersonalTasksList from "./tasks/PersonalTasksList";

interface User {
  id: string;
  full_name: string;
  department_id?: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  deadline: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  assigner_id: string;
  assignee_id: string;
  assigner_name?: string;
  assignee_name?: string;
}

interface TaskBoardProps {
  canAssignTasks: boolean;
  isAdmin: boolean;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ canAssignTasks, isAdmin }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [personalTasks, setPersonalTasks] = useState<Task[]>([]);
  const [tasksAssignedByMe, setTasksAssignedByMe] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks assigned to current user and by current user
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        // Get tasks assigned to me
        const { data: assignedData, error: assignedError } = await supabase
          .from("tasks")
          .select(`
            *,
            users!tasks_assigner_id_fkey(id, full_name)
          `)
          .eq("assignee_id", user.id)
          .neq("assigner_id", user.id); // Exclude tasks I assigned to myself

        if (assignedError) throw assignedError;

        // Get personal tasks (where I'm both assigner and assignee)
        const { data: personalData, error: personalError } = await supabase
          .from("tasks")
          .select("*")
          .eq("assigner_id", user.id)
          .eq("assignee_id", user.id);

        if (personalError) throw personalError;
        
        // Get tasks assigned by me to others
        const { data: assignedByMeData, error: assignedByMeError } = await supabase
          .from("tasks")
          .select(`
            *,
            assignee:users!tasks_assignee_id_fkey(id, full_name)
          `)
          .eq("assigner_id", user.id)
          .neq("assignee_id", user.id); // Exclude tasks I assigned to myself

        if (assignedByMeError) throw assignedByMeError;

        // Format the assigned tasks
        const formattedAssignedTasks = (assignedData || []).map((task) => ({
          ...task,
          assigner_name: task.users?.full_name || "未知",
          priority: task.priority as "high" | "medium" | "low"
        }));

        // Format tasks assigned by me
        const formattedAssignedByMeTasks = (assignedByMeData || []).map((task) => ({
          ...task,
          assignee_name: task.assignee?.full_name || "未知",
          priority: task.priority as "high" | "medium" | "low"
        }));

        setAssignedTasks(formattedAssignedTasks as Task[]);
        setTasksAssignedByMe(formattedAssignedByMeTasks as Task[]);
        setPersonalTasks((personalData || []).map(task => ({
          ...task,
          priority: task.priority as "high" | "medium" | "low"
        })) as Task[]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("获取任务数据失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const handleTaskComplete = async (task: Task, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", task.id);

      if (error) throw error;

      toast.success(completed ? "任务已完成" : "任务已重新打开");
      
      // Update local state
      if (task.assigner_id === user?.id && task.assignee_id === user?.id) {
        // Personal task
        setPersonalTasks(
          personalTasks.map((t) =>
            t.id === task.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
          )
        );
      } else if (task.assignee_id === user?.id) {
        // Assigned task
        setAssignedTasks(
          assignedTasks.map((t) =>
            t.id === task.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
          )
        );
      } else if (task.assigner_id === user?.id) {
        // Task assigned by me
        setTasksAssignedByMe(
          tasksAssignedByMe.map((t) =>
            t.id === task.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
          )
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("更新任务状态失败");
    }
  };

  const handleDeleteTask = async (taskId: string, taskType: 'personal' | 'assigned' | 'assignedByMe') => {
    if (!confirm("确定要删除此任务吗？")) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      toast.success("任务已删除");

      // Update local state based on task type
      switch (taskType) {
        case 'personal':
          setPersonalTasks(personalTasks.filter((t) => t.id !== taskId));
          break;
        case 'assigned':
          setAssignedTasks(assignedTasks.filter((t) => t.id !== taskId));
          break;
        case 'assignedByMe':
          setTasksAssignedByMe(tasksAssignedByMe.filter((t) => t.id !== taskId));
          break;
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("删除任务失败");
    }
  };

  const handleTaskAssigned = (newTask: Task) => {
    setTasksAssignedByMe([newTask, ...tasksAssignedByMe]);
  };

  const handlePersonalTaskAdded = (newTask: Task) => {
    setPersonalTasks([newTask, ...personalTasks]);
  };

  return (
    <div className="space-y-6">
      {/* Task Assignment Form - Only show if user has task permission */}
      {canAssignTasks && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">发布任务</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskAssignmentForm 
              isAdmin={isAdmin} 
              onTaskCreated={handleTaskAssigned} 
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Assigned By Me - Only show if user has task permission */}
        {canAssignTasks && (
          <Card className="h-full">
            <CardHeader className="pb-2 space-y-0">
              <CardTitle>我发布的任务</CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
              <AssignedTasksList 
                tasks={tasksAssignedByMe}
                isLoading={isLoading}
                onDeleteTask={(taskId) => handleDeleteTask(taskId, 'assignedByMe')}
              />
            </CardContent>
          </Card>
        )}

        {/* Assigned Tasks - All users can see this */}
        <Card className="h-full">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle>我收到的任务</CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <ReceivedTasksList 
              tasks={assignedTasks}
              isLoading={isLoading}
              onTaskComplete={handleTaskComplete}
            />
          </CardContent>
        </Card>

        {/* Personal Tasks - All users can see this */}
        <Card className="h-full md:col-span-2">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle>个人待办</CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <PersonalTasksList
              tasks={personalTasks}
              isLoading={isLoading}
              onTaskComplete={handleTaskComplete}
              onDeleteTask={(taskId) => handleDeleteTask(taskId, 'personal')}
              onTaskAdded={handlePersonalTaskAdded}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskBoard;
