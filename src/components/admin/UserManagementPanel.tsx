import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Updated interface to match the database schema
interface User {
  id: string;
  full_name: string;
  user_type: string;
  feature: "None" | null;
  upload_permission: boolean;
  task_permission: boolean;
  notes: string | null;
  created_at: string;
  department_id?: string | null;
  password_hash?: string;
}

interface Department {
  id: string;
  name: string;
  created_at?: string;
}

interface UserManagementPanelProps {
  fetchUsers: () => Promise<void>;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ 
  fetchUsers 
}) => {
  const { t } = useLanguage();
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userFeature, setUserFeature] = useState<"None" | null>("None");
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Make sure data has all required properties including feature
      const usersWithFeature = (data || []).map(user => ({
        ...user,
        feature: user.feature || null
      }));
      
      setAllUsers(usersWithFeature);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error("Error fetching departments:", error);
      toast.error(`Failed to load departments: ${error.message}`);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setUserFeature(user.feature);
      setUserDepartment(user.department_id);
    }
  };

  const handleUpdateUserFeature = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          feature: userFeature
        })
        .eq('id', selectedUser);
        
      if (error) throw error;
      
      toast.success("User feature updated successfully");
      loadUsers(); // Refresh the user list
      fetchUsers(); // Update parent component's user list
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    }
  };

  const handleUpdateUserDepartment = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          department_id: userDepartment || null
        })
        .eq('id', selectedUser);
        
      if (error) throw error;
      
      // Update the local state immediately
      setAllUsers(prevUsers => {
        const updatedUsers = prevUsers.map(user => 
          user.id === selectedUser 
            ? { ...user, department_id: userDepartment }
            : user
        );
        return updatedUsers;
      });
      
      toast.success("User department updated successfully");
      await loadDepartments(); // Reload departments first
      await loadUsers(); // Then reload users
      fetchUsers(); // Update parent component's user list
    } catch (error: any) {
      console.error('Error updating department:', error);
      toast.error(`Failed to update user department: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDepartmentName = (departmentId: string | null | undefined): string => {
    if (!departmentId) return "—";
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : "Unknown";
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-600" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">All Users</h3>
            {usersLoading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id} className={selectedUser === user.id ? "bg-blue-50" : ""}>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.user_type}</TableCell>
                      <TableCell>{getDepartmentName(user.department_id)}</TableCell>
                      <TableCell>{user.feature || "—"}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUserSelect(user.id)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {selectedUser && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Edit User</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={userDepartment || ""}
                      onValueChange={setUserDepartment}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleUpdateUserDepartment}
                      className="mt-2"
                    >
                      Update Department
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="feature">Update Feature</Label>
                    <Select 
                      value={userFeature || "None"}
                      onValueChange={(value) => setUserFeature(value as "None")}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select feature" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="b9ffca1c-004d-4a26-9773-5602821d1d27">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleUpdateUserFeature}
                      className="mt-2"
                    >
                      Update Feature
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementPanel;
