
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "@/components/Layout";
import W9FilesPanel from "@/components/admin/W9FilesPanel";
import FileUploadPanel from "@/components/admin/FileUploadPanel";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import PermissionConfigPanel from "@/components/admin/PermissionConfigPanel";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
 * 管理员仪表板页面组件
 * 
 * 提供管理员功能，包括W9文件管理、文件上传、用户管理和权限配置
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
  
  return (
    <Layout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* 侧边栏导航 */}
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* 主要内容区域 */}
          <div className="flex-1 flex flex-col">
            {/* 顶部标题栏 */}
            <div className="border-b p-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
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
              {/* 添加新的权限配置面板 */}
              {activeTab === "permissions" && <PermissionConfigPanel />}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default AdminDashboard;
