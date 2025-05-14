
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * 用户认证组件
 * 提供用户登录和注册功能
 */
const UserAuth: React.FC = () => {
  // 多语言支持
  const { t } = useLanguage();
  // 路由导航
  const navigate = useNavigate();
  // 状态管理
  const [isLogin, setIsLogin] = useState(true); // 是否为登录模式（否则为注册模式）
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * 检查用户会话状态
   * 如果用户已登录，则重定向到仪表板
   */
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      // 如果用户已登录，重定向到仪表板
      navigate('/employee-dashboard');
    }
  }, [navigate]);

  /**
   * 表单提交处理
   * 处理登录或注册请求
   * @param e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // 登录逻辑
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('full_name', fullName)
          .eq('password_hash', password)
          .single();

        if (error) {
          setError(t("invalidCredentials"));
          throw error;
        }

        if (data) {
          toast.success(t("loginSuccess"));
          // 将用户信息保存到localStorage用于会话管理
          localStorage.setItem('user', JSON.stringify(data));
          
          // 根据用户类型重定向
          if (data.user_type === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/employee-dashboard');
          }
        } else {
          setError(t("loginError"));
          toast.error(t("loginError"));
        }
      } else {
        // 注册验证
        // 检查密码是否匹配
        if (password !== confirmPassword) {
          setError("Error: 00001 - 密码不一致");
          toast.error("Error: 00001 - 密码不一致");
          setLoading(false);
          return;
        }

        // 检查必填字段
        if (!fullName || !password) {
          setError("Error: 00004 - 信息不完整");
          toast.error("Error: 00004 - 信息不完整");
          setLoading(false);
          return;
        }

        // 检查密码长度
        if (password.length < 6) {
          setError("Error: 00005 - 密码太短");
          toast.error("Error: 00005 - 密码太短");
          setLoading(false);
          return;
        }

        // 检查用户是否已存在
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('full_name', fullName)
          .single();
          
        if (existingUser) {
          setError("Error: 00003 - 用户已存在");
          toast.error("Error: 00003 - 用户已存在");
          setLoading(false);
          return;
        }

        // 创建新用户
        const { error, data } = await supabase
          .from('users')
          .insert([{
            full_name: fullName,
            password_hash: password,
            // 为新注册用户设置默认值
            user_type: 'employee', // 默认用户类型为employee
            department_id: null,   // 默认部门为null
            enabled_modules: [],   // 默认启用模块为空数组
          }])
          .select()
          .single();

        if (error) {
          // 处理特定的Supabase错误
          if (error.code === '23505') { // 唯一约束冲突
            setError("Error: 00003 - 用户已存在");
            toast.error("Error: 00003 - 用户已存在");
          } else {
            // 所有其他情况的通用错误
            setError("Error: 00099 - 系统异常");
            toast.error("Error: 00099 - 系统异常");
            console.error("Registration error details:", error);
          }
          throw error;
        }

        toast.success(t("registrationSuccess"));
        // 注册后自动登录
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/employee-dashboard');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (!error) {
        toast.error(isLogin ? t("loginError") : t("registrationError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {isLogin ? t("userLogin") : t("userRegistration")}
        </h2>
        <Button
          variant="link"
          onClick={() => {
            setIsLogin(!isLogin);
            setFullName("");
            setPassword("");
            setConfirmPassword("");
            setError("");
          }}
        >
          {isLogin ? t("needToRegister") : t("alreadyHaveAccount")}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            {t("fullLegalName")}
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            {t("password")}
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("passwordRequirements")}
            </p>
          )}
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              {t("confirmPassword")}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("processing") : (isLogin ? t("login") : t("register"))}
        </Button>
      </form>
    </div>
  );
};

export default UserAuth;
