
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, Upload, Users, ArrowLeft, Settings, Calendar, DollarSign, CheckSquare } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

/**
 * 侧边栏属性接口
 * 控制侧边栏的活动选项卡和状态
 */
interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * 管理员侧边栏组件
 * 提供管理员仪表板的导航菜单
 * 
 * @param {AdminSidebarProps} 组件属性
 * @returns {React.ReactElement} 渲染的组件
 */
const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  // 多语言支持
  const { t } = useLanguage();
  // 路由导航
  const navigate = useNavigate();
  // 获取用户信息
  const { user, logout } = useAuth();

  /**
   * 登出操作
   * 清除用户会话并重定向到首页
   */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold">{t("adminDashboard")}</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "w9"}
              onClick={() => setActiveTab("w9")}
              tooltip="W9 Files"
            >
              <FileText className="mr-2" />
              <span>📄 W9</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "upload"}
              onClick={() => setActiveTab("upload")}
              tooltip="Upload Files"
            >
              <Upload className="mr-2" />
              <span>📤 上传文件</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "users"}
              onClick={() => setActiveTab("users")}
              tooltip="User Management"
            >
              <Users className="mr-2" />
              <span>👥 用户管理</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* 权限配置选项卡 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "permissions"}
              onClick={() => setActiveTab("permissions")}
              tooltip="Permission Configuration"
            >
              <Settings className="mr-2" />
              <span>🔑 权限配置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* 管理员可访问的所有模块 */}
          <SidebarMenuItem>
            <h3 className="px-4 py-2 text-xs font-medium text-muted-foreground">模块功能</h3>
          </SidebarMenuItem>
          
          {/* 任务模块 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
              tooltip="Task Management"
            >
              <CheckSquare className="mr-2" />
              <span>📋 任务管理</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* 财务模块 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "finance"}
              onClick={() => setActiveTab("finance")}
              tooltip="Finance"
            >
              <DollarSign className="mr-2" />
              <span>💰 财务管理</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* 日程模块 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
              tooltip="Calendar"
            >
              <Calendar className="mr-2" />
              <span>📅 日程安排</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-sm text-muted-foreground mb-2">
          <div className="font-semibold">当前用户: {user?.full_name || "未登录"}</div>
          <div>身份: 管理员</div>
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
            {t("backToHome")}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
