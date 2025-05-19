
/**
 * 员工侧边栏组件
 * 提供员工仪表板的导航菜单
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Settings, Calendar, FileText, LogOut, ArrowLeft } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import TaskNotifications from "./tasks/TaskNotifications";

interface EmployeeSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * 员工侧边栏组件
 * 
 * @param {EmployeeSidebarProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的员工侧边栏
 */
const EmployeeSidebar: React.FC<EmployeeSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // 检查用户是否有任务权限
  const hasTaskPermission = user?.task_permission || user?.user_type === 'admin';

  return (
    <Sidebar>
      <SidebarHeader className="flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold">{t("employeeDashboard")}</h2>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              tooltip="Overview"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>概览</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
              tooltip="Tasks"
              className="flex justify-between"
            >
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>任务与团队</span>
              </div>
              <TaskNotifications className="h-4 w-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
              tooltip="Calendar"
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>日历</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              tooltip="Settings"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>设置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-sm text-muted-foreground mb-2">
          <div className="font-semibold">当前用户: {user?.full_name || "未登录"}</div>
          <div>部门: {user?.department_id ? "已分配" : "未分配"}</div>
          {hasTaskPermission && (
            <div className="text-green-600 font-medium">✓ 可发布任务</div>
          )}
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("logout")}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default EmployeeSidebar;
