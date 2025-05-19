
/**
 * 任务优先级选择字段组件
 * 用于在任务表单中选择任务的优先级
 */
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "../schemas/taskFormSchema";

interface PriorityFieldProps {
  form: UseFormReturn<TaskFormValues>; // 表单控制对象
}

/**
 * 任务优先级选择字段组件
 * 提供高、中、低三级优先级选择
 * 
 * @param {PriorityFieldProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的表单字段组件
 */
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
            value={field.value}
            defaultValue={field.value || "medium"}
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
