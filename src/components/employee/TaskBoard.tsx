import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus, Check, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  full_name: string;
  department_id?: string | null;
}

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
  assigner_name?: string;
  assignee_name?: string;
}

const taskFormSchema = z.object({
  title: z.string().min(1, { message: "标题不能为空" }),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "请选择优先级",
  }),
  deadline: z.date().optional().nullable(),
  assignee_id: z.string().min(1, { message: "请选择分配对象" }),
});

const personalTaskSchema = z.object({
  title: z.string().min(1, { message: "标题不能为空" }),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "请选择优先级",
  }),
  deadline: z.date().optional().nullable(),
});

const TaskBoard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [personalTasks, setPersonalTasks] = useState<Task[]>([]);
  const [tasksAssignedByMe, setTasksAssignedByMe] = useState<Task[]>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<User[]>([]);
  const [hasTaskPermission, setHasTaskPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isPersonalTaskDialogOpen, setIsPersonalTaskDialogOpen] = useState(false);
  const [showTaskAssignmentForm, setShowTaskAssignmentForm] = useState(false);

  const taskForm = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      deadline: null,
      assignee_id: "",
    },
  });

  const personalTaskForm = useForm<z.infer<typeof personalTaskSchema>>({
    resolver: zodResolver(personalTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      deadline: null,
    },
  });

  const assignTaskForm = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium", 
      deadline: null,
      assignee_id: "",
    },
  });

  // Check if current user has task permission
  useEffect(() => {
    if (user && user.enabled_modules) {
      const hasPermission = user.enabled_modules.includes("task");
      setHasTaskPermission(hasPermission);
      setShowTaskAssignmentForm(hasPermission);
    }
  }, [user]);

  // Fetch tasks assigned to current user and by current user
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        // Get tasks assigned to me
        const { data: assignedData, error: assignedError } = await supabase
          .from("tasks")
          .select(`
            *,
            users!tasks_assigner_id_fkey(id, full_name)
          `)
          .eq("assignee_id", user.id)
          .neq("assigner_id", user.id); // Exclude tasks I assigned to myself

        if (assignedError) throw assignedError;

        // Get personal tasks (where I'm both assigner and assignee)
        const { data: personalData, error: personalError } = await supabase
          .from("tasks")
          .select("*")
          .eq("assigner_id", user.id)
          .eq("assignee_id", user.id);

        if (personalError) throw personalError;
        
        // Get tasks assigned by me to others
        const { data: assignedByMeData, error: assignedByMeError } = await supabase
          .from("tasks")
          .select(`
            *,
            assignee:users!tasks_assignee_id_fkey(id, full_name)
          `)
          .eq("assigner_id", user.id)
          .neq("assignee_id", user.id); // Exclude tasks I assigned to myself

        if (assignedByMeError) throw assignedByMeError;

        // Format the assigned tasks
        const formattedAssignedTasks = (assignedData || []).map((task) => ({
          ...task,
          assigner_name: task.users?.full_name || "未知",
          priority: task.priority as "high" | "medium" | "low"
        }));

        // Format tasks assigned by me
        const formattedAssignedByMeTasks = (assignedByMeData || []).map((task) => ({
          ...task,
          assignee_name: task.assignee?.full_name || "未知",
          priority: task.priority as "high" | "medium" | "low"
        }));

        setAssignedTasks(formattedAssignedTasks as Task[]);
        setTasksAssignedByMe(formattedAssignedByMeTasks as Task[]);
        setPersonalTasks((personalData || []).map(task => ({
          ...task,
          priority: task.priority as "high" | "medium" | "low"
        })) as Task[]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("获取任务数据失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  // Fetch employees from the same department as the current user
  useEffect(() => {
    const fetchDepartmentEmployees = async () => {
      if (!user || !hasTaskPermission) return;

      try {
        // First get current user's department
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("department_id")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        if (!userData.department_id) {
          console.log("User has no department assigned");
          return;
        }

        // Then get all employees in that department
        const { data: employeesData, error: employeesError } = await supabase
          .from("users")
          .select("id, full_name, department_id")
          .eq("department_id", userData.department_id)
          .neq("id", user.id) // Exclude current user
          .order("full_name");

        if (employeesError) throw employeesError;
        setDepartmentEmployees(employeesData || []);
      } catch (error) {
        console.error("Error fetching department employees:", error);
        toast.error("获取部门员工列表失败");
      }
    };

    fetchDepartmentEmployees();
  }, [user, hasTaskPermission]);

  const onTaskFormSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from("tasks").insert({
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        deadline: values.deadline ? values.deadline.toISOString() : null,
        assigner_id: user.id,
        assignee_id: values.assignee_id,
      }).select().single();

      if (error) throw error;

      taskForm.reset();
      setIsTaskDialogOpen(false);
      toast.success("任务已分配");

      // Refresh the task list
      if (values.assignee_id === user.id) {
        if (data) {
          const typedNewTask = {
            ...data,
            priority: data.priority as "high" | "medium" | "low"
          };
          setPersonalTasks([typedNewTask as Task, ...personalTasks]);
        }
      } else {
        // Refresh assigned by me tasks
        const { data: newTaskData } = await supabase
          .from("tasks")
          .select(`
            *,
            assignee:users!tasks_assignee_id_fkey(id, full_name)
          `)
          .eq("id", data.id)
          .single();

        if (newTaskData) {
          const typedNewTask = {
            ...newTaskData,
            assignee_name: newTaskData.assignee?.full_name || "未知",
            priority: newTaskData.priority as "high" | "medium" | "low"
          };
          setTasksAssignedByMe([typedNewTask as Task, ...tasksAssignedByMe]);
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("创建任务失败");
    }
  };

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
        setPersonalTasks([typedNewTask as Task, ...personalTasks]);
      }
    } catch (error) {
      console.error("Error creating personal task:", error);
      toast.error("创建个人任务失败");
    }
  };

  const onAssignTaskFormSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from("tasks").insert({
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        deadline: values.deadline ? values.deadline.toISOString() : null,
        assigner_id: user.id,
        assignee_id: values.assignee_id,
        completed: false,
        completed_at: null
      }).select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, full_name)
      `).single();

      if (error) throw error;

      assignTaskForm.reset();
      toast.success("任务已成功分配");
      
      if (data) {
        const typedNewTask = {
          ...data,
          assignee_name: data.assignee?.full_name || "未知",
          priority: data.priority as "high" | "medium" | "low"
        };
        setTasksAssignedByMe([typedNewTask as Task, ...tasksAssignedByMe]);
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error("分配任务失败");
    }
  };

  const handleTaskComplete = async (task: Task, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", task.id);

      if (error) throw error;

      toast.success(completed ? "任务已完成" : "任务已重新打开");
      
      // Update local state
      if (task.assigner_id === user?.id && task.assignee_id === user?.id) {
        // Personal task
        setPersonalTasks(
          personalTasks.map((t) =>
            t.id === task.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
          )
        );
      } else if (task.assignee_id === user?.id) {
        // Assigned task
        setAssignedTasks(
          assignedTasks.map((t) =>
            t.id === task.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
          )
        );
      } else if (task.assigner_id === user?.id) {
        // Task assigned by me
        setTasksAssignedByMe(
          tasksAssignedByMe.map((t) =>
            t.id === task.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
          )
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("更新任务状态失败");
    }
  };

  const handleDeleteTask = async (taskId: string, taskType: 'personal' | 'assigned' | 'assignedByMe') => {
    if (!confirm("确定要删除此任务吗？")) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      toast.success("任务已删除");

      // Update local state based on task type
      switch (taskType) {
        case 'personal':
          setPersonalTasks(personalTasks.filter((t) => t.id !== taskId));
          break;
        case 'assigned':
          setAssignedTasks(assignedTasks.filter((t) => t.id !== taskId));
          break;
        case 'assignedByMe':
          setTasksAssignedByMe(tasksAssignedByMe.filter((t) => t.id !== taskId));
          break;
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("删除任务失败");
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
    <div className="space-y-6">
      {/* Task Assignment Form - Only show if user has task permission */}
      {showTaskAssignmentForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">发布任务</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...assignTaskForm}>
              <form onSubmit={assignTaskForm.handleSubmit(onAssignTaskFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={assignTaskForm.control}
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
                  
                  <FormField
                    control={assignTaskForm.control}
                    name="assignee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>指定员工</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择员工" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departmentEmployees.length > 0 ? (
                              departmentEmployees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.full_name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                没有可选择的同部门员工
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={assignTaskForm.control}
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
                  <FormField
                    control={assignTaskForm.control}
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
                  
                  <FormField
                    control={assignTaskForm.control}
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
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">发布任务</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Assigned By Me */}
        {hasTaskPermission && (
          <Card className="h-full">
            <CardHeader className="pb-2 space-y-0">
              <CardTitle>我发布的任务</CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : tasksAssignedByMe.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-muted-foreground">你还没有发布任何任务</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasksAssignedByMe.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "border rounded-md p-3",
                        task.completed ? "bg-muted/50" : ""
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
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
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                              分配给: {task.assignee_name}
                            </span>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded border",
                              task.completed 
                                ? "bg-green-100 text-green-800 border-green-300" 
                                : "bg-gray-100 text-gray-800 border-gray-300"
                            )}>
                              {task.completed ? "已完成" : "未完成"}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id, 'assignedByMe')}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Assigned Tasks */}
        <Card className="h-full">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle>我收到的任务</CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : assignedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">没有分配给你的任务</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTasks.map((task) => (
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
                            handleTaskComplete(task, checked as boolean)
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
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                              来自: {task.assigner_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Tasks */}
        <Card className="h-full md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle>个人待办</CardTitle>
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
          </CardHeader>
          <CardContent className="pb-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : personalTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">没有个人待办事项</p>
              </div>
            ) : (
              <div className="space-y-3">
                {personalTasks.map((task) => (
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
                            handleTaskComplete(task, checked as boolean)
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
                        onClick={() => handleDeleteTask(task.id, 'personal')}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskBoard;
