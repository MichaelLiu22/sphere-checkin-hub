
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "../schemas/taskFormSchema";
import { User } from "../utils";

interface AssigneeFieldProps {
  form: UseFormReturn<TaskFormValues>;
  isAdmin: boolean;
  allEmployees: User[];
  departmentEmployees: User[];
}

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
  );
}
