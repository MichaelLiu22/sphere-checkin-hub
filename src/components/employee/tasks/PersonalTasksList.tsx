
import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X } from "lucide-react";

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
}

interface PersonalTasksListProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskComplete: (task: Task, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskAdded: (task: Task) => void;
}

const personalTaskSchema = z.object({
  title: z.string().min(1, { message: "标题不能为空" }),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "请选择优先级",
  }),
  deadline: z.date().optional().nullable(),
});

const PersonalTasksList: React.FC<PersonalTasksListProps> = ({
  tasks,
  isLoading,
  onTaskComplete,
  onDeleteTask,
  onTaskAdded
}) => {
  const { user } = useAuth();
  const [isPersonalTaskDialogOpen, setIsPersonalTaskDialogOpen] = useState(false);
  
  const personalTaskForm = useForm<z.infer<typeof personalTaskSchema>>({
    resolver: zodResolver(personalTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      deadline: null,
    },
  });

  const onPersonalTaskFormSubmit = async (values: z.infer<typeof personalTaskSchema>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: values.title,
          description: values.description || null,
          priority: values.priority,
          deadline: values.deadline ? values.deadline.toISOString() : null,
          assigner_id: user.id,
          assignee_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      personalTaskForm.reset();
      setIsPersonalTaskDialogOpen(false);
      toast.success("个人任务已创建");
      
      if (data) {
        const typedNewTask = {
          ...data,
          priority: data.priority as "high" | "medium" | "low"
        };
        onTaskAdded(typedNewTask as Task);
      }
    } catch (error) {
      console.error("Error creating personal task:", error);
      toast.error("创建个人任务失败");
    }
  };

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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">个人待办</h3>
        <Dialog
          open={isPersonalTaskDialogOpen}
          onOpenChange={setIsPersonalTaskDialogOpen}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="mr-2 h-4 w-4" />
              添加待办
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加个人待办</DialogTitle>
            </DialogHeader>
            <Form {...personalTaskForm}>
              <form
                onSubmit={personalTaskForm.handleSubmit(
                  onPersonalTaskFormSubmit
                )}
                className="space-y-4"
              >
                <FormField
                  control={personalTaskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>标题</FormLabel>
                      <FormControl>
                        <Input placeholder="待办标题" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalTaskForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Textarea placeholder="待办描述（可选）" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={personalTaskForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>优先级</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择优先级" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">紧急</SelectItem>
                            <SelectItem value="medium">一般</SelectItem>
                            <SelectItem value="low">宽松</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalTaskForm.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>截止日期</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>选择日期（可选）</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">添加待办</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-muted-foreground">没有个人待办事项</p>
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
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) =>
                      onTaskComplete(task, checked as boolean)
                    }
                  />
                  <div>
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
                    </div>
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

export default PersonalTasksList;
