
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, Upload, Users, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
        </SidebarMenu>
      </SidebarContent>
      
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full mt-2" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToHome")}
        </Button>
      </div>
    </Sidebar>
  );
};

export default AdminSidebar;
