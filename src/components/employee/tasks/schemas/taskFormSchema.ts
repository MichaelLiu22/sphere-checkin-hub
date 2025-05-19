
import * as z from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, { message: "标题不能为空" }),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "请选择优先级",
  }),
  deadline: z.date().optional().nullable(),
  assignee_id: z.string().min(1, { message: "请选择分配对象" }),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
