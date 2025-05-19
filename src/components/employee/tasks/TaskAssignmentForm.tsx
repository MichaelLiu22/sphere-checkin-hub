
/**
 * 任务分配表单组件
 * 用于创建和分配新任务给员工
 */
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// 导入组件和hooks
import { taskFormSchema, TaskFormValues } from "./schemas/taskFormSchema";
import useEmployeeData from "./hooks/useEmployeeData";
import { AssigneeField } from "./components/AssigneeField";
import { PriorityField } from "./components/PriorityField";
import { DeadlineField } from "./components/DeadlineField";
import { Task, convertDatabaseTaskToTask } from "./utils";

/**
 * 任务分配表单组件接口
 */
interface TaskAssignmentFormProps {
  isAdmin: boolean;                   // 是否为管理员
  onTaskCreated: (task: Task) => void; // 任务创建后回调
}

/**
 * 任务分配表单组件
 * 
 * @param {TaskAssignmentFormProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的表单组件
 */
const TaskAssignmentForm: React.FC<TaskAssignmentFormProps> = ({ isAdmin, onTaskCreated }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 使用自定义钩子获取员工数据
  const { allEmployees, departmentEmployees, loading } = useEmployeeData(isAdmin, user?.department_id);

  // 初始化表单，使用zod进行验证
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium", 
      deadline: null,
      assignee_id: "",
    },
  });

  /**
   * 处理表单提交
   * 创建新任务并保存到数据库
   * 
   * @param {TaskFormValues} values - 表单值
   */
  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 获取当前用户的部门ID
      const { data: userData } = await supabase
        .from("users")
        .select("department_id")
        .eq("id", user.id)
        .single();
        
      if (!userData) {
        throw new Error("User data not found");
      }
      
      // 创建任务数据对象，包含所有必要字段
      const taskData = {
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        deadline: values.deadline ? values.deadline.toISOString() : null,
        assigner_id: user.id,
        assignee_id: values.assignee_id,
        completed: false,
        completed_at: null,
        department_id: userData.department_id
      };
      
      console.log("Submitting task data:", taskData);
      
      // 使用RPC调用创建任务（绕过RLS）
      const { data, error } = await supabase.rpc('create_task', taskData);
      
      if (error) {
        console.error("Error creating task via RPC:", error);
        throw error;
      }

      // 重置表单
      form.reset();
      toast.success("任务已成功分配");
      
      if (data) {
        // 构造一个类型安全的Task对象
        const taskResponse = data as Record<string, any>;
        
        // 创建一个类型正确的Task对象
        const newTask: Task = {
          id: taskResponse.id,
          title: taskResponse.title,
          description: taskResponse.description,
          priority: taskResponse.priority as "high" | "medium" | "low",
          deadline: taskResponse.deadline,
          completed: Boolean(taskResponse.completed),
          completed_at: taskResponse.completed_at,
          created_at: taskResponse.created_at || new Date().toISOString(),
          assigner_id: taskResponse.assigner_id,
          assignee_id: taskResponse.assignee_id,
          assignee_name: taskResponse.assignee_name,
          comments: [],
          completed_by: {}
        };
        
        onTaskCreated(newTask);
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error("分配任务失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>任务标题</FormLabel>
                <FormControl>
                  <Input placeholder="请输入任务标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 使用分离出的组件 */}
          <AssigneeField 
            form={form}
            isAdmin={isAdmin}
            allEmployees={allEmployees}
            departmentEmployees={departmentEmployees}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务描述</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="请输入任务详细描述（可选）" 
                  className="min-h-[100px]" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 使用分离出的组件 */}
          <DeadlineField form={form} />
          <PriorityField form={form} />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "发布中..." : "发布任务"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskAssignmentForm;
