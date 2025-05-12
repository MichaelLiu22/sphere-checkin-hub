
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "@/components/Layout";
import W9FilesPanel from "@/components/admin/W9FilesPanel";
import FileUploadPanel from "@/components/admin/FileUploadPanel";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
  const { logout } = useAuth();
  
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
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              {activeTab === "w9" && <W9FilesPanel />}
              {activeTab === "upload" && <FileUploadPanel allUsers={allUsers} />}
              {activeTab === "users" && (
                <UserManagementPanel 
                  fetchUsers={fetchUsers}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default AdminDashboard;
