import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * 用户信息接口定义
 * 包含用户基本信息和权限
 */
interface User {
  id: string;
  full_name: string;
  user_type: 'admin' | 'staff' | 'visitor' | 'employee' | 'unassigned';
  department_id?: string | null;
  enabled_modules?: string[] | null;
  task_permission?: boolean | null;  // Added task_permission property
  upload_permission?: boolean | null; // Added for completeness
}

/**
 * 认证上下文类型接口定义
 * 包含用户信息、加载状态和认证方法
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (fullName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 创建认证上下文并设置默认值
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

// 导出认证上下文使用钩子
export const useAuth = () => useContext(AuthContext);

/**
 * 认证提供者组件的属性接口
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证提供者组件
 * 管理用户的认证状态和相关操作
 * @param {AuthProviderProps} props - 组件属性
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 用户状态管理
  const [user, setUser] = useState<User | null>(null);
  // 加载状态管理
  const [loading, setLoading] = useState(true);
  // 路由导航钩子
  const navigate = useNavigate();

  // 初始化 - 检查用户是否已登录
  useEffect(() => {
    // 检查本地存储中的用户数据
    const checkUserSession = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          // 解析并设置用户数据
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Set up Supabase authentication session for RLS policies
          if (userData.id) {
            // Create a custom session token for Supabase
            await supabase.auth.setSession({
              access_token: userData.id, // Use user ID as a simple token
              refresh_token: '',
            });
          }
        } catch (error) {
          console.error("Failed to parse user data:", error);
          // 清除无效的用户数据
          localStorage.removeItem('user');
        }
      }
      // 完成加载过程
      setLoading(false);
    };

    checkUserSession();
  }, []);

  /**
   * 登录功能
   * 使用Supabase验证用户凭据
   * @param {string} fullName - 用户全名
   * @param {string} password - 用户密码
   */
  const login = async (fullName: string, password: string) => {
    // 开始加载状态
    setLoading(true);
    try {
      // 查询用户表以匹配全名和密码，同时获取关联的部门名称
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          departments:department_id (
            name
          )
        `)
        .eq('full_name', fullName)
        .eq('password_hash', password)
        .maybeSingle();

      if (error) {
        toast.error("数据库查询错误");
        throw new Error("数据库查询错误");
      }

      if (!data) {
        toast.error("用户名或密码不正确");
        throw new Error("用户名或密码不正确");
      }

      // 将数据类型断言为用户角色类型
      const userType = data.user_type as 'admin' | 'staff' | 'visitor' | 'employee' | 'unassigned';
      
      // 创建具有正确类型的用户对象
      const userData: User = {
        id: data.id,
        full_name: data.full_name,
        user_type: userType,
        department_id: data.department_id || null,
        enabled_modules: data.enabled_modules || [],
        task_permission: data.task_permission || null,  // Include task_permission
        upload_permission: data.upload_permission || null, // Include upload_permission
      };

      // 检查部门名称是否为"None"
      const departmentName = data.departments?.name;
      
      // 将用户数据存储到本地存储中
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Set up Supabase authentication session for RLS policies
      await supabase.auth.setSession({
        access_token: data.id, // Use user ID as a simple token
        refresh_token: '',
      });

      // 根据部门和用户类型重定向
      if (departmentName === 'None') {
        // 如果部门为None，跳转到等待审批页面
        navigate('/waiting-approval', { state: { username: userData.full_name } });
      } else {
        // 部门已分配，根据用户类型重定向
        if (userType === 'admin') {
          navigate('/admin-dashboard');
        } else if (userType === 'staff') {
          navigate('/staff-dashboard');
        } else if (userType === 'visitor') {
          navigate('/guest');
        } else if (userType === 'employee') {
          navigate('/employee-dashboard');
        } else if (userType === 'unassigned') {
          navigate('/waiting-assignment');
        }
      }
      
      toast.success("登录成功");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "登录失败");
      throw error;
    } finally {
      // 结束加载状态
      setLoading(false);
    }
  };

  /**
   * 登出功能
   * 清除用户会话并重定向到首页
   */
  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear local storage and state
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast.success("已成功退出登录");
  };

  // 提供认证上下文给子组件
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
