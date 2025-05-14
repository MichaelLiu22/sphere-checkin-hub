
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  full_name: string;
  user_type: string;
  department_id: string | null;
  departments?: { name: string };
  enabled_modules: string[];
}

interface Department {
  id: string;
  name: string;
}

const PermissionConfigPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取所有用户和部门数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取所有用户及其部门
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(`
            id,
            full_name,
            user_type,
            department_id,
            departments:department_id (name),
            enabled_modules
          `)
          .order("full_name");

        if (userError) throw userError;

        // 获取所有部门
        const { data: deptData, error: deptError } = await supabase
          .from("departments")
          .select("*")
          .order("name");

        if (deptError) throw deptError;

        setUsers(userData || []);
        setDepartments(deptData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 更新用户部门
  const updateDepartment = async (userId: string, departmentId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ department_id: departmentId })
        .eq("id", userId);

      if (error) throw error;

      // 更新本地用户列表
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                department_id: departmentId,
                departments: {
                  name: departments.find((d) => d.id === departmentId)?.name || "",
                },
              }
            : user
        )
      );

      toast.success("用户部门已更新");
    } catch (error: any) {
      console.error("Error updating department:", error);
      toast.error("更新失败: " + error.message);
    }
  };

  // 更新用户启用模块
  const toggleModule = async (userId: string, module: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const currentModules = [...(user.enabled_modules || [])];
    const updatedModules = currentModules.includes(module)
      ? currentModules.filter((m) => m !== module)
      : [...currentModules, module];

    try {
      const { error } = await supabase
        .from("users")
        .update({ enabled_modules: updatedModules })
        .eq("id", userId);

      if (error) throw error;

      // 更新本地用户列表
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, enabled_modules: updatedModules } : u
        )
      );

      toast.success("用户模块已更新");
    } catch (error: any) {
      console.error("Error updating modules:", error);
      toast.error("更新失败: " + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">用户权限配置</h2>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>用户类型</TableHead>
              <TableHead>部门</TableHead>
              <TableHead>模块权限</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>
                  <Select
                    value={user.department_id || ""}
                    onValueChange={(value) => updateDepartment(user.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="选择部门" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {["files", "tasks", "finance"].map((module) => (
                      <Button
                        key={module}
                        size="sm"
                        variant={
                          user.enabled_modules?.includes(module)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => toggleModule(user.id, module)}
                      >
                        {module}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PermissionConfigPanel;
