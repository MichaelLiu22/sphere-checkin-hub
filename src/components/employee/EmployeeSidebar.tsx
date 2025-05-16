
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
  ClipboardList,
  DollarSign
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

interface EmployeeSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const EmployeeSidebar: React.FC<EmployeeSidebarProps> = ({ activeTab, setActiveTab }) => {
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
              <Home className="mr-2" />
              <span>📊 概览</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Tasks module - always visible */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
              tooltip="Task Board"
            >
              <ClipboardList className="mr-2" />
              <span>📋 当前任务</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {enabledModules.includes("host_schedule") && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeTab === "host_schedule"}
                onClick={() => setActiveTab("host_schedule")}
                tooltip="Host Calendar"
              >
                <Calendar className="mr-2" />
                <span>📅 Host 排班</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {enabledModules.includes("finance") && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeTab === "finance"}
                onClick={() => setActiveTab("finance")}
                tooltip="Finance Management"
              >
                <DollarSign className="mr-2" />
                <span>💰 财务管理</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-sm text-muted-foreground mb-2">
          <div className="font-semibold">当前用户: {user?.full_name}</div>
          <div>部门: {user?.department_id ? "已分配" : "未分配"}</div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default EmployeeSidebar;
