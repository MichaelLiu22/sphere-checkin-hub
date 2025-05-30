
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { User } from "../utils";

interface AssigneeFieldProps {
  form: UseFormReturn<any, any>;
  isAdmin: boolean;
  allEmployees: User[];
  departmentEmployees: User[];
}

export const AssigneeField = ({ 
  form, 
  isAdmin, 
  allEmployees, 
  departmentEmployees 
}: AssigneeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="assignee_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>任务接收人</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="选择接收人" />
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
                  <SelectItem value="no-employees-available" disabled>
                    没有可用的员工
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
                  <SelectItem value="no-dept-employees-available" disabled>
                    部门中没有可用的员工
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
};
