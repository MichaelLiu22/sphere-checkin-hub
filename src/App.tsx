
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import Home from "./pages/Home";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import GuestPage from "./pages/GuestPage";
import AuthGuard from "./components/AuthGuard";

// 创建 QueryClient 实例，用于管理数据获取和缓存
const queryClient = new QueryClient();

/**
 * 应用程序主组件
 * 配置应用程序的全局提供者和路由
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 路由器提供整个应用的导航功能 */}
    <BrowserRouter>
      {/* 语言提供者负责应用的多语言支持 */}
      <LanguageProvider>
        {/* 认证提供者管理用户的登录状态 */}
        <AuthProvider>
          {/* 工具提示提供者为应用添加工具提示功能 */}
          <TooltipProvider>
            {/* 提供两种通知组件 */}
            <Toaster />
            <Sonner />
            {/* 应用路由配置 */}
            <Routes>
              {/* 公共路由 */}
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              
              {/* 受保护的员工路由 */}
              <Route path="/employee-dashboard" element={
                <AuthGuard allowedRoles={["employee"]}>
                  <EmployeeDashboard />
                </AuthGuard>
              } />
              
              {/* 受保护的管理员路由 */}
              <Route path="/admin-dashboard" element={
                <AuthGuard allowedRoles={["admin"]}>
                  <AdminDashboard />
                </AuthGuard>
              } />
              
              {/* 受保护的员工路由 */}
              <Route path="/staff-dashboard" element={
                <AuthGuard allowedRoles={["staff"]}>
                  <StaffDashboard />
                </AuthGuard>
              } />
              
              {/* 访客页面 */}
              <Route path="/guest" element={
                <AuthGuard allowedRoles={["visitor"]}>
                  <GuestPage />
                </AuthGuard>
              } />
              
              {/* 捕获所有未匹配路由的404页面 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
