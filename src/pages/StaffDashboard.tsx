
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * 员工仪表板页面组件
 * 
 * 为员工用户显示其个人信息和功能特性
 */
const StaffDashboard: React.FC = () => {
  // 从认证上下文获取用户信息和登出功能
  const { user, logout } = useAuth();
  // 获取翻译功能
  const { t } = useLanguage();

  // 如果没有用户数据，不渲染任何内容
  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* 页面标题和退出按钮 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </div>

        {/* 卡片网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 用户档案卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 用户信息显示区域 */}
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-lg">{user.full_name}</p>
                  <p className="text-muted-foreground capitalize">{user.user_type}</p>
                </div>
              </div>
              
              {/* 功能特性显示区域 */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium">Feature Assignment:</p>
                <p className="text-lg font-semibold mt-1">
                  {user.feature || "No feature assigned"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 功能信息卡片 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Feature Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user.feature ? (
                // 如果用户已分配功能特性，显示相关信息
                <div>
                  <p>You are assigned to: <strong>{user.feature}</strong></p>
                  <p className="mt-4">
                    This section will display content relevant to your assigned feature.
                  </p>
                </div>
              ) : (
                // 如果用户未分配功能特性，显示通知
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't been assigned any feature yet.</p>
                  <p>Please contact your administrator for feature assignment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
