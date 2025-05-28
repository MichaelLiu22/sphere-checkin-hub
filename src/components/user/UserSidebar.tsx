
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  LogOut, 
  Calendar, 
  Home,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface UserSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const enabledModules = user?.enabled_modules || [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarHeader className="flex justify-between items-center p-4 bg-background border-b border-border">
        <h2 className="text-lg font-semibold group-data-[collapsible=icon]:hidden text-foreground">{t("userDashboard")}</h2>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              tooltip="Overview"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">📊 概览</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {enabledModules.includes("host_schedule") && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeTab === "host_schedule"}
                onClick={() => setActiveTab("host_schedule")}
                tooltip="Host Calendar"
                className="text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Calendar className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">📅 Host 日历</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {enabledModules.includes("finance") && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeTab === "finance"}
                onClick={() => setActiveTab("finance")}
                tooltip="Finance Management"
                className="text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <FileText className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">💰 财务管理</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 bg-background border-t border-border">
        <div className="text-sm text-muted-foreground mb-2 group-data-[collapsible=icon]:hidden">
          <div className="font-semibold text-foreground">当前用户: {user?.full_name || "未登录"}</div>
          <div>部门: {user?.department_id ? "已分配" : "未分配"}</div>
        </div>
        <Button variant="outline" className="w-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="ml-2 group-data-[collapsible=icon]:hidden">{t("logout")}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default UserSidebar;
