
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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
import { CalendarIcon } from "lucide-react";
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
  assignee_name?: string;
}

interface TaskAssignmentFormProps {
  isAdmin: boolean;
  onTaskCreated: (task: Task) => void;
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

const TaskAssignmentForm: React.FC<TaskAssignmentFormProps> = ({ isAdmin, onTaskCreated }) => {
  const { user } = useAuth();
  const [departmentEmployees, setDepartmentEmployees] = React.useState<User[]>([]);
  const [allEmployees, setAllEmployees] = React.useState<User[]>([]);

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

  React.useEffect(() => {
    const fetchEmployees = async () => {
      if (!user) return;

      try {
        // For admin, fetch all employees
        if (isAdmin) {
          const { data: employeesData, error: employeesError } = await supabase
            .from("users")
            .select("id, full_name, department_id")
            .neq("id", user.id) // Exclude current user
            .order("full_name");

          if (employeesError) throw employeesError;
          setAllEmployees(employeesData || []);
        } else {
          // For regular users with task permission, fetch department users
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

          // Get all employees in the same department
          const { data: departmentData, error: deptError } = await supabase
            .from("users")
            .select("id, full_name, department_id")
            .eq("department_id", userData.department_id)
            .neq("id", user.id) // Exclude current user
            .order("full_name");

          if (deptError) throw deptError;
          setDepartmentEmployees(departmentData || []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("获取员工列表失败");
      }
    };

    fetchEmployees();
  }, [user, isAdmin]);

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
        onTaskCreated(typedNewTask as Task);
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error("分配任务失败");
    }
  };

  return (
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
                    {isAdmin ? (
                      allEmployees.length > 0 ? (
                        allEmployees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.full_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          没有可选择的员工
                        </SelectItem>
                      )
                    ) : (
                      departmentEmployees.length > 0 ? (
                        departmentEmployees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.full_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          没有可选择的同部门员工
                        </SelectItem>
                      )
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
  );
};

export default TaskAssignmentForm;
