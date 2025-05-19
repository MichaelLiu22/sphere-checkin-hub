
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "../utils";

// 组件属性接口
export interface AssigneeFieldProps {
  form: any;
  isAdmin?: boolean;
  allEmployees: User[];
  departmentEmployees: User[];
}

/**
 * 任务接收者选择组件
 * 
 * @param {AssigneeFieldProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的接收者选择组件
 */
export const AssigneeField: React.FC<AssigneeFieldProps> = ({ 
  form, 
  isAdmin = false,
  allEmployees = [],
  departmentEmployees = []
}) => {
  const employees = isAdmin ? allEmployees : departmentEmployees;
  
  return (
    <FormField
      control={form.control}
      name="assignee_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>分配给</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="选择接收者" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  无可选员工
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
