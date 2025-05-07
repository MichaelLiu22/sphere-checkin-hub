
import React, { useState } from "react";
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

// Interface definition
interface User {
  id: string;
  full_name: string;
  user_type: string;
  upload_permission: boolean;
  task_permission: boolean;
  notes: string | null;
  created_at: string;
}

interface UserManagementPanelProps {
  unassignedUsers: User[];
  allUsers: User[];
  fetchUsers: () => Promise<void>;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ 
  unassignedUsers, 
  allUsers,
  fetchUsers 
}) => {
  const { t } = useLanguage();
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string>("unassigned");
  const [uploadPermission, setUploadPermission] = useState<boolean>(false);
  const [taskPermission, setTaskPermission] = useState<boolean>(false);
  const [userNote, setUserNote] = useState<string>("");

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
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
            {unassignedUsers.length === 0 ? (
              <p className="text-center py-4">No unassigned users found</p>
            ) : (
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
};

export default UserManagementPanel;
