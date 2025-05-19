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
import TaskReportPanel from "@/components/admin/TaskReportPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import TaskAssignmentForm from "@/components/employee/tasks/TaskAssignmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  // 新建任务状态
  const [newTask, setNewTask] = useState<any>(null);
  // 显示任务分配表单
  const [showTaskAssignmentForm, setShowTaskAssignmentForm] = useState(false);

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

  /**
   * 检查用户是否可以分配任务
   * 条件：是管理员或拥有task模块权限
   */
  const canAssignTasks = (): boolean => {
    return user?.user_type === 'admin' || user?.task_permission === true || hasModulePermission('task');
  };

  // 处理任务创建
  const handleTaskCreated = (task: any) => {
    setNewTask(task);
    toast.success("任务已成功发布");
    setShowTaskAssignmentForm(false);
  };

  // 根据活动标签渲染对应的内容区域
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">欢迎, {user.full_name}</h2>
              {canAssignTasks() && (
                <Button onClick={() => setShowTaskAssignmentForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  发布新任务
                </Button>
              )}
            </div>
            
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
                    {(user.enabled_modules.includes("task") || user.task_permission) && (
                      <li>分配任务 (可分配任务给其他员工)</li>
                    )}
                    <li>当前任务 (所有员工默认权限)</li>
                  </ul>
                ) : (
                  <p className="text-gray-500">您目前没有特殊模块权限</p>
                )}
              </div>
            </div>
            
            {/* 任务发布区域 - 只对有task权限的用户显示 */}
            {canAssignTasks() && showTaskAssignmentForm && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg">发布新任务</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskAssignmentForm 
                    isAdmin={user.user_type === 'admin'} 
                    onTaskCreated={handleTaskCreated}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        );
      case "tasks":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">任务与团队</h2>
              {canAssignTasks() && (
                <Button onClick={() => setShowTaskAssignmentForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  发布新任务
                </Button>
              )}
            </div>
            <TaskBoard canAssignTasks={canAssignTasks()} isAdmin={user.user_type === 'admin'} />
            
            {/* 任务发布表单弹窗 */}
            {canAssignTasks() && showTaskAssignmentForm && (
              <Card className="mt-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">发布新任务</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowTaskAssignmentForm(false)}
                  >
                    关闭
                  </Button>
                </CardHeader>
                <CardContent>
                  <TaskAssignmentForm 
                    isAdmin={user.user_type === 'admin'} 
                    onTaskCreated={handleTaskCreated}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        );
      case "tasks_report":
        return (
          <div className="p-6">
            <TaskReportPanel />
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
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <aside className="sticky top-0 h-screen">
            <EmployeeSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>
          <main className="flex-1 bg-gray-50">
            {renderContent()}
          </main>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default EmployeeDashboard;
