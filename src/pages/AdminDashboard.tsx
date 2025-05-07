
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "@/components/Layout";
import W9FilesPanel from "@/components/admin/W9FilesPanel";
import FileUploadPanel from "@/components/admin/FileUploadPanel";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Interface definitions
interface User {
  id: string;
  full_name: string;
  user_type: string;
  upload_permission: boolean;
  task_permission: boolean;
  notes: string | null;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  // Panel 3: User Management
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Active tab/panel state
  const [activeTab, setActiveTab] = useState<string>("w9");
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      // Get all users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (userError) throw userError;
      
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
          {/* Sidebar */}
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === "w9" && <W9FilesPanel />}
            {activeTab === "upload" && <FileUploadPanel allUsers={allUsers} />}
            {activeTab === "users" && (
              <UserManagementPanel 
                unassignedUsers={unassignedUsers}
                allUsers={allUsers}
                fetchUsers={fetchUsers}
              />
            )}
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default AdminDashboard;
