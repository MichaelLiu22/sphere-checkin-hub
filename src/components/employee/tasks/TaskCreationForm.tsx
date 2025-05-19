
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "./utils";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Import attachment uploader
import AttachmentUploader from "./AttachmentUploader";

interface TaskCreationFormProps {
  onTaskCreated: (newTask: any) => void;
  isAdmin: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isPersonalTask?: boolean;
  defaultAssigneeIds?: string[];
}

const taskSchema = z.object({
  title: z.string().min(1, { message: "标题不能为空" }),
  description: z.string().optional(),
  assignee_ids: z.array(z.string()).min(1, { message: "请至少选择一个接收者" }),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "请选择优先级",
  }),
  deadline: z.date().optional().nullable(),
  repeat_type: z.enum(["none", "daily", "weekly", "monthly", "custom"], {
    required_error: "请选择重复类型",
  }),
  repeat_interval: z.number().optional().nullable(),
});

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  onTaskCreated,
  isAdmin,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  isPersonalTask = false,
  defaultAssigneeIds = []
}) => {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [departmentEmployees, setDepartmentEmployees] = useState<User[]>([]);
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Support both controlled and uncontrolled mode
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  // Setup form with default values
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee_ids: defaultAssigneeIds,
      priority: "medium",
      deadline: null,
      repeat_type: "none",
      repeat_interval: null,
    },
  });

  // 每当defaultAssigneeIds改变时更新表单的assignee_ids值
  useEffect(() => {
    if (defaultAssigneeIds.length > 0) {
      form.setValue("assignee_ids", defaultAssigneeIds);
    }
  }, [defaultAssigneeIds, form]);

  // 加载员工列表
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user) return;

      try {
        // 管理员可以看到所有员工
        if (isAdmin) {
          const { data: employeesData, error: employeesError } = await supabase
            .from("users")
            .select("id, full_name, department_id")
            .order("full_name");

          if (employeesError) throw employeesError;
          setAllEmployees(employeesData || []);
        } else {
          // 普通有任务权限的员工只能看到同部门员工
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

          // 获取同部门的所有员工
          const { data: departmentData, error: deptError } = await supabase
            .from("users")
            .select("id, full_name, department_id")
            .eq("department_id", userData.department_id)
            .order("full_name");

          if (deptError) throw deptError;
          setDepartmentEmployees(departmentData || []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("获取员工列表失败");
      }
    };

    if (open && !isPersonalTask) {
      fetchEmployees();
    }
  }, [user, isAdmin, open, isPersonalTask]);

  // 处理表单提交
  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);

    try {
      // 确保任务数据格式正确
      const taskData: any = {
        title: values.title,
        description: values.description || null,
        assigner_id: user.id,
        assignee_ids: values.assignee_ids,
        deadline: values.deadline ? values.deadline.toISOString() : null,
        priority: values.priority,
        repeat_type: values.repeat_type,
        repeat_interval: values.repeat_interval,
        completed: false,
        completed_by: {},
        attachments: attachments,
        department_id: user.department_id
      };

      // 如果只选择了一个接收者，同时设置 assignee_id 字段以兼容旧代码
      if (values.assignee_ids.length === 1) {
        taskData.assignee_id = values.assignee_ids[0];
      } else {
        taskData.assignee_id = null; // Explicitly set to null for multiple assignees
      }

      // 创建任务
      const { data, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select(`
          *,
          assignee:users!tasks_assignee_id_fkey(id, full_name)
        `)
        .single();

      if (error) throw error;

      toast.success("任务已成功创建");
      form.reset();
      setAttachments([]);
      setOpen(false);
      
      // 通知父组件任务已创建
      if (data) {
        onTaskCreated({
          ...data,
          assignee_name: data.assignee?.full_name || "未知"
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("创建任务失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理选择员工
  const handleSelectEmployee = (employeeId: string) => {
    const currentAssignees = form.getValues("assignee_ids");
    
    if (currentAssignees.includes(employeeId)) {
      // 移除员工
      form.setValue(
        "assignee_ids", 
        currentAssignees.filter(id => id !== employeeId)
      );
    } else {
      // 添加员工
      form.setValue(
        "assignee_ids", 
        [...currentAssignees, employeeId]
      );
    }
  };

  // 获取员工名称
  const getEmployeeName = (id: string): string => {
    const employees = isAdmin ? allEmployees : departmentEmployees;
    const employee = employees.find(e => e.id === id);
    return employee?.full_name || "未知";
  };

  // 选择的接收者列表
  const selectedAssignees = form.watch("assignee_ids");
  const repeatingType = form.watch("repeat_type");

  // 如果是个人任务，则不显示选择接收者的输入项
  const isPersonalTaskWithDefaultUser = isPersonalTask && defaultAssigneeIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>创建任务</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isPersonalTask ? "创建个人待办" : "创建新任务"}</DialogTitle>
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
                    <Textarea
                      placeholder="输入任务详情描述（可选）"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 选择接收者 - 只在非个人任务时显示 */}
            {!isPersonalTaskWithDefaultUser && (
              <FormField
                control={form.control}
                name="assignee_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>选择接收者</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {selectedAssignees.map(id => (
                            <Badge key={id} variant="secondary" className="px-2 py-1">
                              {getEmployeeName(id)}
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => handleSelectEmployee(id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                          {selectedAssignees.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                              请选择至少一名接收者
                            </div>
                          )}
                        </div>
                        <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto">
                          <div className="space-y-2">
                            {(isAdmin ? allEmployees : departmentEmployees).map(employee => (
                              <div 
                                key={employee.id}
                                className={cn(
                                  "flex items-center p-2 rounded-md cursor-pointer hover:bg-muted",
                                  selectedAssignees.includes(employee.id) && "bg-muted"
                                )}
                                onClick={() => handleSelectEmployee(employee.id)}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAssignees.includes(employee.id)}
                                  onChange={() => {}}
                                  className="mr-2"
                                />
                                <span>{employee.full_name}</span>
                              </div>
                            ))}
                            {(isAdmin ? allEmployees : departmentEmployees).length === 0 && (
                              <div className="p-2 text-sm text-muted-foreground">
                                没有可选择的员工
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                        <SelectItem value="high" className="text-red-600">紧急</SelectItem>
                        <SelectItem value="medium" className="text-yellow-600">一般</SelectItem>
                        <SelectItem value="low" className="text-green-600">宽松</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="repeat_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>重复设置</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择重复类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">不重复</SelectItem>
                        <SelectItem value="daily">每天</SelectItem>
                        <SelectItem value="weekly">每周</SelectItem>
                        <SelectItem value="monthly">每月</SelectItem>
                        <SelectItem value="custom">自定义</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {repeatingType === "custom" && (
                <FormField
                  control={form.control}
                  name="repeat_interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>间隔天数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="输入天数"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="border-t pt-4">
              <FormLabel className="block mb-2">附件</FormLabel>
              <AttachmentUploader 
                onUploadComplete={(urls) => setAttachments(urls)} 
                existingAttachments={attachments}
              />
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "创建中..." : isPersonalTask ? "添加待办" : "创建任务"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreationForm;
