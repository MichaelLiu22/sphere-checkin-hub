
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
}

interface WeeklyGoalsProps {
  userId: string;
}

const WeeklyGoals: React.FC<WeeklyGoalsProps> = ({ userId }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyGoals = async () => {
      try {
        // 这里模拟数据，实际应用中应该从数据库获取
        const dummyGoals = [
          {
            id: "1",
            title: "内容创作",
            progress: 3,
            target: 5
          },
          {
            id: "2",
            title: "客户沟通",
            progress: 8,
            target: 10
          },
          {
            id: "3",
            title: "项目完成",
            progress: 1,
            target: 2
          }
        ];
        
        setGoals(dummyGoals);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching goals:", error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchWeeklyGoals();
    }
  }, [userId]);

  if (loading) {
    return <div className="py-4 text-center">加载中...</div>;
  }

  if (goals.length === 0) {
    return <div className="py-4 text-center">本周暂无目标</div>;
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const percentage = Math.round((goal.progress / goal.target) * 100);
        
        return (
          <div key={goal.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{goal.title}</span>
              <span className="text-sm text-gray-500">
                {goal.progress} / {goal.target} ({percentage}%)
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyGoals;
