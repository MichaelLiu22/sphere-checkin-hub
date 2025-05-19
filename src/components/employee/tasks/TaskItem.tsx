
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  Task, 
  getPriorityColor, 
  getPriorityText, 
  formatDate,
  markTaskCompleted
} from "./utils";
import TaskDetail from "./TaskDetail";
import { MessageSquare, Paperclip, ChevronRight } from "lucide-react";
import { CheckedState } from "@radix-ui/react-checkbox";

interface TaskItemProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  showAssigner?: boolean;
  showAssignee?: boolean;
  onDelete?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onTaskUpdate, 
  showAssigner = false, 
  showAssignee = false,
  onDelete
}) => {
  const { user } = useAuth();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  if (!user) return null;

  const isCompleted = task.completed || 
    (task.completed_by && task.completed_by[user.id]);
  
  const handleCompletedChange = async (checked: CheckedState) => {
    if (!user) return;
    
    // Convert the CheckedState to boolean
    const isChecked = checked === true;
    
    const result = await markTaskCompleted(task, user.id, isChecked);
    
    if (result.success) {
      onTaskUpdate({
        ...task,
        completed: task.assignee_id === user.id ? isChecked : task.completed,
        completed_at: result.completedAt,
        completed_by: result.completedBy
      });
    }
  };
  
  const hasComments = task.comments && task.comments.length > 0;
  const hasAttachments = task.attachments && task.attachments.length > 0;
  
  // Determine deadline from either 'deadline' or 'due_date' field
  const deadline = task.deadline || task.due_date;
  const isPastDue = deadline && new Date(deadline) < new Date() && !isCompleted;
  
  return (
    <>
      <div className={cn(
        "border rounded-md p-3 transition-colors",
        isCompleted ? "bg-muted/50" : isPastDue ? "bg-red-50" : ""
      )}>
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleCompletedChange}
            />
          </div>
          
          <div className="flex-1">
            <button 
              onClick={() => setIsDetailOpen(true)}
              className="text-left w-full"
            >
              <div className="flex justify-between items-start">
                <h4 className={cn(
                  "font-medium group flex items-center gap-1",
                  isCompleted && "line-through text-muted-foreground"
                )}>
                  {task.title}
                  <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                </h4>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDelete();
                    }}
                  >
                    <span className="sr-only">删除</span>
                    &times;
                  </Button>
                )}
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded border", 
                  getPriorityColor(task.priority)
                )}>
                  {getPriorityText(task.priority)}
                </span>
                
                {deadline && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded border",
                    isPastDue 
                      ? "bg-red-100 text-red-800 border-red-300" 
                      : "bg-blue-100 text-blue-800 border-blue-300"
                  )}>
                    截止: {formatDate(deadline)}
                  </span>
                )}
                
                {showAssigner && task.assigner_name && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                    来自: {task.assigner_name}
                  </span>
                )}
                
                {showAssignee && task.assignee_name && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                    分配给: {task.assignee_name}
                  </span>
                )}
                
                {/* Multi-assignee indicator */}
                {task.assignee_ids && task.assignee_ids.length > 1 && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-300">
                    多人任务 ({task.assignee_ids.length})
                  </span>
                )}
                
                {/* Meta indicators */}
                <div className="flex items-center gap-1 ml-auto">
                  {hasAttachments && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Paperclip className="h-3 w-3 mr-0.5" />
                      {task.attachments!.length}
                    </div>
                  )}
                  
                  {hasComments && (
                    <div className="flex items-center text-xs text-gray-500 ml-2">
                      <MessageSquare className="h-3 w-3 mr-0.5" />
                      {task.comments!.length}
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {isDetailOpen && (
        <TaskDetail
          task={task}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onTaskUpdate={onTaskUpdate}
        />
      )}
    </>
  );
};

export default TaskItem;
