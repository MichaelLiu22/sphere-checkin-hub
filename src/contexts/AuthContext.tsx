
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
  approved: boolean;  // 添加审核状态字段
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
    const checkUserSession = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          // 解析并设置用户数据
          setUser(JSON.parse(storedUser));
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
      // 查询用户表以匹配全名和密码
      // 使用maybeSingle()而非single()以避免406错误
      const { data, error } = await supabase
        .from('users')
        .select('*')
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

      // 检查用户是否已获得审批
      if (data.approved === false) {
        toast.error("您的账号正在等待管理员审核，请稍后再试");
        throw new Error("账号待审核");
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
        approved: data.approved ?? true // 默认为true，以处理旧数据
      };

      // 将用户数据存储到本地存储中
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // 根据用户类型重定向
      if (userType === 'admin') {
        navigate('/admin-dashboard');
      } else if (userType === 'staff') {
        navigate('/staff-dashboard');
      } else if (userType === 'visitor') {
        navigate('/guest');
      } else if (userType === 'employee') {
        navigate('/employee-dashboard');
      } else if (userType === 'unassigned') {
        // 未分配角色但已审批的用户
        navigate('/waiting-assignment');
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
