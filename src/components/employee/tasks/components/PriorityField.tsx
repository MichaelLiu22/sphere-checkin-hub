
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "../schemas/taskFormSchema";

interface PriorityFieldProps {
  form: UseFormReturn<TaskFormValues>;
}

export function PriorityField({ form }: PriorityFieldProps) {
  return (
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
              <SelectItem value="high">紧急</SelectItem>
              <SelectItem value="medium">一般</SelectItem>
              <SelectItem value="low">宽松</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
