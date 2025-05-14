
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Login Component
 * 
 * 提供用户登录功能的组件，包含登录表单和错误处理
 * 使用AuthContext处理登录逻辑，使用LanguageContext处理多语言支持
 */
const Login: React.FC = () => {
  // 使用语言上下文获取翻译函数
  const { t } = useLanguage();
  // 从认证上下文获取登录函数和加载状态
  const { login, loading } = useAuth();
  
  // 用户名和密码的状态管理
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  // 错误信息状态管理
  const [error, setError] = useState("");

  /**
   * 处理表单提交
   * @param e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{t("userLogin")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 显示错误信息 */}
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm mb-4">
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
          </div>

          {/* 登录按钮，加载时禁用 */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("processing") : t("login")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;
