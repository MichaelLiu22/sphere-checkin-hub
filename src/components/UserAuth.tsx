
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const UserAuth: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for existing session on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      // If user is already logged in, redirect to dashboard
      navigate('/employee-dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login logic
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('full_name', fullName)
          .eq('password', password)
          .single();

        if (error) {
          setError(t("invalidCredentials"));
          throw error;
        }

        if (data) {
          toast.success(t("loginSuccess"));
          // Save user info to localStorage for session management
          localStorage.setItem('user', JSON.stringify(data));
          navigate('/employee-dashboard');
        } else {
          setError(t("loginError"));
          toast.error(t("loginError"));
        }
      } else {
        // Registration validation
        // Check if passwords match
        if (password !== confirmPassword) {
          setError("Error: 00001 - 密码不一致");
          toast.error("Error: 00001 - 密码不一致");
          setLoading(false);
          return;
        }

        // Check if required fields are filled
        if (!fullName || !password) {
          setError("Error: 00004 - 信息不完整");
          toast.error("Error: 00004 - 信息不完整");
          setLoading(false);
          return;
        }

        // Check password length
        if (password.length < 6) {
          setError("Error: 00005 - 密码太短");
          toast.error("Error: 00005 - 密码太短");
          setLoading(false);
          return;
        }

        // Check if user already exists
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

        const { error, data } = await supabase
          .from('users')
          .insert([{
            full_name: fullName,
            password: password,
            // Add a default user_type for new registrations
            user_type: 'warehouse', // Default user type
          }])
          .select()
          .single();

        if (error) {
          // Handle specific Supabase errors
          if (error.code === '23505') { // Unique constraint violation
            setError("Error: 00003 - 用户已存在");
            toast.error("Error: 00003 - 用户已存在");
          } else if (error.code === '42501' || error.message.includes('policy')) { // Permission/policy error
            setError("Error: 00002 - 数据写入失败");
            toast.error("Error: 00002 - 数据写入失败");
          } else {
            // Generic error for all other cases
            setError("Error: 00099 - 系统异常");
            toast.error("Error: 00099 - 系统异常");
            console.error("Registration error details:", error);
          }
          throw error;
        }

        toast.success(t("registrationSuccess"));
        // Auto-login after registration
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
