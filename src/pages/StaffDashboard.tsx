
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import WorkHours from "@/components/WorkHours";
import DocumentUpload from "@/components/DocumentUpload";
import DailyTasks from "@/components/DailyTasks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * StaffDashboard组件
 * 
 * 员工仪表板页面，显示员工可用的功能模块
 * 根据用户权限动态显示不同模块
 */
const StaffDashboard: React.FC = () => {
  // 导航钩子，用于页面跳转
  const navigate = useNavigate();
  // 认证上下文，获取当前用户和登出函数
  const { user, logout } = useAuth();
  
  // 特性状态管理
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 当用户信息变化时，更新特性状态
  useEffect(() => {
    if (user) {
      // 设置用户启用的模块
      setEnabledModules(user.enabled_modules || []);
      setLoading(false);
    } else {
      // 如果没有用户信息，重定向到登录页
      navigate("/");
    }
  }, [user, navigate]);
  
  /**
   * 处理登出事件
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("成功登出");
      navigate("/");
    } catch (error) {
      console.error("登出失败:", error);
      toast.error("登出失败");
    }
  };

  /**
   * 检查模块是否启用
   * @param moduleName 模块名称
   * @returns 模块是否启用
   */
  const isModuleEnabled = (moduleName: string): boolean => {
    return enabledModules.includes(moduleName);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        {/* 顶部欢迎信息和登出按钮 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">员工仪表板</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              欢迎，{user?.full_name || "员工"}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              登出
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* 工时管理模块 */}
            {isModuleEnabled("host_schedule") && (
              <Card>
                <CardHeader>
                  <CardTitle>主持人排班</CardTitle>
                  <CardDescription>查看和管理排班信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkHours userId={user?.id || ''} />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    查看更多详情
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* 财务模块 */}
            {isModuleEnabled("finance") && (
              <Card>
                <CardHeader>
                  <CardTitle>财务报表</CardTitle>
                  <CardDescription>上传和管理财务数据</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    查看财务报表
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* 任务管理模块 - 始终显示 */}
            <Card>
              <CardHeader>
                <CardTitle>每日任务</CardTitle>
                <CardDescription>查看和完成今日任务</CardDescription>
              </CardHeader>
              <CardContent>
                <DailyTasks userId={user?.id || ''} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  管理任务
                </Button>
              </CardFooter>
            </Card>
            
            {/* 如果没有启用任何特殊模块，显示提示信息 */}
            {enabledModules.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>权限通知</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    您目前没有访问高级模块的权限。请联系管理员启用更多功能。
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffDashboard;
