/**
 * 任务项组件
 * 显示单个任务的详情、状态和操作选项
 */
import React, { useState } from "react";
import { Task } from "./utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";
import TaskDetail from "./TaskDetail";
import { Trash2, AlertCircle, Clock, Users } from "lucide-react";

interface TaskItemProps {
  task: any; // Using any for now to handle the conversion issue
  onTaskUpdate: (task: Task) => void;
  onDelete?: () => void;
  showAssigner?: boolean;
  showAssignee?: boolean;
  showCompletionTime?: boolean;
}

/**
 * 任务项组件
 * 显示单个任务的卡片，包含完成状态、优先级、截止日期等信息
 * 
 * @param {TaskItemProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的任务项卡片
 */
const TaskItem: React.FC<TaskItemProps> = ({
  task: taskData,
  onTaskUpdate,
  onDelete,
  showAssigner = false,
  showAssignee = false,
  showCompletionTime = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const { user } = useAuth();
  
  // Convert task data to match our Task type
  const task: Task = {
    ...taskData,
    comments: Array.isArray(taskData.comments) ? taskData.comments : [],
    completed_by: typeof taskData.completed_by === 'object' ? taskData.completed_by : {},
  };

  /**
   * 获取任务优先级对应的颜色样式类
   * @param {string} priority - 任务优先级
   * @returns {string} 样式类名
   */
  const getPriorityColor = (priority: string) => {
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

  /**
   * 获取任务优先级对应的显示文本
   * @param {string} priority - 任务优先级
   * @returns {string} 显示文本
   */
  const getPriorityText = (priority: string) => {
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

  /**
   * 标记任务完成状态
   * @param {Task} task - 要更新的任务
   * @param {string} userId - 当前用户ID
   * @param {boolean} completed - 完成状态
   * @returns {Promise<Task|null>} 更新后的任务或null
   */
  const markTaskCompleted = async (task: Task, userId: string, completed: boolean): Promise<Task | null> => {
    try {
      let updateData: any = {};
      
      if (task.assignee_id) {
        // 单人任务
        updateData.completed = completed;
        // 如果标记为完成，记录完成时间
        if (completed) {
          updateData.completed_at = new Date().toISOString();
        } else {
          updateData.completed_at = null;
        }
      } else if (task.assignee_ids && task.assignee_ids.includes(userId)) {
        // 多人任务
        updateData.completed_by = {
          ...task.completed_by,
          [userId]: completed ? new Date().toISOString() : null
        };
        
        // 检查是否所有人都完成了，如果是，则更新completed和completed_at
        const completedBy = {
          ...task.completed_by,
          [userId]: completed ? new Date().toISOString() : null
        };
        
        const allCompleted = task.assignee_ids.every(id => completedBy[id]);
        if (allCompleted) {
          updateData.completed = true;
          updateData.completed_at = new Date().toISOString();
        } else {
          updateData.completed = false;
          updateData.completed_at = null;
        }
      }
      
      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", task.id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return data as Task;
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("更新任务状态失败");
      return null;
    }
  };

  /**
   * 处理任务完成状态复选框变化
   * @param {CheckedState} checked - 复选框状态
   */
  const handleCompletedChange = async (checked: CheckedState) => {
    if (!user) return;
    
    // Convert the CheckedState to boolean - ensure it's only true or false
    const isChecked = checked === true;
    
    const result = await markTaskCompleted(task, user.id, isChecked);
    if (result && onTaskUpdate) {
      onTaskUpdate(result);
    }
  };

  /**
   * 获取复选框的选中状态
   * @returns {boolean} 是否选中
   */
  const getCheckedState = (): boolean => {
    if (!user) return false;
    
    if (task.completed) {
      // 对于已完全标记为完成的任务
      return true;
    }
    
    if (task.completed_by && task.completed_by[user.id]) {
      // 对于当前用户已完成其部分的群组任务
      return true;
    }
    
    return false;
  };

  return (
    <>
      <Card className={cn("border rounded-md p-3", task.completed ? "bg-muted/50" : "")}>
        <CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={`task-${task.id}`}
                checked={getCheckedState()}
                onCheckedChange={handleCompletedChange}
              />
              <div>
                <h4 className={cn("font-medium", task.completed ? "line-through text-muted-foreground" : "")}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={cn("text-xs px-2 py-0.5 rounded border", getPriorityColor(task.priority))}>
                    {getPriorityText(task.priority)}
                  </span>
                  {task.deadline && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-300">
                      截止: {format(new Date(task.deadline), "yyyy-MM-dd")}
                    </span>
                  )}
                  {showAssigner && task.assigner_name && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                      发布者: {task.assigner_name}
                    </span>
                  )}
                  {showAssignee && task.assignee_name && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded border border-orange-300">
                      接收者: {task.assignee_name}
                    </span>
                  )}
                  {showCompletionTime && task.completed_at && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-300">
                      完成时间: {format(new Date(task.completed_at), "yyyy-MM-dd HH:mm")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Make sure you handle the Task type correctly in the TaskDetail component */}
      {showDetail && (
        <TaskDetail 
          task={task}
          open={showDetail}
          onOpenChange={setShowDetail}
          onTaskUpdate={onTaskUpdate}
        />
      )}
    </>
  );
};

export default TaskItem;
