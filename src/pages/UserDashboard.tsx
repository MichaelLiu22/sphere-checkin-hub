
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DailyTasks from "@/components/DailyTasks";
import WeeklyGoals from "@/components/WeeklyGoals";
import WorkHours from "@/components/WorkHours";

interface User {
  id: string;
  full_name: string;
}

const UserDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否已登录
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/');
      return;
    }

    try {
      const userData = JSON.parse(userJson);
      setUser(userData);
      fetchFiles();
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

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const preFiles = files.filter(file => file.file_type === "pre");
  const regularFiles = files.filter(file => file.file_type === "regular");

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
                工作时间
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkHours userId={user?.id} />
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("preFiles")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>{t("loading")}</p>
              ) : preFiles.length === 0 ? (
                <p>{t("noFilesFound")}</p>
              ) : (
                <div className="space-y-4">
                  {preFiles.map((file) => (
                    <Card key={file.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{file.name}</h3>
                            <p className="text-sm text-gray-500">{file.description}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2" size={16} />
                              {t("download")}
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("regularFiles")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>{t("loading")}</p>
              ) : regularFiles.length === 0 ? (
                <p>{t("noFilesFound")}</p>
              ) : (
                <div className="space-y-4">
                  {regularFiles.map((file) => (
                    <Card key={file.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{file.name}</h3>
                            <p className="text-sm text-gray-500">{file.description}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2" size={16} />
                              {t("download")}
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
