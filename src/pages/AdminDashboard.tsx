/**
 * 管理员仪表板页面
 * 提供管理员功能，包括任务管理、W9文件管理、用户管理、权限配置等
 */
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "@/components/Layout";
import W9FilesPanel from "@/components/admin/W9FilesPanel";
import FileUploadPanel from "@/components/admin/FileUploadPanel";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import PermissionConfigPanel from "@/components/admin/PermissionConfigPanel";
import ExcelCleanerPanel from "@/components/admin/ExcelCleanerPanel";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskBoard from "@/components/employee/TaskBoard";
import TaskAssignmentForm from "@/components/employee/tasks/TaskAssignmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

/**
 * 用户接口定义
 * 包含用户的详细信息和权限
 */
interface User {
  id: string;
  full_name: string;
  user_type: string;
  upload_permission: boolean;
  task_permission: boolean;
  notes: string | null;
  created_at: string;
}

/**
 * 模块内容占位符组件
 * 为未开发的功能提供占位符显示
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.title - 模块标题
 * @returns {React.ReactElement} 渲染的占位符UI
 */
const ModuleContentPlaceholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg border border-dashed">
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">此模块功能函数正在进行开发测试，请稍作等待</p>
    </div>
  );
};

/**
 * 管理员仪表板页面组件
 * 
 * 提供管理员功能，包括W9文件管理、文件上传、用户管理和权限配置
 * @returns {React.ReactElement} 渲染的管理员仪表板页面
 */
const AdminDashboard: React.FC = () => {
  // 用户管理面板状态
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // 获取登出功能
  const { logout } = useAuth();
  
  // 活动选项卡/面板状态
  const [activeTab, setActiveTab] = useState<string>("w9");
  
  // 任务表单显示状态
  const [showTaskAssignmentForm, setShowTaskAssignmentForm] = useState(false);
  
  // 新建任务状态
  const [newTask, setNewTask] = useState<any>(null);
  
  // 组件加载时获取用户数据
  useEffect(() => {
    fetchUsers();
  }, []);
  
  /**
   * 从数据库获取用户数据
   */
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      // 获取所有用户
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (userError) throw userError;
      
      // 过滤未分配的用户
      const unassigned = userData?.filter(user => user.user_type === 'unassigned') || [];
      
      setAllUsers(userData || []);
      setUnassignedUsers(unassigned);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };
  
  /**
   * 处理新任务创建
   */
  const handleTaskCreated = (task: any) => {
    setNewTask(task);
    toast.success("任务已成功发布");
    setShowTaskAssignmentForm(false);
  };
  
  return (
    <Layout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* 侧边栏导航 */}
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* 主要内容区域 */}
          <div className="flex-1 flex flex-col">
            {/* 顶部标题栏 */}
            <div className="border-b p-4">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            
            {/* 内容面板，根据活动选项卡显示不同面板 */}
            <div className="flex-1 p-6 overflow-auto">
              {activeTab === "w9" && <W9FilesPanel />}
              {activeTab === "upload" && <FileUploadPanel allUsers={allUsers} />}
              {activeTab === "users" && (
                <UserManagementPanel 
                  fetchUsers={fetchUsers}
                />
              )}
              {activeTab === "permissions" && <PermissionConfigPanel />}
              
              {/* 任务管理组件，与员工视图相同的功能 */}
              {activeTab === "tasks" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">任务管理</h2>
                    <Button onClick={() => setShowTaskAssignmentForm(true)} className="flex items-center gap-2">
                      <Plus className="mr-2 h-4 w-4" />
                      发布新任务
                    </Button>
                  </div>
                  <TaskBoard canAssignTasks={true} isAdmin={true} />
                </>
              )}
              
              {activeTab === "finance" && (
                <ExcelCleanerPanel />
              )}
              {activeTab === "calendar" && (
                <ModuleContentPlaceholder title="日程安排" />
              )}
            </div>
            
            {/* 任务发布表单弹窗 */}
            <Dialog.Root open={showTaskAssignmentForm} onOpenChange={setShowTaskAssignmentForm}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] z-50 bg-white rounded-lg shadow-lg">
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
                      isAdmin={true} 
                      onTaskCreated={handleTaskCreated}
                    />
                  </CardContent>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default AdminDashboard;
