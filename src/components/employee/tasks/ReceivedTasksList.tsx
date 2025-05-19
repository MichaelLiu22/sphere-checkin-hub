
/**
 * 已接收任务列表组件
 * 显示分配给当前用户的任务列表
 */
import React from "react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/**
 * 任务接口定义
 */
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
}

interface ReceivedTasksListProps {
  tasks: Task[];                                      // 任务列表
  isLoading: boolean;                                 // 加载状态
  onTaskComplete: (task: Task, completed: boolean) => void; // 任务完成状态改变回调
}

/**
 * 收到的任务列表组件
 * 
 * @param {ReceivedTasksListProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的任务列表
 */
const ReceivedTasksList: React.FC<ReceivedTasksListProps> = ({
  tasks,
  isLoading,
  onTaskComplete
}) => {
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

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-muted-foreground">没有分配给你的任务</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "border rounded-md p-3",
                task.completed ? "bg-muted/50" : ""
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => 
                      onTaskComplete(task, checked as boolean)
                    }
                  />
                  <div>
                    <h4 className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
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
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                        来自: {task.assigner_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ReceivedTasksList;
