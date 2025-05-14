
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * 认证守卫组件的属性接口
 * 用于保护需要特定角色才能访问的路由
 */
interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * 认证守卫组件
 * 控制用户基于其角色和部门的路由访问权限
 * 
 * @param {AuthGuardProps} props - 组件属性，包含子组件和允许的角色列表
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  // 从认证上下文获取用户信息和加载状态
  const { user, loading } = useAuth();
  // 获取当前位置信息用于重定向
  const location = useLocation();
  // 部门检查状态
  const [deptChecking, setDeptChecking] = React.useState(true);
  // 用户部门
  const [userDept, setUserDept] = React.useState<string | null>(null);

  // 检查用户部门
  React.useEffect(() => {
    const checkDepartment = async () => {
      if (user && user.department_id) {
        try {
          const { data, error } = await supabase
            .from('departments')
            .select('name')
            .eq('id', user.department_id)
            .single();

          if (!error && data) {
            setUserDept(data.name);
          }
        } catch (err) {
          console.error("获取部门信息失败:", err);
        }
      }
      setDeptChecking(false);
    };

    if (!loading && user) {
      checkDepartment();
    } else {
      setDeptChecking(false);
    }
  }, [user, loading]);

  // 显示加载状态，等待认证和部门检查完成
  if (loading || deptChecking) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 如果用户部门为"None"，重定向到等待审批页面
  if (userDept === 'None') {
    return <Navigate to="/waiting-approval" state={{ username: user.full_name }} replace />;
  }

  // 如果用户角色不在允许的角色列表中，根据其角色重定向到适当的仪表板
  if (!allowedRoles.includes(user.user_type)) {
    if (user.user_type === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.user_type === 'staff') {
      return <Navigate to="/staff-dashboard" replace />;
    } else if (user.user_type === 'employee') {
      return <Navigate to="/employee-dashboard" replace />;
    } else {
      return <Navigate to="/guest" replace />;
    }
  }

  // 如果用户角色被允许，渲染子组件
  return <>{children}</>;
};

export default AuthGuard;
