
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Clock, ListTodo } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DailyTasks from "@/components/DailyTasks";
import WeeklyGoals from "@/components/WeeklyGoals";
import WorkHours from "@/components/WorkHours";

interface User {
  id: string;
  full_name: string;
}

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/');
      return;
    }

    try {
      const userData = JSON.parse(userJson);
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem('user');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("成功登出");
    navigate('/');
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">正在加载...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-dark">
            {t("userDashboard")}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              欢迎, {user?.full_name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              登出
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">
                <div className="flex items-center">
                  <ListTodo className="mr-2" />
                  今日任务
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyTasks userId={user?.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">
                <div className="flex items-center">
                  <Calendar className="mr-2" />
                  本周目标
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyGoals userId={user?.id} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">
              <div className="flex items-center">
                <Clock className="mr-2" />
                工作时间
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkHours userId={user?.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
