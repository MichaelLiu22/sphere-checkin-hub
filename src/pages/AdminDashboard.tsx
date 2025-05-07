import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, LogOut, FileText, Users, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Layout from "@/components/Layout";

// Interface definitions
interface W9Record {
  full_legal_name: string;
  created_at: string;
  w9_file: string;
}

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Panel 1: W9 Files
  const [w9Files, setW9Files] = useState<W9Record[]>([]);
  const [w9Loading, setW9Loading] = useState(true);
  
  // Panel 3: User Management
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string>("unassigned");
  const [uploadPermission, setUploadPermission] = useState<boolean>(false);
  const [taskPermission, setTaskPermission] = useState<boolean>(false);
  const [userNote, setUserNote] = useState<string>("");
  
  // Panel 2: File Upload
  const [targetUser, setTargetUser] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("w9");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Active tab/panel state
  const [activeTab, setActiveTab] = useState<string>("w9");
  
  useEffect(() => {
    fetchW9Files();
    fetchUsers();
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const fetchW9Files = async () => {
    setW9Loading(true);
    try {
      // Get all files from SphereCheckIN where w9_file is not null
      const { data: w9Data, error: w9Error } = await supabase
        .from('SphereCheckIN')
        .select('full_legal_name, created_at, w9_file')
        .not('w9_file', 'is', null);
        
      if (w9Error) throw w9Error;
      
      setW9Files(w9Data || []);
    } catch (error: any) {
      console.error("Error fetching W9 files:", error);
      toast.error(`Error fetching W9 files: ${error.message}`);
    } finally {
      setW9Loading(false);
    }
  };

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
      toast.error(`Error fetching users: ${error.message}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUserType(user.user_type);
      setUploadPermission(user.upload_permission || false);
      setTaskPermission(user.task_permission || false);
      setUserNote(user.notes || "");
    }
  };

  const handleUserTypeUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          user_type: selectedUserType,
          upload_permission: uploadPermission,
          task_permission: taskPermission,
          notes: userNote
        })
        .eq('id', selectedUser);
        
      if (error) throw error;
      
      toast.success("User updated successfully");
      fetchUsers(); // Refresh the user list
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !targetUser) {
      toast.error("Please select both a file and a target user");
      return;
    }
    
    setUploading(true);
    try {
      // Get the user's full name
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', targetUser)
        .single();
        
      if (userError) throw userError;
      
      const fileName = `${userData.full_name}_${fileType}.pdf`;
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdffileupload")
        .upload(`uploads/${fileName}`, selectedFile, {
          contentType: "application/pdf",
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("pdffileupload")
        .getPublicUrl(`uploads/${fileName}`);
        
      // Update or insert into SphereCheckIN table
      const updateData = {
        full_legal_name: userData.full_name,
        user_id: targetUser
      } as any;
      
      if (fileType === 'w9') {
        updateData.w9_file = urlData.publicUrl;
      } else if (fileType === 'nda') {
        updateData.nda_file = urlData.publicUrl;
      }
      
      const { data: checkData, error: checkError } = await supabase
        .from('SphereCheckIN')
        .select()
        .eq('full_legal_name', userData.full_name)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (checkData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('SphereCheckIN')
          .update(updateData)
          .eq('id', checkData.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('SphereCheckIN')
          .insert([updateData]);
          
        if (insertError) throw insertError;
      }
      
      toast.success(`File uploaded successfully for ${userData.full_name}`);
      setSelectedFile(null);
      fetchW9Files(); // Refresh the W9 files list
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getUserTypeBadge = (userType: string) => {
    const colorMap: Record<string, string> = {
      'admin': 'bg-red-500',
      'manager': 'bg-purple-500',
      'operator': 'bg-blue-500',
      'influencer': 'bg-yellow-500',
      'warehouse': 'bg-green-500',
      'finance': 'bg-orange-500',
      'unassigned': 'bg-gray-500'
    };
    
    return (
      <Badge className={`${colorMap[userType] || 'bg-gray-500'}`}>
        {userType}
      </Badge>
    );
  };
  
  // Panel component: W9 Files
  const W9FilesPanel = () => (
    <Card className="h-full">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          所有用户提交的W9表格
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("fullLegalName")}</TableHead>
              <TableHead>W9 {t("file")}</TableHead>
              <TableHead>{t("submittedAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {w9Loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">{t("loading")}</TableCell>
              </TableRow>
            ) : w9Files.length > 0 ? (
              w9Files.map((record, index) => (
                <TableRow key={`w9-${index}`}>
                  <TableCell>{record.full_legal_name}</TableCell>
                  <TableCell>
                    {record.w9_file ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={record.w9_file} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2" size={16} />
                          {t("download")}
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">{t("notUploaded")}</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(record.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">No W9 files found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
  
  // Panel component: File Upload
  const FileUploadPanel = () => (
    <Card className="h-full">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5 text-green-600" />
          上传新文件
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="target-user">Target User</Label>
            <Select value={targetUser || ""} onValueChange={setTargetUser}>
              <SelectTrigger id="target-user" className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="file-type">File Type</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger id="file-type" className="w-full">
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w9">W9</SelectItem>
                <SelectItem value="nda">NDA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="file-upload">Upload File (PDF only)</Label>
            <Input 
              id="file-upload" 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>
          
          <Button 
            className="w-full"
            onClick={handleFileUpload} 
            disabled={uploading || !selectedFile || !targetUser}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  // Panel component: User Management
  const UserManagementPanel = () => (
    <Card className="h-full">
      <CardHeader className="bg-yellow-50 border-b">
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-yellow-600" />
          对未分类用户进行分配
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded p-4">
            <h4 className="font-medium mb-4">Unassigned Users</h4>
            {usersLoading ? (
              <p className="text-center py-4">{t("loading")}</p>
            ) : unassignedUsers.length > 0 ? (
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {unassignedUsers.map(user => (
                  <div 
                    key={user.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${selectedUser === user.id ? 'bg-blue-50 border-blue-300' : ''}`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-gray-500">Created: {formatDate(user.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4">No unassigned users found</p>
            )}
          </div>
          
          <div className="border rounded p-4">
            <h4 className="font-medium mb-4">Edit Selected User</h4>
            {selectedUser ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-type">User Type</Label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger id="user-type" className="w-full">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="upload-permission" 
                    checked={uploadPermission}
                    onChange={(e) => setUploadPermission(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="upload-permission">Upload Permission</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="task-permission" 
                    checked={taskPermission}
                    onChange={(e) => setTaskPermission(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="task-permission">Task Permission</Label>
                </div>
                
                <div>
                  <Label htmlFor="user-notes">Notes</Label>
                  <Input 
                    id="user-notes"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Add notes about this user"
                  />
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleUserTypeUpdate}
                >
                  Update User
                </Button>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">Select a user to edit</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <Layout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Sidebar */}
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
            </div>
          </Sidebar>
          
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === "w9" && <W9FilesPanel />}
            {activeTab === "upload" && <FileUploadPanel />}
            {activeTab === "users" && <UserManagementPanel />}
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default AdminDashboard;
