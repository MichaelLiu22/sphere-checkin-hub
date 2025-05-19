
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema } from "./schemas/taskFormSchema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import { PriorityField } from "./components/PriorityField";
import { DeadlineField } from "./components/DeadlineField";
import useEmployeeData from "./hooks/useEmployeeData";
import { Task, convertDatabaseTaskToTask } from "./utils";
import { AssigneeField } from "./components/AssigneeField";

interface TaskCreationFormProps {
  isAdmin?: boolean;
  onTaskCreated: (task: Task) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isPersonalTask?: boolean;
  defaultAssigneeIds?: string[];
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  isAdmin = false,
  onTaskCreated,
  open = false,
  onOpenChange,
  isPersonalTask = false,
  defaultAssigneeIds = [],
}) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const { allEmployees, departmentEmployees, loading: employeeLoading } = useEmployeeData(isAdmin, user?.department_id);

  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium" as "high" | "medium" | "low",
      deadline: undefined,
      completed: false,
      assignee_id: "",
      assignee_ids: defaultAssigneeIds,
      repeat_type: "never",
      repeat_interval: 1,
    },
  });

  useEffect(() => {
    if (defaultAssigneeIds && defaultAssigneeIds.length > 0) {
      form.setValue("assignee_ids", defaultAssigneeIds);
    }
  }, [defaultAssigneeIds, form]);

  const onSubmit = async (values: any) => {
    setIsCreating(true);
    try {
      const { title, description, priority, deadline, assignee_id, assignee_ids } = values;

      // 确保assignee_ids是一个数组
      const assigneeIdsArray = assignee_ids ? (Array.isArray(assignee_ids) ? assignee_ids : [assignee_ids]) : [];

      const { data: task, error } = await supabase
        .from("tasks")
        .insert([
          {
            title,
            description,
            priority,
            deadline,
            completed: false,
            assigner_id: user?.id,
            assignee_id: isPersonalTask ? user?.id : assignee_id,
            assignee_ids: isPersonalTask ? [user?.id] : assigneeIdsArray,
            comments: [],
            completed_by: {},
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        toast.error("创建任务失败");
        return;
      }

      if (task) {
        // Convert database task to our Task interface
        const newTask = convertDatabaseTaskToTask(task);
        onTaskCreated(newTask);
        toast.success("任务已成功创建");
        form.reset();
        onOpenChange?.(false);
      }
    } catch (error) {
      console.error("Task creation error:", error);
      toast.error("创建任务时发生错误");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新任务</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>任务描述</FormLabel>
                  <FormControl>
                    <Textarea placeholder="输入任务描述" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PriorityField form={form} />
            <DeadlineField form={form} />

            {!isPersonalTask && (
              <AssigneeField 
                form={form}
                isAdmin={isAdmin}
                allEmployees={allEmployees}
                departmentEmployees={departmentEmployees}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    创建中 <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "创建任务"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreationForm;
