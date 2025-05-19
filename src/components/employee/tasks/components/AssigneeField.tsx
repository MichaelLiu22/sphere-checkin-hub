
/**
 * 任务接收者选择字段组件
 * 用于在任务表单中选择任务的接收者
 */
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "../schemas/taskFormSchema";
import { User } from "../utils";

interface AssigneeFieldProps {
  form: UseFormReturn<TaskFormValues>; // 表单控制对象
  isAdmin: boolean;                    // 是否为管理员
  allEmployees: User[];                // 所有员工列表
  departmentEmployees: User[];         // 部门内员工列表
}

/**
 * 任务接收者选择字段组件
 * 
 * @param {AssigneeFieldProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的表单字段组件
 */
export function AssigneeField({ 
  form, 
  isAdmin, 
  allEmployees, 
  departmentEmployees 
}: AssigneeFieldProps) {
  return (
    <FormField
      control={form.control}
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
              {/* 管理员可以看到所有员工 */}
              {isAdmin ? (
                allEmployees.length > 0 ? (
                  allEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_employees" disabled>
                    没有可选择的员工
                  </SelectItem>
                )
              ) : (
                // 普通用户只能看到部门内员工
                departmentEmployees.length > 0 ? (
                  departmentEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_dept_employees" disabled>
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
  );
}
