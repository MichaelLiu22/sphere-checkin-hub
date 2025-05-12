
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              
              {/* Protected Admin Route */}
              <Route path="/admin-dashboard" element={
                <AuthGuard allowedRoles={["admin"]}>
                  <AdminDashboard />
                </AuthGuard>
              } />
              
              {/* Protected Staff Route */}
              <Route path="/staff-dashboard" element={
                <AuthGuard allowedRoles={["staff"]}>
                  <StaffDashboard />
                </AuthGuard>
              } />
              
              {/* Guest Page */}
              <Route path="/guest" element={
                <AuthGuard allowedRoles={["visitor"]}>
                  <GuestPage />
                </AuthGuard>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
