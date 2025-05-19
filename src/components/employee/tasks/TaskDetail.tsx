
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, Clock, FileText, MessageCircle, Send, User } from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  getPriorityColor,
  getPriorityText,
  getRepeatTypeText,
  addTaskComment,
  Comment
} from './utils';

// 任务接口
interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  deadline: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  assigner_id: string;
  assignee_id: string;
  department_id: string | null;
  assignee_name?: string;
  comments?: Comment[];
}

// 组件属性接口
interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
  onTaskUpdate: () => void;
}

/**
 * 任务详情组件
 * 
 * 显示任务的详细信息，包括状态、描述、截止日期等
 * 允许添加评论和标记任务为已完成
 * 
 * @param {TaskDetailProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的组件
 */
const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, onClose, onTaskUpdate }) => {
  // 状态管理
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState<boolean>(false);
  const [assignerName, setAssignerName] = useState<string>('');
  
  // 钩子
  const { user } = useAuth();
  const { toast } = useToast();

  // 加载任务详情数据
  useEffect(() => {
    const fetchTaskDetail = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, assignee:assignee_id(full_name)')
          .eq('id', taskId)
          .single();

        if (error) throw error;

        // 重新格式化数据以匹配我们的Task接口
        const formattedTask = {
          ...data,
          assignee_name: data.assignee ? data.assignee.full_name : '未指派',
          comments: data.comments || []
        };

        setTask(formattedTask);

        // 获取发布者(assigner)的姓名
        if (data.assigner_id) {
          const { data: assignerData, error: assignerError } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', data.assigner_id)
            .single();

          if (!assignerError && assignerData) {
            setAssignerName(assignerData.full_name);
          } else {
            setAssignerName('未知');
          }
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
        toast({
          title: '获取任务详情失败',
          description: '无法加载任务信息，请稍后重试。',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskDetail();
    }
  }, [taskId, toast]);

  /**
   * 提交评论
   */
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user || !task) return;

    setIsSubmittingComment(true);
    try {
      const updatedComments = await addTaskComment(
        task.id,
        user.id,
        user.full_name,
        commentText.trim()
      );

      setTask(prev => prev ? { ...prev, comments: updatedComments } : null);
      setCommentText('');
      toast({
        title: '评论已添加',
        description: '您的评论已成功添加到任务中',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: '添加评论失败',
        description: '无法添加您的评论，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /**
   * 标记任务为已完成
   */
  const handleCompleteTask = async () => {
    if (!task || !user) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: '任务已完成',
        description: '任务已被标记为已完成',
      });
      
      setTask(prev => prev ? { ...prev, completed: true, completed_at: new Date().toISOString() } : null);
      onTaskUpdate();
      setConfirmCompleteOpen(false);
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: '更新任务状态失败',
        description: '无法将任务标记为已完成，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 任务未加载完成时显示加载状态
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="animate-pulse h-24 bg-gray-200 rounded mb-4"></div>
        <div className="animate-pulse h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      </div>
    );
  }

  // 任务不存在时显示错误提示
  if (!task) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-medium text-red-600">无法加载任务</h3>
        <p className="text-gray-500 mb-4">找不到指定的任务或发生了错误。</p>
        <Button onClick={onClose}>关闭</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
      {/* 任务标题 */}
      <div>
        <h2 className="text-xl font-bold">{task.title}</h2>
        <div className="flex items-center mt-2 text-sm text-gray-500 space-x-2">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>发布者: {assignerName}</span>
          </div>
          <span>•</span>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>创建于: {formatDateTime(task.created_at)}</span>
          </div>
        </div>
      </div>

      {/* 任务状态和相关信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-500">状态</p>
          <div className="flex items-center mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              task.completed ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
            }`}>
              {task.completed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  已完成
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  进行中
                </>
              )}
            </span>
            {task.completed && task.completed_at && (
              <span className="text-xs text-gray-500 ml-2">
                完成于: {formatDateTime(task.completed_at)}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">优先级</p>
          <p className={`mt-1 ${getPriorityColor(task.priority)}`}>
            {getPriorityText(task.priority)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">截止日期</p>
          <p className="mt-1">{formatDate(task.deadline)}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">指派给</p>
          <p className="mt-1">{task.assignee_name || '未指派'}</p>
        </div>
      </div>

      {/* 任务描述 */}
      <div className="space-y-2">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          <h3 className="text-base font-medium">任务描述</h3>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          {task.description ? (
            <p className="whitespace-pre-wrap">{task.description}</p>
          ) : (
            <p className="text-gray-400 italic">无描述</p>
          )}
        </div>
      </div>

      {/* 评论区 */}
      <div className="space-y-2">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          <h3 className="text-base font-medium">评论</h3>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          {task.comments && task.comments.length > 0 ? (
            <div className="space-y-4">
              {task.comments.map((comment, index) => (
                <div key={index} className="pb-3 border-b last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{comment.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">暂无评论</p>
          )}
          
          {/* 添加评论 */}
          {!task.completed && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="添加评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                disabled={isSubmittingComment}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                >
                  <Send className="h-4 w-4 mr-2" />
                  发送
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 任务操作按钮 */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          关闭
        </Button>
        
        {!task.completed && task.assignee_id === user?.id && (
          <Button onClick={() => setConfirmCompleteOpen(true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            标记为已完成
          </Button>
        )}
      </div>

      {/* 确认完成任务对话框 */}
      <AlertDialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认完成任务</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要将此任务标记为已完成吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteTask}>
              确认完成
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskDetail;
