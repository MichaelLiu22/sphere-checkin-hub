
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

// Import our new components and hooks
import { taskFormSchema, TaskFormValues } from "./schemas/taskFormSchema";
import { useEmployeeData } from "./hooks/useEmployeeData";
import { AssigneeField } from "./components/AssigneeField";
import { PriorityField } from "./components/PriorityField";
import { DeadlineField } from "./components/DeadlineField";

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

interface TaskAssignmentFormProps {
  isAdmin: boolean;
  onTaskCreated: (task: Task) => void;
}

const TaskAssignmentForm: React.FC<TaskAssignmentFormProps> = ({ isAdmin, onTaskCreated }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use our custom hook to fetch employee data
  const { departmentEmployees, allEmployees } = useEmployeeData({ isAdmin });

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

  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Include the department_id in the task data to satisfy RLS policies
      const { data, error } = await supabase.from("tasks").insert({
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        deadline: values.deadline ? values.deadline.toISOString() : null,
        assigner_id: user.id,
        assignee_id: values.assignee_id,
        completed: false,
        completed_at: null,
        department_id: user.department_id // Add department_id from the current user
      }).select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, full_name)
      `).single();

      if (error) throw error;

      form.reset();
      toast.success("任务已成功分配");
      
      if (data) {
        const typedNewTask = {
          ...data,
          assignee_name: data.assignee?.full_name || "未知",
          priority: data.priority as "high" | "medium" | "low"
        };
        onTaskCreated(typedNewTask as Task);
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
