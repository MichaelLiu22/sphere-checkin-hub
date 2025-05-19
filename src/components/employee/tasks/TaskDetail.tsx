
import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  formatDate, 
  formatDateTime, 
  getPriorityColor, 
  getPriorityText,
  getRepeatTypeText,
  addTaskComment,
  Task,
  Comment
} from "./utils";
import { cn } from "@/lib/utils";
import { Paperclip, MessageSquare } from "lucide-react";

interface TaskDetailProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (task: Task) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ 
  task, 
  isOpen, 
  onClose,
  onTaskUpdate
}) => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!user) return null;

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      const result = await addTaskComment(
        task.id, 
        user.id, 
        user.full_name, 
        comment,
        task.comments as Comment[]
      );
      
      if (result.success) {
        setComment("");
        // Update the task with new comments
        onTaskUpdate({
          ...task,
          comments: result.comments
        });
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const isAssigneeOrAssigner = () => {
    if (!user) return false;
    
    // Check if current user is the assigner
    if (task.assigner_id === user.id) return true;
    
    // Check if current user is the assignee (single assignee)
    if (task.assignee_id === user.id) return true;
    
    // Check if current user is in the assignee_ids array (multi-assignee)
    if (task.assignee_ids && task.assignee_ids.includes(user.id)) return true;
    
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          {/* Task info */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={cn("text-xs px-2 py-0.5 rounded border", getPriorityColor(task.priority))}>
                {getPriorityText(task.priority)}
              </span>
              {task.deadline && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-300">
                  截止: {formatDate(task.deadline)}
                </span>
              )}
              {task.due_date && !task.deadline && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-300">
                  截止: {formatDate(task.due_date)}
                </span>
              )}
              {task.repeat_type && task.repeat_type !== "none" && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                  {getRepeatTypeText(task.repeat_type)}
                  {task.repeat_type === "custom" && task.repeat_interval && (
                    <> (每 {task.repeat_interval} 天)</>
                  )}
                </span>
              )}
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {task.description}
              </p>
            )}
            
            <div className="text-xs text-gray-500">
              创建于: {formatDateTime(task.created_at)}
            </div>
          </div>
          
          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <Accordion type="single" collapsible className="border rounded-md">
              <AccordionItem value="attachments">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    附件 ({task.attachments.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-2">
                    {task.attachments.map((url, index) => (
                      <div key={index} className="flex items-center justify-between border rounded p-2">
                        <span className="text-sm truncate max-w-[300px]">
                          {url.split('/').pop()}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            查看
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          
          {/* Comments */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              <h3 className="font-medium">评论</h3>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">
                        {comment.user_name || "用户"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(comment.created_at)}
                      </div>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">
                  暂无评论
                </div>
              )}
            </div>
            
            {/* Only allow comments if user is involved in the task */}
            {isAssigneeOrAssigner() && (
              <div className="mt-4 space-y-3">
                <Textarea 
                  placeholder="添加评论..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={!comment.trim() || isSubmittingComment}
                  >
                    发布评论
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetail;
