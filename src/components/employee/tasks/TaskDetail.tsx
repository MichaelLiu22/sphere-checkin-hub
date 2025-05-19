
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  formatDate, 
  formatDateTime, 
  getPriorityColor, 
  getPriorityText, 
  getRepeatTypeText,
  addTaskComment,
  type Task,
  type Comment
} from "./utils";
import { AlertCircle, Calendar, Clock, FileText, Send, User, Users } from "lucide-react";

interface TaskDetailProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: (task: Task) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task: initialTask, open, onOpenChange, onTaskUpdate }) => {
  const { user } = useAuth();
  const [task, setTask] = useState<Task>(initialTask);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

  const handleStatusChange = async (completed: boolean) => {
    if (!user) return;

    try {
      let updatedTaskData: Partial<Task> = {};

      if (task.assignee_id) {
        // 单人任务
        updatedTaskData = {
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        };
      } else if (task.assignee_ids && task.assignee_ids.includes(user.id)) {
        // 多人任务
        const updatedCompletedBy = {
          ...task.completed_by,
          [user.id]: completed,
        };
        updatedTaskData = {
          completed_by: updatedCompletedBy,
        };
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updatedTaskData)
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;

      const updatedTask: Task = {
        ...task,
        ...data,
        completed: data.completed,
        completed_at: data.completed_at,
        completed_by: data.completed_by as Record<string, boolean>,
        comments: task.comments // preserve existing comments
      };

      setTask(updatedTask);
      onTaskUpdate(updatedTask);
      toast.success(`任务已标记为${completed ? '完成' : '未完成'}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('更新任务状态失败');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      // Create a new comment
      const comment: Comment = {
        id: crypto.randomUUID(),
        user_id: user.id,
        user_name: user.full_name,
        content: newComment,
        created_at: new Date().toISOString()
      };
    
      // Update the task with the new comment
      const updatedComments = [...(task.comments || []), comment];
      
      const { error } = await supabase
        .from('tasks')
        .update({ comments: updatedComments })
        .eq('id', task.id);
        
      if (error) throw error;
      
      // Update local state
      setTask({
        ...task,
        comments: updatedComments
      });
      
      setNewComment('');
      toast.success('评论已添加');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('添加评论失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>任务详情</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>任务名称</Label>
              <Input type="text" value={task.title} className="cursor-not-allowed" readOnly />
            </div>
            <div>
              <Label>优先级</Label>
              <Badge className={`gap-1.5 ${getPriorityColor(task.priority)}`}>
                <AlertCircle className="h-4 w-4" />
                {getPriorityText(task.priority)}
              </Badge>
            </div>
          </div>

          <div>
            <Label>任务描述</Label>
            <Textarea value={task.description || ''} className="cursor-not-allowed" readOnly />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>创建时间</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(task.created_at)}</span>
              </div>
            </div>
            <div>
              <Label>截止时间</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(task.deadline)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>创建人</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{task.assigner_name}</span>
              </div>
            </div>
            {task.assignee_name && (
              <div>
                <Label>接收人</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{task.assignee_name}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>状态</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={
                  task.assignee_id ? task.completed : (task.completed_by && task.completed_by[user?.id])
                }
                onCheckedChange={(checked) => handleStatusChange(!!checked)}
              />
              <Label htmlFor="completed">
                {task.assignee_id ? (
                  task.completed ? '已完成' : '未完成'
                ) : (
                  task.completed_by && task.completed_by[user?.id] ? '已完成' : '未完成'
                )}
              </Label>
            </div>
          </div>

          <div>
            <Label>添加评论</Label>
            <div className="flex items-center space-x-2">
              <Textarea
                placeholder="输入评论内容..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddComment}><Send className="w-4 h-4 mr-2" />发送</Button>
            </div>
          </div>

          {task.comments && task.comments.length > 0 ? (
            <div className="space-y-3 mt-4">
              {task.comments.map((comment: Comment) => (
                <div key={comment.id} className="bg-secondary/30 p-3 rounded-lg">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-medium">{comment.user_name}</span>
                    <span>{formatDateTime(comment.created_at)}</span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">暂无评论</p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetail;
