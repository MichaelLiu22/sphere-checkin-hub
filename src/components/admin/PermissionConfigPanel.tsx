
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * 部门接口定义
 * 描述部门数据结构
 */
interface Department {
  id: string;
  name: string;
  created_at?: string;
}

/**
 * 用户接口定义
 * 描述用户数据结构，包含部门和模块权限信息
 */
interface User {
  id: string;
  full_name: string;
  user_type: string;
  department_id: string | null;
  enabled_modules: string[] | null;
  created_at: string;
}

/**
 * 可用模块配置
 * 定义系统中可分配的功能模块
 */
const AVAILABLE_MODULES = [
  { id: "host_schedule", label: "Host 日历" },
  { id: "finance", label: "财务管理" }
];

/**
 * 权限配置面板组件
 * 管理员用于配置用户部门和功能权限的界面
 */
const PermissionConfigPanel: React.FC = () => {
  // 多语言支持
  const { t } = useLanguage();
  
  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  
  // 临时状态，用于跟踪用户的权限修改
  const [userModules, setUserModules] = useState<{[key: string]: string[]}>({}); 
  const [userDepartments, setUserDepartments] = useState<{[key: string]: string | null}>({}); 

  /**
   * 组件加载时获取用户和部门数据
   */
  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  /**
   * 获取所有非管理员用户
   */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 查询非admin用户
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('user_type', 'admin')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // 初始化用户权限状态
      const initialModules: {[key: string]: string[]} = {};
      const initialDepartments: {[key: string]: string | null} = {};
      
      data?.forEach(user => {
        initialModules[user.id] = user.enabled_modules || [];
        initialDepartments[user.id] = user.department_id;
      });
      
      setUsers(data || []);
      setUserModules(initialModules);
      setUserDepartments(initialDepartments);
    } catch (error: any) {
      console.error("获取用户数据失败:", error);
      toast.error(`获取用户数据失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取所有部门数据
   */
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setDepartments(data || []);
    } catch (error: any) {
      console.error("获取部门数据失败:", error);
      toast.error(`获取部门数据失败: ${error.message}`);
    }
  };

  /**
   * 处理模块权限勾选变化
   * @param userId - 用户ID
   * @param moduleId - 模块ID
   * @param checked - 是否勾选
   */
  const handleModuleChange = (userId: string, moduleId: string, checked: boolean) => {
    setUserModules(prev => {
      const currentModules = [...(prev[userId] || [])];
      
      if (checked && !currentModules.includes(moduleId)) {
        return { ...prev, [userId]: [...currentModules, moduleId] };
      } else if (!checked && currentModules.includes(moduleId)) {
        return { ...prev, [userId]: currentModules.filter(id => id !== moduleId) };
      }
      
      return prev;
    });
  };

  /**
   * 处理部门选择变化
   * @param userId - 用户ID
   * @param departmentId - 部门ID
   */
  const handleDepartmentChange = (userId: string, departmentId: string | null) => {
    setUserDepartments(prev => ({
      ...prev,
      [userId]: departmentId
    }));
  };

  /**
   * 保存用户权限配置
   * @param userId - 用户ID
   */
  const handleSaveUser = async (userId: string) => {
    setSavingUserId(userId);
    try {
      // 更新用户部门和权限
      const { error } = await supabase
        .from('users')
        .update({
          department_id: userDepartments[userId],
          enabled_modules: userModules[userId] || []
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success("用户权限配置已保存");
      
      // 更新本地用户列表
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            department_id: userDepartments[userId],
            enabled_modules: userModules[userId] || []
          };
        }
        return user;
      }));
      
    } catch (error: any) {
      console.error("保存用户权限失败:", error);
      toast.error(`保存用户权限失败: ${error.message}`);
    } finally {
      setSavingUserId(null);
    }
  };

  /**
   * 格式化日期显示
   * @param dateString - ISO日期字符串
   * @returns 格式化后的日期字符串
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  /**
   * 检查模块是否被选择
   * @param userId - 用户ID
   * @param moduleId - 模块ID
   * @returns 是否选择
   */
  const isModuleChecked = (userId: string, moduleId: string): boolean => {
    return (userModules[userId] || []).includes(moduleId);
  };

  /**
   * 获取部门名称
   * @param departmentId - 部门ID
   * @returns 部门名称
   */
  const getDepartmentName = (departmentId: string | null): string => {
    if (!departmentId) return "未分配";
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : "未知部门";
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-600" />
          权限配置
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-4">加载用户数据中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>当前部门</TableHead>
                  <TableHead>分配部门</TableHead>
                  <TableHead>功能模块</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{getDepartmentName(user.department_id)}</TableCell>
                    <TableCell>
                      <Select
                        value={userDepartments[user.id] || ""}
                        onValueChange={(value) => handleDepartmentChange(user.id, value || null)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="选择部门" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">未分配</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        {AVAILABLE_MODULES.map((module) => (
                          <div key={module.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${user.id}-${module.id}`}
                              checked={isModuleChecked(user.id, module.id)}
                              onCheckedChange={(checked) => 
                                handleModuleChange(user.id, module.id, checked === true)
                              }
                            />
                            <Label htmlFor={`${user.id}-${module.id}`}>{module.label}</Label>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleSaveUser(user.id)}
                        disabled={savingUserId === user.id}
                        size="sm"
                      >
                        {savingUserId === user.id ? (
                          "保存中..."
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            保存
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionConfigPanel;
