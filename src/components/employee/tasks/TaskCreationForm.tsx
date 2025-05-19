
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { taskFormSchema } from "./schemas/taskFormSchema";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { AssigneeField } from "./components/AssigneeField";
import { PriorityField } from "./components/PriorityField";
import { DeadlineField } from "./components/DeadlineField";
import { User, Task } from "./utils";
import { useAuth } from "@/contexts/AuthContext";

// 表单值类型
type FormValues = z.infer<typeof taskFormSchema>;

// 组件属性
interface TaskCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isAdmin?: boolean;
  onTaskCreated?: (task: Task) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isPersonalTask?: boolean;
  defaultAssigneeIds?: string[];
}

/**
 * 任务创建表单组件
 * 
 * 允许用户创建新任务，设置标题、描述、优先级、截止日期和指派给谁
 * 
 * @param {TaskCreationFormProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的表单
 */
const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  onSuccess,
  onCancel,
  isAdmin = false,
  onTaskCreated,
  open,
  onOpenChange,
  isPersonalTask = false,
  defaultAssigneeIds = [],
}) => {
  // 状态管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([]);
  
  // 获取当前用户
  const { user } = useAuth();
  const { toast } = useToast();

  // 表单初始化
  const form = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      assignee_id: "",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 默认一周后
    },
  });

  /**
   * 获取所有用户
   */
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, department_id, user_type")
        .order("full_name");
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "获取用户数据失败",
        description: "无法获取用户列表，请稍后重试",
        variant: "destructive",
      });
    }
  };

  /**
   * 获取所有部门
   */
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
        
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  /**
   * 根据部门ID获取用户
   */
  const fetchUsersByDepartment = async (departmentId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, department_id, user_type")
        .eq("department_id", departmentId)
        .order("full_name");
        
      if (error) throw error;
      setDepartmentUsers(data || []);
    } catch (error) {
      console.error("Error fetching department users:", error);
    }
  };

  // 加载初始数据
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  // 当选择部门变化时更新部门用户
  useEffect(() => {
    if (selectedDepartment) {
      fetchUsersByDepartment(selectedDepartment);
    } else {
      setDepartmentUsers([]);
    }
  }, [selectedDepartment]);

  /**
   * 提交表单处理
   * 创建新任务并保存到数据库
   */
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "未授权",
        description: "您需要登录才能创建任务",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 调用创建任务的函数
      const { data, error } = await supabase.rpc("create_task", {
        title: values.title,
        description: values.description,
        priority: values.priority,
        deadline: values.deadline.toISOString(),
        assigner_id: user.id,
        assignee_id: values.assignee_id,
        completed: false,
        completed_at: null,
        department_id: selectedDepartment || null
      });

      if (error) throw error;

      toast({
        title: "任务创建成功",
        description: "新任务已添加到系统",
      });
      
      // 调用成功回调
      if (onSuccess) onSuccess();
      
      if (onTaskCreated && data) {
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
          comments: []
        };
        
        onTaskCreated(newTask);
      }
      
      // 重置表单
      form.reset();
      
      // 如果需要关闭弹窗
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "任务创建失败",
        description: "无法创建任务，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-background border rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">创建新任务</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 任务标题 */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>任务标题</FormLabel>
                <FormControl>
                  <Input placeholder="输入任务标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 任务描述 */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>任务描述</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="详细描述任务内容和要求"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 优先级选择 */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>优先级</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择优先级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 部门选择 (仅管理员) */}
          {isAdmin && (
            <FormItem>
              <FormLabel>部门</FormLabel>
              <FormControl>
                <select 
                  className="w-full p-2 border rounded"
                  onChange={(e) => setSelectedDepartment(e.target.value || null)}
                  value={selectedDepartment || ""}
                >
                  <option value="">选择部门(可选)</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </FormControl>
            </FormItem>
          )}
          
          {/* 指派给谁 */}
          <AssigneeField
            form={form}
            allEmployees={users}
            departmentEmployees={departmentUsers}
            isAdmin={isAdmin}
          />
          
          {/* 截止日期 */}
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>截止日期</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 表单操作按钮 */}
          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                取消
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "创建中..." : "创建任务"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TaskCreationForm;
