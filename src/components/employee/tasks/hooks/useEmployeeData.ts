
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// 用户数据接口
export interface User {
  id: string;
  full_name: string;
  department_id?: string;
  user_type?: string;
}

// 部门数据接口
export interface Department {
  id: string;
  name: string;
}

// 员工数据钩子
export const useEmployeeData = (excludeSelf = false) => {
  // 当前用户、部门用户和所有用户的状态
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // 部门数据状态
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // 获取部门用户
  const fetchDepartmentUsers = async (departmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, department_id, user_type')
        .eq('department_id', departmentId);

      if (error) throw error;
      
      setDepartmentUsers(data || []);
    } catch (error) {
      console.error('Error fetching department users:', error);
      toast({
        title: '获取部门用户失败',
        description: '无法加载您部门的用户。',
        variant: 'destructive',
      });
    }
  };

  // 获取所有用户
  const fetchAllUsers = async () => {
    try {
      let query = supabase
        .from('users')
        .select('id, full_name, department_id, user_type');
        
      // 如果需要排除当前用户
      if (excludeSelf && currentUser) {
        query = query.neq('id', currentUser.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast({
        title: '获取用户列表失败',
        description: '无法加载用户列表。',
        variant: 'destructive',
      });
    }
  };

  // 获取所有部门
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase.from('departments').select('*');
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: '获取部门失败',
        description: '无法加载部门列表。',
        variant: 'destructive',
      });
    }
  };

  // 获取初始数据
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchCurrentUser();
      await fetchAllUsers();
      await fetchDepartments();
      setIsLoading(false);
    };
    
    loadInitialData();
  }, []);

  // 当当前用户或其部门ID发生变化时，获取部门用户
  useEffect(() => {
    if (currentUser && currentUser.department_id) {
      fetchDepartmentUsers(currentUser.department_id);
    }
  }, [currentUser]);

  return {
    currentUser,
    departmentUsers,
    allUsers,
    departments,
    isLoading,
    refetch: async () => {
      await fetchCurrentUser();
      await fetchAllUsers();
      if (currentUser?.department_id) {
        await fetchDepartmentUsers(currentUser.department_id);
      }
      await fetchDepartments();
    }
  };
};

// Also provide a default export for backward compatibility
export default useEmployeeData;
