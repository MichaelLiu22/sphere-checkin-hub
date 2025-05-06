
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Download, ClipboardList, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import TaskArea from "@/components/TaskArea";
import FinanceArea from "@/components/FinanceArea";

interface User {
  id: string;
  full_name: string;
  user_type?: 'warehouse' | 'influencer' | 'finance' | string;
}

const EmployeeDashboard: React.FC = () => {
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
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem('user');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success(t("logoutSuccess"));
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          {t("loading")}...
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-border sticky top-0 z-10">
          <div className="container py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-dark">
              {t("employeeDashboard")}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {t("welcomeUser", { name: user.full_name })}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Task Area */}
            <div className="md:col-span-7">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    {t("taskArea")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskArea userType={user.user_type || 'warehouse'} userId={user.id} />
                </CardContent>
              </Card>
            </div>

            {/* Finance Area */}
            <div className="md:col-span-5">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t("financeArea")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FinanceArea userId={user.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
