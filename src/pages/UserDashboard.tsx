
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import UserSidebar from "@/components/user/UserSidebar";
import DailyTasks from "@/components/DailyTasks";
import WeeklyGoals from "@/components/WeeklyGoals";
import WorkHours from "@/components/WorkHours";
import DocumentUpload from "@/components/DocumentUpload";
import FinanceArea from "@/components/FinanceArea";

interface File {
  id: string;
  name: string;
  description: string;
  file_type: 'pre' | 'regular';
  file_url: string;
  created_at: string;
}

const UserDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      fetchFiles();
    }
  }, [user, navigate]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Cast the file_type to the expected type
        const typedFiles = data.map(file => ({
          ...file,
          file_type: file.file_type as 'pre' | 'regular'
        }));
        setFiles(typedFiles);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const preFiles = files.filter(file => file.file_type === "pre");
  const regularFiles = files.filter(file => file.file_type === "regular");
  const enabledModules = user?.enabled_modules || [];
  
  // Function to render the active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "host_schedule":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Host 日历</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkHours userId={user?.id} />
            </CardContent>
          </Card>
        );
      case "finance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>财务管理</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUpload />
              <div className="mt-6">
                <FinanceArea userId={user?.id || ''} />
              </div>
            </CardContent>
          </Card>
        );
      case "overview":
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold">今日任务</CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyTasks userId={user?.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold">本周目标</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeeklyGoals userId={user?.id} />
                </CardContent>
              </Card>
            </div>

            {/* Files section */}
            <div className="space-y-6">
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
                        <div key={file.id} className="flex justify-between items-center p-4 border rounded-lg">
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
                        <div key={file.id} className="flex justify-between items-center p-4 border rounded-lg">
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{
                  activeTab === "overview" ? "用户仪表板" : 
                  activeTab === "host_schedule" ? "Host 日历" : 
                  activeTab === "finance" ? "财务管理" : "用户仪表板"
                }</h1>
              </div>
              
              {renderActiveTabContent()}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default UserDashboard;
