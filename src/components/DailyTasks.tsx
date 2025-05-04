
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface DailyTasksProps {
  userId: string;
}

const DailyTasks: React.FC<DailyTasksProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyTasks = async () => {
      try {
        // 这里模拟数据，实际应用中应该从数据库获取
        const dummyTasks = [
          {
            id: "1",
            title: "完成日常报告",
            description: "准备并提交每日工作总结",
            completed: false
          },
          {
            id: "2",
            title: "客户会议",
            description: "与新客户进行视频会议",
            completed: true
          },
          {
            id: "3",
            title: "数据分析",
            description: "分析上周的销售数据",
            completed: false
          }
        ];
        
        setTasks(dummyTasks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchDailyTasks();
    }
  }, [userId]);

  if (loading) {
    return <div className="py-4 text-center">加载中...</div>;
  }

  if (tasks.length === 0) {
    return <div className="py-4 text-center">今日暂无任务</div>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="p-3 border rounded-md">
          <div className="flex items-start">
            <div className={`mt-1 w-3 h-3 rounded-full mr-3 ${task.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div>
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyTasks;
