
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

/**
 * 用户接口定义
 * 描述用户数据结构
 */
interface User {
  id: string;
  full_name: string;
  user_type?: string;
  enabled_modules?: string[] | null;
}

/**
 * 员工仪表板组件
 * 根据用户权限展示不同的功能模块
 */
const EmployeeDashboard: React.FC = () => {
  // 多语言支持
  const { t } = useLanguage();
  // 路由导航
  const navigate = useNavigate();
  // 用户状态管理
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 组件加载时检查用户登录状态
   * 获取用户信息和权限
   */
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
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem('user');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * 登出操作
   * 清除用户会话并重定向到首页
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success(t("logoutSuccess"));
    navigate('/');
  };

  /**
   * 检查用户是否有特定模块的权限
   * @param moduleName - 模块名称
   * @returns 是否有权限
   */
  const hasModulePermission = (moduleName: string): boolean => {
    if (!user || !user.enabled_modules) return false;
    return user.enabled_modules.includes(moduleName);
  };

  // 显示加载状态
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          {t("loading")}...
        </div>
      </Layout>
    );
  }

  // 如果用户未登录，重定向到登录页面
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
            {/* 任务区域 - 仅当有host_schedule权限时显示 */}
            {hasModulePermission("host_schedule") && (
              <div className="md:col-span-7">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      {t("taskArea")} - Host日历
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TaskArea userType={user.user_type || 'employee'} userId={user.id} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 财务区域 - 仅当有finance权限时显示 */}
            {hasModulePermission("finance") && (
              <div className={`md:col-span-${hasModulePermission("host_schedule") ? "5" : "12"}`}>
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
            )}

            {/* 无权限提示 */}
            {(!hasModulePermission("host_schedule") && !hasModulePermission("finance")) && (
              <div className="md:col-span-12">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      等待授权
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        您的账户目前没有分配任何功能模块的权限。请联系管理员为您分配相应权限。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
