
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import TaskBoard from "@/components/employee/TaskBoard";
import TaskArea from "@/components/TaskArea";
import FinanceArea from "@/components/FinanceArea";

/**
 * 员工仪表板组件
 * 根据用户权限展示不同的功能模块
 */
const EmployeeDashboard: React.FC = () => {
  // 多语言支持
  const { t } = useLanguage();
  // 路由导航
  const navigate = useNavigate();
  // 认证状态
  const { user, loading } = useAuth();
  // 活动标签管理
  const [activeTab, setActiveTab] = useState<string>("overview");

  /**
   * 组件加载时检查用户登录状态
   * 获取用户信息和权限
   */
  useEffect(() => {
    // 检查用户是否已登录
    if (!loading && !user) {
      navigate('/');
      return;
    }
  }, [user, loading, navigate]);

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
    return null;
  }

  /**
   * 检查用户是否有特定模块的权限
   * @param moduleName - 模块名称
   * @returns 是否有权限
   */
  const hasModulePermission = (moduleName: string): boolean => {
    if (!user || !user.enabled_modules) return false;
    return user.enabled_modules.includes(moduleName);
  };

  // 根据活动标签渲染对应的内容区域
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">欢迎, {user.full_name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium text-lg mb-2">您的模块权限</h3>
                {user.enabled_modules && user.enabled_modules.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {user.enabled_modules.includes("host_schedule") && (
                      <li>Host 排班</li>
                    )}
                    {user.enabled_modules.includes("finance") && (
                      <li>财务管理</li>
                    )}
                    {user.enabled_modules.includes("task") && (
                      <li>分配任务 (可分配任务给其他员工)</li>
                    )}
                    <li>当前任务 (所有员工默认权限)</li>
                  </ul>
                ) : (
                  <p className="text-gray-500">您目前没有特殊模块权限</p>
                )}
              </div>
            </div>
          </div>
        );
      case "tasks":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">当前任务</h2>
            <TaskBoard />
          </div>
        );
      case "host_schedule":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Host 排班</h2>
            <TaskArea userType={user.user_type || 'employee'} userId={user.id} />
          </div>
        );
      case "finance":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">财务管理</h2>
            <FinanceArea userId={user.id} />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">未知模块</h2>
            <p>该模块不存在或您没有权限访问。</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 h-screen">
          <EmployeeSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>
        <main className="flex-1 bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
