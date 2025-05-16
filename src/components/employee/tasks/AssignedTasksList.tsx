
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  assignee_name?: string;
}

interface AssignedTasksListProps {
  tasks: Task[];
  isLoading: boolean;
  onDeleteTask: (taskId: string) => void;
}

const AssignedTasksList: React.FC<AssignedTasksListProps> = ({
  tasks,
  isLoading,
  onDeleteTask
}) => {
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
          <p className="text-muted-foreground">你还没有发布任何任务</p>
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
                <div className="flex-1">
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
                      分配给: {task.assignee_name}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded border",
                      task.completed 
                        ? "bg-green-100 text-green-800 border-green-300" 
                        : "bg-gray-100 text-gray-800 border-gray-300"
                    )}>
                      {task.completed ? "已完成" : "未完成"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTask(task.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AssignedTasksList;
