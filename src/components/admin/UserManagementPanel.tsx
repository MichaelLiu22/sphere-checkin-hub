
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
  feature: string | null;
  upload_permission: boolean;
  task_permission: boolean;
  notes: string | null;
  created_at: string;
  department_id?: string | null;
  password_hash?: string;
}

interface UserManagementPanelProps {
  fetchUsers: () => Promise<void>;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ 
  fetchUsers 
}) => {
  const { t } = useLanguage();
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userFeature, setUserFeature] = useState<string>("");
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    loadUsers();
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

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setUserFeature(user.feature || "");
    }
  };

  const handleUpdateUserFeature = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          feature: userFeature || null
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter to only show staff users for feature management
  const staffUsers = allUsers.filter(user => user.user_type === 'staff');
  
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

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Manage Staff Features</h3>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feature">Update Feature</Label>
                    <Input 
                      id="feature"
                      value={userFeature}
                      onChange={(e) => setUserFeature(e.target.value)}
                      placeholder="Enter feature value"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleUpdateUserFeature}
                      className="w-full md:w-auto"
                    >
                      Update Feature
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Select a user to manage their feature settings
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementPanel;
