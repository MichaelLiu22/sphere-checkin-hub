
import React, { useState } from "react";
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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("w9");

  const renderContent = () => {
    switch (activeTab) {
      case "w9":
        return <W9FilesPanel />;
      case "upload":
        return <FileUploadPanel />;
      case "users":
        return <UserManagementPanel />;
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
      <div className="flex h-screen bg-background">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
