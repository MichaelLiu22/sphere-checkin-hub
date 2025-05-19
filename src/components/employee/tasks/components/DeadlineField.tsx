
/**
 * 截止日期选择器组件
 * 提供日期选择功能，允许用户通过日历界面设置任务截止日期
 * 与react-hook-form集成，支持表单验证
 */
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "../schemas/taskFormSchema";

interface DeadlineFieldProps {
  form: UseFormReturn<TaskFormValues>; // 表单控制对象
}

/**
 * 截止日期表单字段组件
 * @param {DeadlineFieldProps} props - 组件属性
 * @param {UseFormReturn<TaskFormValues>} props.form - 表单控制对象，用于绑定和控制表单字段
 * @returns {React.ReactElement} 渲染的表单字段组件
 */
export function DeadlineField({ form }: DeadlineFieldProps) {
  return (
    <FormField
      control={form.control}
      name="deadline"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>截止日期</FormLabel>
          <Popover>
            {/* 触发日历弹出的按钮 */}
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {/* 显示已选择的日期或占位文本 */}
                  {field.value ? (
                    format(field.value, "yyyy-MM-dd")
                  ) : (
                    <span>选择日期（可选）</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            {/* 日历弹出内容 */}
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
  );
}
