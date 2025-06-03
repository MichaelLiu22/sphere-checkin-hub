
import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import W9FilesPanel from "@/components/admin/W9FilesPanel";
import FileUploadPanel from "@/components/admin/FileUploadPanel";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import PermissionConfigPanel from "@/components/admin/PermissionConfigPanel";
import TaskReportPanel from "@/components/admin/TaskReportPanel";
import InventoryPanel from "@/components/admin/InventoryPanel";
import CostManagementPanel from "@/components/admin/CostManagementPanel";
import FinancialReportsPanel from "@/components/admin/FinancialReportsPanel";
import InvoicePanel from "@/components/admin/InvoicePanel";
import ProductReportPanel from "@/components/admin/ProductReportPanel";
import PayrollCalendar from "@/components/PayrollCalendar";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  full_name: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("w9");
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .order('full_name');
      
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAllUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "w9":
        return <W9FilesPanel />;
      case "upload":
        return <FileUploadPanel allUsers={allUsers} />;
      case "users":
        return <UserManagementPanel fetchUsers={fetchUsers} />;
      case "permissions":
        return <PermissionConfigPanel />;
      case "tasks":
        return <TaskReportPanel />;
      case "inventory":
        return <InventoryPanel />;
      case "cost-management":
        return <CostManagementPanel />;
      case "financial-reports":
        return <FinancialReportsPanel />;
      case "invoice":
        return <InvoicePanel />;
      case "product-report":
        return <ProductReportPanel />;
      case "calendar":
        return <PayrollCalendar />;
      default:
        return <W9FilesPanel />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
