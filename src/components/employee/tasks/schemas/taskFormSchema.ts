
/**
 * 任务表单验证模式
 * 定义任务表单的数据结构和验证规则
 */
import * as z from "zod";

/**
 * 任务表单验证模式
 * 使用zod定义表单的字段类型和验证规则
 */
export const taskFormSchema = z.object({
  // 任务标题，不能为空
  title: z.string().min(1, { message: "标题不能为空" }),
  
  // 任务描述，可选
  description: z.string().optional(),
  
  // 任务优先级，必须是high/medium/low之一
  priority: z.enum(["high", "medium", "low"], {
    required_error: "请选择优先级",
  }),
  
  // 截止日期，可选，允许为null
  deadline: z.date().optional().nullable(),
  
  // 完成状态
  completed: z.boolean().default(false),
  
  // 接收者ID
  assignee_id: z.string().optional(),
  
  // 多人任务的接收者ID数组
  assignee_ids: z.array(z.string()).optional(),
  
  // 重复类型
  repeat_type: z.string().default('never'),
  
  // 重复间隔
  repeat_interval: z.number().default(1),
});

// 导出任务表单值的TypeScript类型，基于上面的zod模式
export type TaskFormValues = z.infer<typeof taskFormSchema>;
