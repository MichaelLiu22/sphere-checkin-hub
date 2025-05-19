
/**
 * 任务详情组件
 * 显示单个任务的完整详情，包括描述、状态、附件和评论
 */
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
  task: Task;                       // 任务数据
  isOpen: boolean;                  // 对话框是否打开
  onClose: () => void;              // 关闭对话框回调
  onTaskUpdate: (task: Task) => void; // 任务更新回调
}

/**
 * 任务详情对话框组件
 * 显示任务完整信息，并允许添加评论
 * 
 * @param {TaskDetailProps} props - 组件属性
 * @returns {React.ReactElement | null} 渲染的任务详情对话框或null
 */
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

  /**
   * 处理评论提交
   * 添加新评论到任务
   */
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
        // 更新带有新评论的任务
        onTaskUpdate({
          ...task,
          comments: result.comments
        });
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  /**
   * 检查当前用户是否为任务的接收者或发布者
   * @returns {boolean} 是否有权限评论
   */
  const isAssigneeOrAssigner = () => {
    if (!user) return false;
    
    // 检查当前用户是否是任务发布者
    if (task.assigner_id === user.id) return true;
    
    // 检查当前用户是否是单一接收者
    if (task.assignee_id === user.id) return true;
    
    // 检查当前用户是否在多接收者数组中
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
          {/* 任务基本信息 */}
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
          
          {/* 附件区域 */}
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
          
          {/* 评论区域 */}
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
            
            {/* 仅当用户与任务相关联时才允许评论 */}
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
