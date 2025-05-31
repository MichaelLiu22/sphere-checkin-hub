
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, Upload, Users, ArrowLeft, Settings, Calendar, DollarSign, CheckSquare, Package, Receipt, Search } from "lucide-react";
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
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarHeader className="flex justify-between items-center p-4 bg-background border-b border-border">
        <h2 className="text-lg font-semibold group-data-[collapsible=icon]:hidden text-foreground">{t("adminDashboard")}</h2>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "w9"}
              onClick={() => setActiveTab("w9")}
              tooltip="W9 Files"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">📄 W9</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "upload"}
              onClick={() => setActiveTab("upload")}
              tooltip="Upload Files"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Upload className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">📤 上传文件</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "users"}
              onClick={() => setActiveTab("users")}
              tooltip="User Management"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">👥 用户管理</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* 权限配置选项卡 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "permissions"}
              onClick={() => setActiveTab("permissions")}
              tooltip="Permission Configuration"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">🔑 权限配置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* 管理员可访问的所有模块 */}
          <SidebarMenuItem>
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">模块功能</div>
          </SidebarMenuItem>
          
          {/* 任务模块 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
              tooltip="Task Management"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <CheckSquare className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">📋 任务管理</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* 库存系统模块 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "inventory"}
              onClick={() => setActiveTab("inventory")}
              tooltip="Inventory System"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Package className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">📦 库存系统</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* 财务管理模块 - 整合后的完整财务系统 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "financial-insights"}
              onClick={() => setActiveTab("financial-insights")}
              tooltip="Financial Management"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <DollarSign className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">💰 财务管理</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* 发票制作模块 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "invoice"}
              onClick={() => setActiveTab("invoice")}
              tooltip="Invoice Creation"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Receipt className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">🧾 发票制作</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* 产品报告模块 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "product-report"}
              onClick={() => setActiveTab("product-report")}
              tooltip="Product Report Generator"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">📊 产品报告</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* 日程模块 */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
              tooltip="Calendar"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Calendar className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">📅 日程安排</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 bg-background border-t border-border">
        <div className="text-sm text-muted-foreground mb-2 group-data-[collapsible=icon]:hidden">
          <div className="font-semibold text-foreground">当前用户: {user?.full_name || "未登录"}</div>
          <div>身份: 管理员</div>
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="ml-2 group-data-[collapsible=icon]:hidden">{t("logout")}</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2 group-data-[collapsible=icon]:hidden">{t("backToHome")}</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
