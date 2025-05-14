
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Login Component
 * 
 * 提供用户登录和注册功能的组件，包含切换式表单和错误处理
 * 使用AuthContext处理登录逻辑，使用LanguageContext处理多语言支持
 */
const Login: React.FC = () => {
  // 使用语言上下文获取翻译函数
  const { t } = useLanguage();
  // 从认证上下文获取登录函数和加载状态
  const { login, loading } = useAuth();
  // 导航钩子
  const navigate = useNavigate();
  
  // 当前活动的标签（登录或注册）
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // 用户名和密码的状态管理
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // 错误信息状态管理
  const [error, setError] = useState("");
  // 注册过程中的加载状态
  const [registerLoading, setRegisterLoading] = useState(false);

  /**
   * 处理登录表单提交
   * @param e - 表单提交事件
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    // 阻止表单默认提交行为
    e.preventDefault();
    // 清除之前的错误信息
    setError("");

    // 验证必填字段
    if (!fullName || !password) {
      setError(t("requiredFields"));
      return;
    }

    try {
      // 调用登录函数
      await login(fullName, password);
    } catch (error: any) {
      // 处理登录错误
      setError(error.message || t("loginError"));
    }
  };

  /**
   * 处理注册表单提交
   * @param e - 表单提交事件
   */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    // 阻止表单默认提交行为
    e.preventDefault();
    // 清除之前的错误信息
    setError("");
    setRegisterLoading(true);

    try {
      // 验证必填字段
      if (!fullName || !password || !confirmPassword) {
        throw new Error(t("requiredFields"));
      }

      // 验证密码匹配
      if (password !== confirmPassword) {
        throw new Error(t("passwordsDoNotMatch"));
      }

      // 检查用户是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('full_name', fullName)
        .maybeSingle();
        
      if (existingUser) {
        throw new Error(t("userAlreadyExists"));
      }

      // 创建新用户
      const { error: insertError, data: newUser } = await supabase
        .from('users')
        .insert([{
          full_name: fullName,
          password_hash: password,
          // 为新注册用户设置默认值
          user_type: 'unassigned', // 默认用户类型为unassigned，等待管理员审核
          department_id: null,   // 默认部门为null
          enabled_modules: [],   // 默认启用模块为空数组
          // 新增注册状态字段，标记为等待审核
          approved: false,       // 默认为未批准状态
        }])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      toast.success(t("registrationSuccess") || "注册成功，等待管理员审核");
      
      // 注册成功后重定向到等待审批页面
      navigate('/waiting-approval', { 
        state: { 
          username: fullName 
        } 
      });
      
    } catch (error: any) {
      // 处理注册错误
      setError(error.message);
      toast.error(error.message || t("registrationError") || "注册失败");
    } finally {
      setRegisterLoading(false);
    }
  };

  /**
   * 切换标签时重置表单和错误
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value as "login" | "register");
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{t("userAuthentication") || "用户认证"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">{t("login") || "登录"}</TabsTrigger>
            <TabsTrigger value="register">{t("register") || "注册"}</TabsTrigger>
          </TabsList>
          
          {/* 显示错误信息 */}
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="loginFullName" className="block text-sm font-medium mb-1">
                  {t("fullLegalName") || "全名"}
                </label>
                <Input
                  id="loginFullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium mb-1">
                  {t("password") || "密码"}
                </label>
                <Input
                  id="loginPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* 登录按钮，加载时禁用 */}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (t("processing") || "处理中...") : (t("login") || "登录")}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="registerFullName" className="block text-sm font-medium mb-1">
                  {t("fullLegalName") || "全名"}
                </label>
                <Input
                  id="registerFullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium mb-1">
                  {t("password") || "密码"}
                </label>
                <Input
                  id="registerPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  {t("confirmPassword") || "确认密码"}
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* 注册按钮，加载时禁用 */}
              <Button type="submit" disabled={registerLoading} className="w-full">
                {registerLoading ? (t("processing") || "处理中...") : (t("register") || "注册")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Login;
