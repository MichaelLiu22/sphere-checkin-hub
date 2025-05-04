
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface WorkDay {
  date: string;
  hours: number;
  notes?: string;
}

interface WorkHoursProps {
  userId: string;
}

const WorkHours: React.FC<WorkHoursProps> = ({ userId }) => {
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchWorkHours = async () => {
      try {
        // 生成本周的日期
        const today = new Date();
        const startDay = startOfWeek(today, { weekStartsOn: 1 }); // 从周一开始
        
        // 模拟数据，实际应用中应该从数据库获取
        const dummyWorkDays: WorkDay[] = [];
        let total = 0;
        
        for (let i = 0; i < 7; i++) {
          const currentDate = addDays(startDay, i);
          const formattedDate = format(currentDate, 'yyyy-MM-dd');
          const isWeekend = i === 5 || i === 6; // 周六和周日
          const isToday = format(today, 'yyyy-MM-dd') === formattedDate;
          const isFuture = currentDate > today;
          
          // 周末不安排工作，未来日期还没有记录
          let hours = 0;
          if (!isWeekend && !isFuture) {
            hours = Math.floor(Math.random() * 4) + 5; // 5-8小时的随机工作时间
            total += hours;
          }
          
          dummyWorkDays.push({
            date: formattedDate,
            hours: hours,
            notes: isToday ? "今日工作" : undefined
          });
        }
        
        setWorkDays(dummyWorkDays);
        setTotalHours(total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching work hours:", error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchWorkHours();
    }
  }, [userId]);

  if (loading) {
    return <div className="py-4 text-center">加载中...</div>;
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    return `${format(date, 'MM/dd')} (周${dayOfWeek})`;
  };

  return (
    <div>
      <div className="mb-4 text-right">
        <span className="font-semibold">本周总工时: {totalHours} 小时</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {workDays.map((workDay) => (
          <Card key={workDay.date} className={workDay.notes ? "border-blue-200 bg-blue-50" : ""}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{formatDisplayDate(workDay.date)}</span>
                {workDay.notes && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {workDay.notes}
                  </span>
                )}
              </div>
              <p className="text-xl font-bold">
                {workDay.hours > 0 ? `${workDay.hours} 小时` : "无工作记录"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkHours;
