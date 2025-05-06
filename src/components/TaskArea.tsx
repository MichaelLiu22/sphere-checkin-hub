
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckSquare, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TaskAreaProps {
  userType: string;
  userId: string;
}

const TaskArea: React.FC<TaskAreaProps> = ({ userType, userId }) => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply styles conditionally based on user type
  const getTaskAreaStyles = () => {
    switch(userType) {
      case 'influencer':
        return "border-l-4 border-blue-500";
      case 'finance':
        return "border-l-4 border-green-500";
      case 'warehouse':
      default:
        return "border-l-4 border-amber-500";
    }
  };

  useEffect(() => {
    // In a real application, this would fetch tasks from the database
    // Here we'll simulate different tasks based on userType
    const mockTasks = getMockTasksForUserType(userType);
    setTasks(mockTasks);
    setLoading(false);
  }, [userType, userId]);

  const getMockTasksForUserType = (type: string) => {
    switch(type) {
      case 'influencer':
        return [
          { id: 1, title: t("postContentSchedule"), description: t("postContentScheduleDesc"), deadline: "2025-05-10", completed: false },
          { id: 2, title: t("productReview"), description: t("productReviewDesc"), deadline: "2025-05-12", completed: true },
          { id: 3, title: t("socialMediaEngagement"), description: t("socialMediaEngagementDesc"), deadline: "2025-05-07", completed: false },
        ];
      case 'finance':
        return [
          { id: 1, title: t("processInvoices"), description: t("processInvoicesDesc"), deadline: "2025-05-08", completed: false },
          { id: 2, title: t("expenseReports"), description: t("expenseReportsDesc"), deadline: "2025-05-11", completed: true },
          { id: 3, title: t("payrollProcessing"), description: t("payrollProcessingDesc"), deadline: "2025-05-15", completed: false },
        ];
      case 'warehouse':
      default:
        return [
          { id: 1, title: t("inventoryCheck"), description: t("inventoryCheckDesc"), deadline: "2025-05-07", completed: true },
          { id: 2, title: t("packagePreparation"), description: t("packagePreparationDesc"), deadline: "2025-05-08", completed: false },
          { id: 3, title: t("loadingSchedule"), description: t("loadingScheduleDesc"), deadline: "2025-05-09", completed: false },
        ];
    }
  };

  // Toggle task completed status
  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 bg-background rounded-md ${getTaskAreaStyles()}`}>
        <h3 className="text-lg font-medium mb-2">
          {userType === 'influencer' && t("influencerTasks")}
          {userType === 'finance' && t("financeTasks")}
          {(userType === 'warehouse' || !userType) && t("warehouseTasks")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {userType === 'influencer' && t("influencerTasksDesc")}
          {userType === 'finance' && t("financeTasksDesc")}
          {(userType === 'warehouse' || !userType) && t("warehouseTasksDesc")}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-4">
          {t("loading")}...
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className={task.completed ? "opacity-70" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskStatus(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`task-${task.id}`}
                      className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {t("deadline")}: {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              {t("noTasksFound")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskArea;
